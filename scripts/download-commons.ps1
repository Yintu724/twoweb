$ErrorActionPreference = 'Stop'

$outDir = Join-Path $PSScriptRoot '..\assets\anime'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$targets = @(
  @{ slug='naruto'; q='Naruto cosplay'; n=3; label='Naruto' },
  @{ slug='onepiece'; q='One Piece cosplay'; n=3; label='One Piece' },
  @{ slug='demonslayer'; q='Kimetsu no Yaiba cosplay'; n=3; label='Demon Slayer' },
  @{ slug='jujutsu'; q='Jujutsu Kaisen cosplay'; n=3; label='Jujutsu Kaisen' },
  @{ slug='aot'; q='Attack on Titan cosplay'; n=3; label='Attack on Titan' },
  @{ slug='mha'; q='My Hero Academia cosplay'; n=3; label='My Hero Academia' },
  @{ slug='spyfamily'; q='Spy x Family cosplay'; n=3; label='Spy x Family' },
  @{ slug='sailormoon'; q='Sailor Moon cosplay'; n=3; label='Sailor Moon' },
  @{ slug='pokemon'; q='Pokemon cosplay'; n=3; label='Pokemon' },
  @{ slug='eva'; q='Evangelion cosplay'; n=3; label='Evangelion' }
)

function Get-FirstPage($pagesObj) {
  return ($pagesObj.PSObject.Properties | Select-Object -First 1 | ForEach-Object { $_.Value })
}

function Get-ImageInfo([string]$fileTitle) {
  $u = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + [uri]::EscapeDataString($fileTitle) + '&prop=imageinfo&iiprop=url|size&format=json'
  $j = Invoke-RestMethod -Uri $u -Method Get
  $page = Get-FirstPage $j.query.pages
  if (!$page -or !$page.imageinfo) { return $null }
  return $page.imageinfo[0]
}

$downloaded = New-Object System.Collections.Generic.List[object]
$seen = @{}

foreach ($t in $targets) {
  $need = [int]$t.n
  $got = 0

  $sr = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=30&srsearch=' + [uri]::EscapeDataString($t.q) + '&format=json'
  $s = Invoke-RestMethod -Uri $sr -Method Get
  if (!$s -or !$s.query -or !$s.query.search) { continue }

  foreach ($r in $s.query.search) {
    if ($got -ge $need) { break }
    $title = $r.title
    if ($seen.ContainsKey($title)) { continue }

    $info = $null
    try { $info = Get-ImageInfo $title } catch { continue }
    if (!$info) { continue }

    $url = $info.url
    $size = [int64]$info.size
    if (!$url) { continue }
    if ($url -match '\.svg$') { continue }
    if ($size -gt 6000000) { continue }

    $ext = [IO.Path]::GetExtension(($url -split '\?')[0]).ToLowerInvariant()
    if ($ext -notin @('.jpg', '.jpeg', '.png', '.webp')) { continue }

    $idx = $got + 1
    $dest = Join-Path $outDir ("{0}-{1:D2}{2}" -f $t.slug, $idx, $ext)

    try {
      Invoke-WebRequest -Uri $url -OutFile $dest
      $seen[$title] = $true
      $downloaded.Add([pscustomobject]@{
        work = $t.label
        slug = $t.slug
        idx  = $idx
        file = (Split-Path $dest -Leaf)
        source = $title
      }) | Out-Null
      $got++
    } catch {
      continue
    }
  }
}

$manifestPath = Join-Path $outDir 'manifest.json'
$downloaded | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 $manifestPath

Write-Output ("OK downloaded=" + $downloaded.Count + " manifest=" + $manifestPath)

