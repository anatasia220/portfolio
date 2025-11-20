@echo off
echo ==============================
echo   GitHub Pages 安全一鍵部署
echo ==============================

:: --- 設定變數 ---
SET REPO_URL=https://github.com/anatasia220/portfolio.git
SET BRANCH=main

:: --- 顯示目前 Git 狀態 ---
git status
echo.

:: --- 先拉取遠端更新，避免衝突 ---
git pull origin %BRANCH% --rebase
IF ERRORLEVEL 1 (
    echo ⚠️ 遠端更新拉取失敗，請先解決衝突
    pause
    exit /b
)

:: --- 新增所有本地變更（包含新增/修改/刪除） ---
git add -A

:: --- 自動建立 commit 訊息 ---
set datetime=%date% %time%
git commit -m "Auto deploy on %datetime%"
IF ERRORLEVEL 1 (
    echo ⚠️ 沒有變更可提交
)

:: --- 推送到 GitHub ---
git push origin %BRANCH%
IF ERRORLEVEL 1 (
    echo ⚠️ 推送失敗，請檢查網路或權限
    pause
    exit /b
)

echo.
echo ==============================
echo   ✅ GitHub Pages 已完成部署
echo   網站網址：
echo   https://anatasia220.github.io/portfolio/
echo ==============================
pause
