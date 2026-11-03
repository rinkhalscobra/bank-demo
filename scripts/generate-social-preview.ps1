param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\public\betashares-preview-20261013.png')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$logoPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public\logo.png'))
$canvasWidth = 1200
$canvasHeight = 630
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = [System.IO.Path]::GetDirectoryName($resolvedOutput)

if (-not [System.IO.Directory]::Exists($outputDirectory)) {
  [System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
}

$logo = [System.Drawing.Image]::FromFile($logoPath)
$canvas = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)

try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::FromArgb(250, 251, 253))

  $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 196, 34, 24))
  $graphics.FillEllipse($accentBrush, -150, -280, 720, 720)
  $graphics.FillEllipse($accentBrush, 830, 310, 520, 520)

  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(28, 11, 31, 51), 2)
  $graphics.DrawRectangle($borderPen, 24, 24, $canvasWidth - 49, $canvasHeight - 49)

  $logoWidth = 980
  $logoHeight = [int][Math]::Round($logo.Height * ($logoWidth / $logo.Width))
  $logoX = [int](($canvasWidth - $logoWidth) / 2)
  $logoY = 130
  $graphics.DrawImage($logo, $logoX, $logoY, $logoWidth, $logoHeight)

  $subtitleFont = New-Object System.Drawing.Font('Arial', 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $subtitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 11, 31, 51))
  $subtitle = 'Secure digital banking'
  $subtitleSize = $graphics.MeasureString($subtitle, $subtitleFont)
  $graphics.DrawString($subtitle, $subtitleFont, $subtitleBrush, (($canvasWidth - $subtitleSize.Width) / 2), 465)

  $domainFont = New-Object System.Drawing.Font('Arial', 19, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $domainBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 178, 35, 28))
  $domain = 'espbnk.vercel.app'
  $domainSize = $graphics.MeasureString($domain, $domainFont)
  $graphics.DrawString($domain, $domainFont, $domainBrush, (($canvasWidth - $domainSize.Width) / 2), 515)

  $canvas.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  if ($domainBrush) { $domainBrush.Dispose() }
  if ($domainFont) { $domainFont.Dispose() }
  if ($subtitleBrush) { $subtitleBrush.Dispose() }
  if ($subtitleFont) { $subtitleFont.Dispose() }
  if ($borderPen) { $borderPen.Dispose() }
  if ($accentBrush) { $accentBrush.Dispose() }
  $graphics.Dispose()
  $canvas.Dispose()
  $logo.Dispose()
}

Write-Output "Generated $resolvedOutput ($canvasWidth x $canvasHeight)"
