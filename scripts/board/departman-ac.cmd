@echo off
rem departman-ac.cmd <Rol> [--kuru] - ince sarmalayici: ayni klasordeki departman-ac.ps1'i cagirir (mantik orada + departman-ac.cjs'te).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0departman-ac.ps1" %*
exit /b %ERRORLEVEL%
