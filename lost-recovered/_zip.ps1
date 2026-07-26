$src = 'D:\二战\hnsf\英语一'
$dst = 'D:\二战\hnsf\english1.zip'
if (Test-Path $dst) { Remove-Item $dst -Force }
$indexHtml = Join-Path $src 'index.html'
$mobileDir = Join-Path $src 'mobile'
Compress-Archive -Path $indexHtml, $mobileDir -DestinationPath $dst
Write-Host '打包完成'
Write-Host '验证 zip 内容:'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($dst)
foreach ($entry in $zip.Entries) {
    Write-Host (' - ' + $entry.FullName)
}
$zip.Dispose()