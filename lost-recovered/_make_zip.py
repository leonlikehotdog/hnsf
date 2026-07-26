import os
import zipfile

src_dir = r'd:\二战\hnsf\英语一'
dst_zip = r'd:\二战\hnsf\english1.zip'

if os.path.exists(dst_zip):
    os.remove(dst_zip)

index_html = os.path.join(src_dir, 'index.html')
mobile_dir = os.path.join(src_dir, 'mobile')

with zipfile.ZipFile(dst_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    # 把 index.html 放在 zip 根目录
    zf.write(index_html, arcname='index.html')
    # 把 mobile 目录下的所有文件放在 zip 根目录的 mobile/ 下
    for root, dirs, files in os.walk(mobile_dir):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, src_dir).replace('\\', '/')
            zf.write(full, arcname=rel)

print('打包完成:', dst_zip)
print('文件大小:', os.path.getsize(dst_zip), '字节')
print()
print('=== zip 内容（确认结构正确）===')
with zipfile.ZipFile(dst_zip, 'r') as zf:
    for info in zf.infolist():
        print(f'  {info.file_size:>10}  {info.filename}')