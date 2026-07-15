#Requires -Version 5.1
<#
.SYNOPSIS
  Fetch an external URL, convert it to clean Markdown, and record provenance.

.DESCRIPTION
  Downloads the given URL, strips boilerplate (script/style/nav), converts the
  remaining HTML to Markdown, computes SHA256, writes the file under
  sources/pages/<slug>.md with a YAML front-matter block, and appends or
  updates a row in sources/_index.csv.

  Idempotent: re-running with the same -Slug updates the row in place. Hash
  drift is detected and reported, but the new row replaces the old (the
  previous SHA256 is preserved in the notes column).

.PARAMETER Url
  The URL to fetch.

.PARAMETER Slug
  Stable identifier used as the citation tag (e.g. "spec-transports") and as
  the filename under sources/pages/<slug>.md. Required.

.PARAMETER Tier
  Source tier 1-4. See CONTRIBUTING.md.

.PARAMETER License
  License string (e.g. "CC-BY-4.0", "MIT", "blog-fair-use", "unknown").

.PARAMETER Title
  Optional title override. If omitted, parsed from the page <title> tag.

.PARAMETER Author
  Optional author. If omitted, parsed from <meta name="author"> if present.

.PARAMETER Notes
  Optional free-text notes appended to the index row.

.EXAMPLE
  pwsh ./scripts/fetch-source.ps1 `
    -Url "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports" `
    -Slug spec-transports -Tier 1 -License "CC-BY-4.0"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $Url,
    [Parameter(Mandatory)] [string] $Slug,
    [ValidateRange(1,4)] [int] $Tier = 4,
    [string] $License = 'unknown',
    [string] $Title = '',
    [string] $Author = '',
    [string] $Notes = ''
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$sourcesDir = Join-Path $repoRoot 'sources'
$pagesDir   = Join-Path $sourcesDir 'pages'
$indexPath  = Join-Path $sourcesDir '_index.csv'

if (-not (Test-Path $pagesDir))   { New-Item -ItemType Directory -Force -Path $pagesDir | Out-Null }
if (-not (Test-Path $indexPath))  { 'slug,url,title,author,fetched_at,sha256,license,tier,local_path,notes' | Set-Content -Path $indexPath -Encoding UTF8 }

Write-Host "[fetch-source] GET $Url" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -UserAgent 'mcp-hosting-handbook/1.0 (+internal)'
$html = [string]$resp.Content

# Title fallback from <title>
if (-not $Title) {
    $titleMatch = [regex]::Match($html, '<title[^>]*>(?<t>[^<]*)</title>', 'IgnoreCase')
    if ($titleMatch.Success) { $Title = $titleMatch.Groups['t'].Value.Trim() }
}

# Author fallback from <meta name="author">
if (-not $Author) {
    $authorMatch = [regex]::Match($html, '<meta\s+name=["'']author["'']\s+content=["''](?<a>[^"'']+)["'']', 'IgnoreCase')
    if ($authorMatch.Success) { $Author = $authorMatch.Groups['a'].Value.Trim() }
}

# --- Minimal HTML -> Markdown converter -------------------------------------
# We avoid external deps (Pandoc, Node) to keep the script Windows-friendly.
# This is intentionally simple: strip boilerplate, keep headings, lists,
# code, links, and paragraphs. Good enough for evidence storage. The
# original is always retrievable via the URL on file.

function ConvertTo-CleanMarkdown {
    param([string] $RawHtml)

    $h = $RawHtml

    # Drop boilerplate sections wholesale
    $blockTags = @('script','style','noscript','svg','header','footer','nav','aside','form','iframe','button','dialog')
    foreach ($t in $blockTags) {
        $h = [regex]::Replace($h, "<$t\b[^>]*>.*?</$t>", '', 'IgnoreCase, Singleline')
        $h = [regex]::Replace($h, "<$t\b[^>]*/>", '', 'IgnoreCase')
    }

    # HTML comments
    $h = [regex]::Replace($h, '<!--.*?-->', '', 'Singleline')

    # Code blocks: <pre><code>...</code></pre> -> ```\n...\n```
    $h = [regex]::Replace($h, '<pre[^>]*>\s*<code[^>]*>(?<c>.*?)</code>\s*</pre>', {
        param($m)
        $code = $m.Groups['c'].Value
        $code = [System.Net.WebUtility]::HtmlDecode($code)
        "`n``````" + "`n" + $code.TrimEnd() + "`n" + '```' + "`n"
    }, 'Singleline')

    # Bare <pre>
    $h = [regex]::Replace($h, '<pre[^>]*>(?<c>.*?)</pre>', {
        param($m)
        $code = [System.Net.WebUtility]::HtmlDecode($m.Groups['c'].Value)
        "`n``````" + "`n" + $code.TrimEnd() + "`n" + '```' + "`n"
    }, 'Singleline')

    # Inline code
    $h = [regex]::Replace($h, '<code[^>]*>(?<c>.*?)</code>', {
        param($m)
        '`' + [System.Net.WebUtility]::HtmlDecode($m.Groups['c'].Value) + '`'
    }, 'Singleline')

    # Headings
    for ($i = 6; $i -ge 1; $i--) {
        $hashes = '#' * $i
        $h = [regex]::Replace($h, "<h$i[^>]*>(?<t>.*?)</h$i>", {
            param($m)
            "`n$hashes " + ([System.Net.WebUtility]::HtmlDecode(($m.Groups['t'].Value -replace '<[^>]+>',''))).Trim() + "`n"
        }, 'IgnoreCase, Singleline')
    }

    # Links: <a href="X">Y</a> -> [Y](X)
    $h = [regex]::Replace($h, '<a[^>]*href=["''](?<href>[^"''#][^"'']*)["''][^>]*>(?<text>.*?)</a>', {
        param($m)
        $text = ($m.Groups['text'].Value -replace '<[^>]+>','').Trim()
        if (-not $text) { $text = $m.Groups['href'].Value }
        '[' + [System.Net.WebUtility]::HtmlDecode($text) + '](' + $m.Groups['href'].Value + ')'
    }, 'IgnoreCase, Singleline')

    # Lists
    $h = [regex]::Replace($h, '<li[^>]*>(?<t>.*?)</li>', {
        param($m) "`n- " + ($m.Groups['t'].Value -replace '<[^>]+>','').Trim()
    }, 'IgnoreCase, Singleline')

    # Bold / italic
    $h = [regex]::Replace($h, '<(?:strong|b)[^>]*>(?<t>.*?)</(?:strong|b)>', '**${t}**', 'IgnoreCase, Singleline')
    $h = [regex]::Replace($h, '<(?:em|i)[^>]*>(?<t>.*?)</(?:em|i)>', '*${t}*', 'IgnoreCase, Singleline')

    # Paragraphs and breaks
    $h = [regex]::Replace($h, '</p\s*>', "`n`n", 'IgnoreCase')
    $h = [regex]::Replace($h, '<br\s*/?>', "`n", 'IgnoreCase')

    # Strip all remaining tags
    $h = [regex]::Replace($h, '<[^>]+>', '')

    # Decode entities and collapse whitespace
    $h = [System.Net.WebUtility]::HtmlDecode($h)
    $h = [regex]::Replace($h, '[ \t]+', ' ')
    $h = [regex]::Replace($h, '(\r?\n){3,}', "`n`n")

    return $h.Trim()
}

$markdown = ConvertTo-CleanMarkdown -RawHtml $html
$fetchedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

# Compute SHA256 of the body (post-conversion) so we detect content drift
# rather than incidental HTML changes.
$bytes = [System.Text.Encoding]::UTF8.GetBytes($markdown)
$sha   = [System.Security.Cryptography.SHA256]::Create()
$hash  = ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join ''

$frontMatter = @"
---
slug: $Slug
url: $Url
title: $($Title -replace '"','\"')
author: $($Author -replace '"','\"')
fetched_at: $fetchedAt
sha256: $hash
license: $License
tier: $Tier
---

"@

$pagePath = Join-Path $pagesDir "$Slug.md"
$prevHash = $null
if (Test-Path $pagePath) {
    $prev = Get-Content -Path $pagePath -Raw -Encoding UTF8
    $prevMatch = [regex]::Match($prev, 'sha256:\s*(?<h>[0-9a-f]+)')
    if ($prevMatch.Success) { $prevHash = $prevMatch.Groups['h'].Value }
}

Set-Content -Path $pagePath -Value ($frontMatter + $markdown) -Encoding UTF8

if ($prevHash -and $prevHash -ne $hash) {
    Write-Host "[fetch-source] DRIFT: $Slug content changed (prev=$prevHash new=$hash)" -ForegroundColor Yellow
    if (-not $Notes) { $Notes = "drift-from:$prevHash" }
    else             { $Notes = "$Notes; drift-from:$prevHash" }
}

# Update or append index row. We rewrite the whole CSV to keep it sorted.
$rows = @()
if (Test-Path $indexPath) {
    $existing = Import-Csv -Path $indexPath
    foreach ($r in $existing) {
        if ($r.slug -ne $Slug) { $rows += $r }
    }
}

$relPath = "sources/pages/$Slug.md"
$rows += [pscustomobject]@{
    slug       = $Slug
    url        = $Url
    title      = $Title
    author     = $Author
    fetched_at = $fetchedAt
    sha256     = $hash
    license    = $License
    tier       = $Tier
    local_path = $relPath
    notes      = $Notes
}

$rows = $rows | Sort-Object slug
$rows | Export-Csv -Path $indexPath -NoTypeInformation -Encoding UTF8

Write-Host "[fetch-source] OK $Slug -> $relPath  ($([math]::Round($markdown.Length/1KB,1)) KB, sha=$($hash.Substring(0,12))...)" -ForegroundColor Green
