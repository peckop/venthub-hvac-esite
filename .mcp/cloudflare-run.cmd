@echo off
setlocal
REM Resolve path to local binary and call with required subcommand
call "%~dp0..\node_modules\.bin\mcp-server-cloudflare.CMD" run

