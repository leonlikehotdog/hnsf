# ============================================================
# MATH2 (302) - procedural background generator
# ------------------------------------------------------------
# Why generate instead of using the image API:
#   the text_to_image endpoint returns one fixed placeholder image
#   for every prompt/size (verified: 4 different prompts -> same MD5),
#   so it is unusable. Drawing in code is fully original + reproducible.
# Output:
#   <OutDir>/bg-map.jpg      map page  (soft violet lightning sky + grid floor)
#   <OutDir>/bg-battle.jpg   battle page (heavier storm + stronger grid)
# The page auto-detects these files; if missing it falls back to the
# procedural canvas background.
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads .ps1 as
# ANSI when there is no BOM, so non-ASCII comments can break parsing.
# ============================================================
param(
  [string]$OutDir = 'd:\TraeWorkSpace\hnsf\math2-assets'
)

Add-Type -AssemblyName System.Drawing

$W = 1920
$H = 1080
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)

function New-Glow {
  param($g, $cx, $cy, $r, $rr, $gg, $bb, $alpha)
  for ($i = 12; $i -ge 1; $i--) {
    $rad = $r * $i / 12
    $a = [int]($alpha * 255 * (1 - $i / 14))
    if ($a -le 0) { continue }
    $col = [System.Drawing.Color]::FromArgb($a, $rr, $gg, $bb)
    $br = New-Object System.Drawing.SolidBrush -ArgumentList @($col)
    $g.FillEllipse($br, ($cx - $rad), ($cy - $rad), ($rad * 2), ($rad * 2))
    $br.Dispose()
  }
}

function Add-Bolt {
  param($g, $rnd, $x0, $y0, $x1, $y1, $wid, $rr, $gg, $bb, $cr, $cg, $cb)
  $pts = New-Object System.Collections.ArrayList
  $seg = 16
  for ($i = 0; $i -le $seg; $i++) {
    $t = $i / $seg
    $px = $x0 + ($x1 - $x0) * $t
    $py = $y0 + ($y1 - $y0) * $t
    if ($i -gt 0 -and $i -lt $seg) {
      $jit = (1 - [math]::Abs($t - 0.5) * 2) * 140
      $px = $px + ($rnd.NextDouble() - 0.5) * $jit
    }
    [void]$pts.Add((New-Object System.Drawing.PointF([single]$px, [single]$py)))
  }
  $arr = $pts.ToArray()

  $c1 = [System.Drawing.Color]::FromArgb(55, $rr, $gg, $bb)
  $p1 = New-Object System.Drawing.Pen -ArgumentList @($c1, [single]($wid * 4))
  $p1.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawLines($p1, $arr)
  $p1.Dispose()

  $c2 = [System.Drawing.Color]::FromArgb(135, $rr, $gg, $bb)
  $p2 = New-Object System.Drawing.Pen -ArgumentList @($c2, [single]($wid * 1.6))
  $p2.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawLines($p2, $arr)
  $p2.Dispose()

  $c3 = [System.Drawing.Color]::FromArgb(235, $cr, $cg, $cb)
  $p3 = New-Object System.Drawing.Pen -ArgumentList @($c3, [single]$wid)
  $p3.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawLines($p3, $arr)
  $p3.Dispose()
}

function New-BgImage {
  param($Path, $Seed, $TopHex, $BotHex, $BoltCount, $GridAlpha, $GlyphAlpha, $Vig)

  $rnd = New-Object System.Random($Seed)
  $bmp = New-Object System.Drawing.Bitmap -ArgumentList @($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # 1) sky gradient
  $cTop = [System.Drawing.ColorTranslator]::FromHtml($TopHex)
  $cBot = [System.Drawing.ColorTranslator]::FromHtml($BotHex)
  $lg = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rect, $cTop, $cBot, [single]90)
  $g.FillRectangle($lg, $rect)
  $lg.Dispose()

  # 2) stars
  for ($i = 0; $i -lt 430; $i++) {
    $sx = $rnd.Next(0, $W)
    $sy = $rnd.Next(0, [int]($H * 0.70))
    $sa = $rnd.Next(30, 155)
    $sr = [single]($rnd.NextDouble() * 1.7 + 0.4)
    $sc = [System.Drawing.Color]::FromArgb($sa, 228, 232, 255)
    $sb = New-Object System.Drawing.SolidBrush -ArgumentList @($sc)
    $g.FillEllipse($sb, $sx, $sy, $sr, $sr)
    $sb.Dispose()
  }

  # 3) nebula glows (violet + cyan)
  New-Glow $g ($W * 0.22) ($H * 0.30) ($W * 0.42) 124 58 237 0.30
  New-Glow $g ($W * 0.80) ($H * 0.22) ($W * 0.34) 34 211 238 0.15
  New-Glow $g ($W * 0.60) ($H * 0.78) ($W * 0.46) 168 85 247 0.26

  # 4) distant mountain ridge (solid dark path + neon outstroke)
  $rgp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $rgp.AddLine(0, $H, 0, [single]($H * 0.70))
  $cx = 0.0
  $lastY = $H * 0.70
  while ($cx -lt $W) {
    $step = 60 + $rnd.NextDouble() * 140
    $nx = [math]::Min($W, $cx + $step)
    $ny = $H * (0.60 + $rnd.NextDouble() * 0.16)
    $rgp.AddLine([single]$cx, [single]$lastY, [single]$nx, [single]$ny)
    $lastY = $ny
    $cx = $nx
  }
  $rgp.AddLine([single]$W, [single]($H * 0.72), [single]$W, [single]$H)
  $rgp.CloseFigure()
  $rc = [System.Drawing.Color]::FromArgb(205, 12, 6, 32)
  $rb = New-Object System.Drawing.SolidBrush -ArgumentList @($rc)
  $g.FillPath($rb, $rgp)
  $rb.Dispose()
  $pc = [System.Drawing.Color]::FromArgb(95, 168, 85, 247)
  $rp = New-Object System.Drawing.Pen -ArgumentList @($pc, [single]2)
  $g.DrawPath($rp, $rgp)
  $rp.Dispose()
  $rgp.Dispose()

  # 5) perspective grid floor
  $horizon = $H * 0.72
  $vpx = $W * 0.5
  $gc = [System.Drawing.Color]::FromArgb([int]($GridAlpha * 255), 34, 211, 238)
  $gp = New-Object System.Drawing.Pen -ArgumentList @($gc, [single]1.4)
  for ($i = -14; $i -le 14; $i++) {
    $xe = $vpx + $i * ($W / 14)
    $g.DrawLine($gp, [single]$vpx, [single]$horizon, [single]$xe, [single]$H)
  }
  $gy = $horizon
  $k = 0
  while ($gy -lt $H) {
    $g.DrawLine($gp, [single]0, [single]$gy, [single]$W, [single]$gy)
    $k = $k + 1
    $gy = $gy + 6 * [math]::Pow(1.30, $k)
  }
  $gp.Dispose()

  # 6) lightning bolts
  for ($b = 0; $b -lt $BoltCount; $b++) {
    $sx0 = $rnd.Next([int]($W * 0.08), [int]($W * 0.92))
    $ex0 = $sx0 + ($rnd.NextDouble() - 0.5) * $W * 0.35
    $ey0 = $H * (0.44 + $rnd.NextDouble() * 0.34)
    $wid = 2.0 + $rnd.NextDouble() * 2.6
    Add-Bolt $g $rnd $sx0 (-20) $ex0 $ey0 $wid 139 92 246 245 243 255
    if ($rnd.NextDouble() -lt 0.7) {
      $bx = $sx0 + ($ex0 - $sx0) * 0.55
      $by = $ey0 * 0.60
      Add-Bolt $g $rnd $bx $by ($bx + ($rnd.NextDouble() - 0.5) * $W * 0.2) ($by + $H * 0.18) ($wid * 0.55) 124 58 237 224 231 255
    }
  }

  # 7) floating math glyphs
  #    codepoints: integral, sum, partial, lambda, sqrt, infinity, pi, nabla, approx, theta
  $codes = @(0x222B, 0x2211, 0x2202, 0x03BB, 0x221A, 0x221E, 0x03C0, 0x2207, 0x2248, 0x0398)
  $fams = @('Cambria Math', 'Times New Roman', 'Segoe UI Symbol')
  for ($i = 0; $i -lt 28; $i++) {
    $ch = [char]$codes[$rnd.Next(0, $codes.Count)]
    $fs = [single](26 + $rnd.NextDouble() * 80)
    $fam = $fams[$rnd.Next(0, $fams.Count)]
    $fnt = $null
    try {
      $fnt = New-Object System.Drawing.Font -ArgumentList @($fam, $fs, [System.Drawing.FontStyle]::Italic)
    } catch {
      $fnt = New-Object System.Drawing.Font -ArgumentList @('Times New Roman', $fs, [System.Drawing.FontStyle]::Italic)
    }
    $ga = [int]($GlyphAlpha * 255 * (0.35 + $rnd.NextDouble() * 0.65))
    $gcol = [System.Drawing.Color]::FromArgb($ga, 216, 180, 254)
    $gb = New-Object System.Drawing.SolidBrush -ArgumentList @($gcol)
    $gx = $rnd.Next(0, $W - 100)
    $gyy = $rnd.Next(0, [int]($H * 0.84))
    $g.DrawString([string]$ch, $fnt, $gb, [single]$gx, [single]$gyy)
    $gb.Dispose()
    $fnt.Dispose()
  }

  # 8) edge darkening (4 linear gradients; avoid PathGradientBrush pitfalls)
  $band = [int]($H * 0.34)
  $edge = [int]($Vig * 255)
  $topC = [System.Drawing.Color]::FromArgb($edge, 0, 0, 0)
  $clrC = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
  $topR = New-Object System.Drawing.Rectangle(0, 0, $W, $band)
  $tg = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($topR, $topC, $clrC, [single]90)
  $g.FillRectangle($tg, $topR)
  $tg.Dispose()
  $botR = New-Object System.Drawing.Rectangle(0, ($H - $band), $W, $band)
  $bg2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($botR, $clrC, $topC, [single]90)
  $g.FillRectangle($bg2, $botR)
  $bg2.Dispose()
  $lw = [int]($W * 0.26)
  $leftR = New-Object System.Drawing.Rectangle(0, 0, $lw, $H)
  $lg2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($leftR, $topC, $clrC, [single]0)
  $g.FillRectangle($lg2, $leftR)
  $lg2.Dispose()
  $rightR = New-Object System.Drawing.Rectangle(($W - $lw), 0, $lw, $H)
  $rg2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rightR, $clrC, $topC, [single]0)
  $g.FillRectangle($rg2, $rightR)
  $rg2.Dispose()

  # 9) final violet overlay to lower contrast (page adds its own gradient too)
  $oc1 = [System.Drawing.Color]::FromArgb(72, 8, 4, 24)
  $oc2 = [System.Drawing.Color]::FromArgb(42, 20, 8, 52)
  $ov = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rect, $oc1, $oc2, [single]90)
  $g.FillRectangle($ov, $rect)
  $ov.Dispose()

  $g.Dispose()

  # 10) save as JPEG q88
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList @(1)
  $q = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList @([System.Drawing.Imaging.Encoder]::Quality, [int64]88)
  $ep.Param[0] = $q
  $bmp.Save($Path, $codec, $ep)
  $q.Dispose()
  $ep.Dispose()
  $bmp.Dispose()
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

New-BgImage -Path (Join-Path $OutDir 'bg-map.jpg') -Seed 20260926 -TopHex '#07031a' -BotHex '#241452' -BoltCount 3 -GridAlpha 0.16 -GlyphAlpha 0.13 -Vig 0.80
New-BgImage -Path (Join-Path $OutDir 'bg-battle.jpg') -Seed 20260927 -TopHex '#0d0320' -BotHex '#3b0f7a' -BoltCount 6 -GridAlpha 0.30 -GlyphAlpha 0.20 -Vig 0.72

Write-Host 'generated bg-map.jpg and bg-battle.jpg'
