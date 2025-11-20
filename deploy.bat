@echo off
REM ============================
REM 一鍵部署到 GitHub Pages
REM ============================

REM 設定 GitHub Repo
SET REPO_URL=https://github.com/anatasia220/portfolio.git
SET BRANCH=main

REM 初始化 Git (若還未初始化)
git init

REM 忽略 PDF & 暫存檔
echo PDF/ >> .gitignore
echo *.pdf >> .gitignore
echo node_modules/ >> .gitignore
echo Thumbs.db >> .gitignore
echo .DS_Store >> .gitignore

REM 新增檔案 & 提交
git add .
git commit -m "Deploy website (PDF via Release)"

REM 設定遠端
git remote remove origin
git remote add origin %REPO_URL%

REM 拉取遠端避免衝突
git pull origin %BRANCH% --allow-unrelated-histories

REM 推送
git push -u origin %BRANCH% --force

echo ============================
echo ✅ 部署完成
pause
