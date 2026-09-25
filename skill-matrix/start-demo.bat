@echo off
echo Starting Ten10 Skills Matrix Platform...
cd /d "%~dp0frontend"
start http://localhost:3000
node server.js
pause
