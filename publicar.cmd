@echo off
chcp 65001 >nul
title Lunaria - publicar en GitHub Pages
cd /d "%~dp0"

echo.
echo  =============================================================
echo   PUBLICAR LUNARIA EN GITHUB PAGES
echo  =============================================================
echo.
echo  Antes de continuar necesitas haber creado el repositorio:
echo.
echo    1. Abre https://github.com/new
echo    2. Nombre: lunaria   ^|  Visibilidad: Public
echo    3. NO marques README, .gitignore ni licencia
echo    4. Pulsa "Create repository"
echo    5. Copia la URL que aparece (boton HTTPS)
echo.
echo  Se ve asi:  https://github.com/TU-USUARIO/lunaria.git
echo.
set /p REPO= Pega la URL aqui y pulsa Enter: 

if "%REPO%"=="" (
  echo.
  echo  No escribiste ninguna URL. Cerrando.
  pause
  exit /b 1
)

echo.
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" -RepoUrl "%REPO%"

echo.
echo  Si todo salio bien, activa GitHub Pages una sola vez:
echo    Settings  ^>  Pages  ^>  Deploy from a branch  ^>  main  ^>  / (root)  ^>  Save
echo.
pause
