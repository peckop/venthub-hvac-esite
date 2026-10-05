@echo off
rem departman-kapat.cmd <Rol> [--kuru] - ince sarmalayici: ayni klasordeki departman-kapat.ps1'i cagirir (mantik orada + departman-kapat.cjs'te).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0departman-kapat.ps1" %*
exit /b %ERRORLEVEL%
