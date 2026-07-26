import subprocess
text = open(r'd:\TraeWorkSpace\hnsf\数学一\js\zhenti.js', encoding='utf-8').read()
r = subprocess.run(['node', '--check', '-'], input=text.encode('utf-8'), capture_output=True, timeout=30)
print('stdout:', r.stdout.decode('utf-8', errors='replace')[:500])
print('stderr:', r.stderr.decode('utf-8', errors='replace')[:2000])
print('returncode:', r.returncode)
