@echo off
chcp 65001 >nul
REM 考研数学真题 RPA 启动脚本
echo ============================================
echo   考研数学真题 RPA 爬虫 (kmath.cn)
echo   模式: 按知识点刷题 / 按试卷刷题
echo ============================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] 没找到 Python
    pause
    exit /b 1
)

REM 检查 Playwright
python -c "import playwright" >nul 2>&1
if errorlevel 1 (
    echo [!] 安装 Playwright...
    pip install playwright
    python -m playwright install chromium
)

echo.
echo [i] 启动前请确认 crawl_kmath.py 中的配置:
echo     MODE = "point"  按知识点刷题
echo     MODE = "paper"  按试卷刷题
echo     HEADLESS = False  调试模式（能看到浏览器）
echo.

cd /d "%~dp0"
python crawl_kmath.py

echo.
echo ============================================
echo   完成！结果在 kmath_downloads\ 目录
echo ============================================
pause
