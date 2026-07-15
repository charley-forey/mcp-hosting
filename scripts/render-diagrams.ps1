#Requires -Version 5.1
<#
.SYNOPSIS
  Render every .mmd file in diagrams/ to .svg and .png.

.DESCRIPTION
  Wraps the Mermaid CLI (`mmdc`). Install with:
    npm install -g @mermaid-js/mermaid-cli

  If `mmdc` is not on PATH, the script prints an install hint and exits 0
  so it's safe to run in environments that don't have Node installed (the
  Mermaid sources in the docs themselves render fine in GitHub/GitLab).
#>

[CmdletBinding()]
param(
    [string] $OutputFormat = 'both', # svg | png | both
    [string] $Theme        = 'neutral'
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$diagrams   = Join-Path $repoRoot 'diagrams'

if (-not (Test-Path $diagrams)) {
    Write-Host "[render-diagrams] diagrams/ not found, nothing to do." -ForegroundColor Yellow
    exit 0
}

$mmdc = Get-Command mmdc -ErrorAction SilentlyContinue
if (-not $mmdc) {
    Write-Host "[render-diagrams] mmdc not on PATH. Install: npm install -g @mermaid-js/mermaid-cli" -ForegroundColor Yellow
    Write-Host "[render-diagrams] Skipping render. Mermaid sources in docs/*.md will still render in GitHub/GitLab." -ForegroundColor Yellow
    exit 0
}

$formats = @()
switch ($OutputFormat) {
    'svg'  { $formats = @('svg') }
    'png'  { $formats = @('png') }
    'both' { $formats = @('svg','png') }
    default { Write-Error "Unknown -OutputFormat '$OutputFormat'. Use svg | png | both."; exit 2 }
}

Get-ChildItem -Path $diagrams -Filter '*.mmd' | ForEach-Object {
    $src = $_.FullName
    foreach ($fmt in $formats) {
        $out = [System.IO.Path]::ChangeExtension($src, ".$fmt")
        Write-Host "[render-diagrams] $($_.Name) -> $([System.IO.Path]::GetFileName($out))" -ForegroundColor Cyan
        & mmdc -i $src -o $out -t $Theme -b transparent
    }
}

Write-Host "[render-diagrams] done." -ForegroundColor Green
