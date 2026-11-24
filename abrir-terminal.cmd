@echo off
chcp 65001 >nul
title Lunaria - terminal del proyecto
cd /d "%~dp0"
powershell -NoExit -NoLogo -Command "Set-Location -LiteralPath '%~dp0'; Write-Host ''; Write-Host '  Terminal abierta en la carpeta del proyecto Lunaria' -ForegroundColor Green; Write-Host '  Carpeta:' -ForegroundColor DarkGray; Write-Host ('  ' + (Get-Location).Path) -ForegroundColor White; Write-Host ''; Write-Host '  Prueba con:  git status' -ForegroundColor Cyan; Write-Host ''"
