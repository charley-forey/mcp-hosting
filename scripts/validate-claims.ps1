#Requires -Version 5.1
<#
.SYNOPSIS
  Lint citation tags in docs/ against sources/_index.csv.

.DESCRIPTION
  Walks every .md file under docs/ and extracts every [src: <id>] tag
  (comma-separated lists supported). Verifies that each <id> resolves to a
  row in sources/_index.csv.

  Errors:
    - Unknown citation slug.
    - local_path missing on disk.

  Warnings:
    - fetched_at older than -MaxAgeDays (default 365).
    - Source row not cited anywhere in docs/.

.PARAMETER MaxAgeDays
  Recency gate. Sources older than this trigger a warning. Default 365.

.EXAMPLE
  pwsh ./scripts/validate-claims.ps1
  pwsh ./scripts/validate-claims.ps1 -MaxAgeDays 180
#>

[CmdletBinding()]
param(
    [int] $MaxAgeDays = 365
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$docsDir    = Join-Path $repoRoot 'docs'
$sourcesDir = Join-Path $repoRoot 'sources'
$indexPath  = Join-Path $sourcesDir '_index.csv'

if (-not (Test-Path $indexPath)) {
    Write-Error "Index not found: $indexPath"
    exit 2
}
if (-not (Test-Path $docsDir)) {
    Write-Error "Docs directory not found: $docsDir"
    exit 2
}

$index = Import-Csv -Path $indexPath
$known = @{}
foreach ($r in $index) { $known[$r.slug] = $r }

$errors   = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]
$citedSlugs = @{}

$pattern = '\[src:\s*(?<ids>[a-z0-9_,\s\-]+)\]'

Get-ChildItem -Path $docsDir -Recurse -Filter '*.md' | ForEach-Object {
    $file  = $_
    $text  = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $lines = $text -split "`r?`n"

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $matches = [regex]::Matches($line, $pattern)
        foreach ($m in $matches) {
            $ids = $m.Groups['ids'].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            foreach ($id in $ids) {
                $citedSlugs[$id] = $true
                if (-not $known.ContainsKey($id)) {
                    $errors.Add("$($file.FullName):$($i+1): unknown citation slug '$id'") | Out-Null
                    continue
                }
                $row = $known[$id]
                $localPath = Join-Path $repoRoot $row.local_path
                if (-not (Test-Path $localPath)) {
                    $errors.Add("$($file.FullName):$($i+1): citation '$id' -> $($row.local_path) (file missing)") | Out-Null
                }
            }
        }
    }
}

# Recency and orphan checks against the index
$now = Get-Date
foreach ($r in $index) {
    $fetched = $null
    try {
        $fetched = [datetime]::Parse($r.fetched_at, [System.Globalization.CultureInfo]::InvariantCulture)
    } catch { $fetched = $null }
    if ($fetched) {
        $age = ($now - $fetched.ToLocalTime()).TotalDays
        if ($age -gt $MaxAgeDays) {
            $warnings.Add("recency: '$($r.slug)' fetched $([int]$age) days ago (limit $MaxAgeDays). Re-run fetch-source.ps1.") | Out-Null
        }
    } else {
        $warnings.Add("recency: '$($r.slug)' has unparseable fetched_at='$($r.fetched_at)'") | Out-Null
    }

    if (-not $citedSlugs.ContainsKey($r.slug)) {
        $warnings.Add("orphan: '$($r.slug)' is in the index but never cited in docs/") | Out-Null
    }
}

Write-Host ""
Write-Host "Citation validation report" -ForegroundColor Cyan
Write-Host "  index size : $($index.Count) sources"
Write-Host "  cited     : $($citedSlugs.Count) unique slugs"
Write-Host "  errors    : $($errors.Count)"
Write-Host "  warnings  : $($warnings.Count)"
Write-Host ""

foreach ($w in $warnings) { Write-Host "WARN  $w" -ForegroundColor Yellow }
foreach ($e in $errors)   { Write-Host "ERROR $e" -ForegroundColor Red }

if ($errors.Count -gt 0) { exit 1 }
exit 0
