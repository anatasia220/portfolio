@echo off
echo ==============================
echo   GitHub Pages 一鍵部署開始
echo ==============================

:: 建立 .gitignore（如果不存在）
if not exist .gitignore (
    echo # Ignore PDFs > .gitignore
    echo *.pdf >> .gitignore

    echo # Ignore temp files >> .gitignore
    echo *.tmp >> .gitignore
    echo *.log >> .gitignore

    echo # Ignore system files >> .gitignore
    echo .DS_Store >> .gitignore
    echo Thumbs.db >> .gitignore

    echo 已建立 .gitignore
)

:: Git 狀態
echo.
git status
echo.

:: 加入所有變更
git add .

:: 自動建立 commit 訊息（附時間）
set datetime=%date% %time%
git commit -m "Auto deploy on %datetime%"

:: 推送到 GitHub main 分支
git push origin main

echo.
echo ==============================
echo   🚀 GitHub Pages 已完成部署
echo   網站網址：
echo   https://anatasia220.github.io/portfolio/
echo ==============================
pause
