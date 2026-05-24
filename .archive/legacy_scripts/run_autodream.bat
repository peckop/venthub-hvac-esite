@echo off
set PYTHONIOENCODING=utf-8
chcp 65001 >nul
cd /d "c:\Users\alize\venthub-hvac"
echo [%date% %time%] autoDream baslatiliyor... >> scripts\task.log
python scripts\auto_dream.py >> scripts\task.log 2>&1
echo [%date% %time%] Bitti. Cikis Kodu: %errorlevel% >> scripts\task.log
