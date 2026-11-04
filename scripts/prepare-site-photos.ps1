param(
  [Parameter(Mandatory = $true)][string]$ManifestPath,
  [Parameter(Mandatory = $true)][string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assets = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$outputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
if (-not (Test-Path -LiteralPath $outputPath)) { New-Item -ItemType Directory -Path $outputPath | Out-Null }
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$results = @()

foreach ($asset in $assets) {
  if ($asset.name -notmatch '^[a-z0-9-]+$') { throw 'Invalid asset name.' }
  $source = [System.Drawing.Image]::FromFile($asset.source)
  try {
    foreach ($variant in @(@{ suffix = ''; width = $source.Width }, @{ suffix = '-768'; width = [Math]::Min(768, $source.Width) })) {
      $imagePath = Join-Path $outputPath ($asset.name + $variant.suffix + '.jpg')
      if (Test-Path -LiteralPath $imagePath) { continue }
      $width = [int]$variant.width
      $height = [int][Math]::Round($source.Height * $width / $source.Width)
      $bitmap = New-Object System.Drawing.Bitmap($width, $height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]86)
        $bitmap.Save($imagePath, $jpegEncoder, $parameters)
      } finally { $parameters.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
    }
    $results += [pscustomobject]@{ key = $asset.key; name = $asset.name; width = $source.Width; height = $source.Height; bytes = (Get-Item -LiteralPath (Join-Path $outputPath ($asset.name + '.jpg'))).Length }
  } finally { $source.Dispose() }
}
$results | ConvertTo-Json -Compress
