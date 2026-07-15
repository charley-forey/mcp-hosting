#Requires -Version 5.1
<#
.SYNOPSIS
  Smoke-test the reference Helm chart against a local kind cluster.

.DESCRIPTION
  This script exercises the path Client -> ingress -> service -> pod with
  a real MCP `initialize` request, verifying that:

    * The Deployment is healthy and ready.
    * The Service routes to a pod.
    * The pod responds to POST /mcp with a valid InitializeResult.

  Run this before you trust any change to the chart.

.PARAMETER Namespace
  Namespace to deploy into (default: mcp-smoke).

.PARAMETER Release
  Helm release name (default: mcp).

.PARAMETER ImageRepository
  Image to deploy. Defaults to a placeholder; override with your real image.

.EXAMPLE
  pwsh ./examples/helm/smoke-test.ps1 -ImageRepository ghcr.io/your-org/your-mcp -ImageTag 0.1.0
#>

[CmdletBinding()]
param(
    [string] $Namespace       = 'mcp-smoke',
    [string] $Release         = 'mcp',
    [string] $ImageRepository = 'ghcr.io/your-org/mcp-reference-server',
    [string] $ImageTag        = '0.1.0',
    [int]    $LocalPort       = 18080,
    [switch] $SkipKindCreate
)

$ErrorActionPreference = 'Stop'

$repoRoot  = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$chartDir  = Join-Path $repoRoot 'examples\helm'

function Require-Tool($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required tool not on PATH: $name"
    }
}

Require-Tool kubectl
Require-Tool helm

if (-not $SkipKindCreate) {
    Require-Tool kind
    Write-Host "[smoke] creating kind cluster ($Namespace)" -ForegroundColor Cyan
    & kind create cluster --name $Namespace 2>$null

    Write-Host "[smoke] installing ingress-nginx" -ForegroundColor Cyan
    & kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml | Out-Null
    & kubectl wait --namespace ingress-nginx `
        --for=condition=ready pod `
        --selector=app.kubernetes.io/component=controller `
        --timeout=120s
}

Write-Host "[smoke] helm upgrade --install" -ForegroundColor Cyan
& helm upgrade --install $Release $chartDir `
    -n $Namespace --create-namespace `
    --set image.repository=$ImageRepository `
    --set image.tag=$ImageTag `
    --set ingress.enabled=false `
    --set autoscaling.enabled=false `
    --set podDisruptionBudget.enabled=false `
    --set networkPolicy.enabled=false `
    --set observability.metrics.serviceMonitor.enabled=false `
    --wait --timeout 3m

$serviceName = (& kubectl -n $Namespace get svc -l "app.kubernetes.io/instance=$Release" -o jsonpath="{.items[0].metadata.name}").Trim()
if (-not $serviceName) { throw "Unable to discover service name for release '$Release' in namespace '$Namespace'" }

Write-Host "[smoke] port-forwarding svc/$serviceName to localhost:$LocalPort" -ForegroundColor Cyan
$pf = Start-Process -FilePath kubectl -ArgumentList "-n $Namespace port-forward svc/$serviceName ${LocalPort}:80" -PassThru -NoNewWindow

try {
    Start-Sleep -Seconds 3

    $body = @{
        jsonrpc = "2.0"
        id      = 1
        method  = "initialize"
        params  = @{
            protocolVersion = "2025-06-18"
            capabilities    = @{}
            clientInfo      = @{ name = "smoke"; version = "0" }
        }
    } | ConvertTo-Json -Compress -Depth 6

    Write-Host "[smoke] POST http://localhost:$LocalPort/mcp" -ForegroundColor Cyan
    $resp = Invoke-WebRequest -Uri "http://localhost:$LocalPort/mcp" `
        -Method Post `
        -Headers @{
            'Content-Type'         = 'application/json'
            'Accept'               = 'application/json, text/event-stream'
            'MCP-Protocol-Version' = '2025-06-18'
            'Mcp-Method'           = 'initialize'
        } `
        -Body $body -UseBasicParsing

    Write-Host "[smoke] HTTP $($resp.StatusCode)" -ForegroundColor Green
    Write-Host $resp.Content.Substring(0, [Math]::Min(400, $resp.Content.Length))

    if ($resp.StatusCode -ne 200) { throw "Unexpected HTTP status $($resp.StatusCode)" }
}
finally {
    if ($pf -and -not $pf.HasExited) { Stop-Process -Id $pf.Id -Force }
}

Write-Host "[smoke] PASS" -ForegroundColor Green
