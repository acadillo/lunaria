<#
.SYNOPSIS
    Prepara el proyecto y lo sube a GitHub para publicarlo con GitHub Pages.

.DESCRIPTION
    - Inicializa el repositorio si aún no existe (rama main).
    - Verifica la identidad de Git.
    - Crea el commit con todos los archivos.
    - Configura el remoto "origin" y hace push.
    - Muestra la URL esperada de GitHub Pages.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -RepoUrl https://github.com/mi-usuario/lunaria.git

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -RepoUrl git@github.com:mi-usuario/lunaria.git -Mensaje "Primera versión"
#>
param(
    [Parameter(Mandatory = $true, HelpMessage = "URL del repositorio en GitHub (HTTPS o SSH)")]
    [string]$RepoUrl,

    [string]$Mensaje = "Actualización del sitio",

    [string]$Rama = "main"
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Escribir($texto, $color = "Cyan") {
    Write-Host $texto -ForegroundColor $color
}

Escribir "`n=== Lunaria · despliegue a GitHub Pages ===`n"

# 1. Git disponible
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git no está instalado. Descárgalo en https://git-scm.com/download/win y vuelve a intentarlo."
}
Escribir "Git: $(git --version)"

# 2. Repositorio local
if (-not (Test-Path ".git")) {
    Escribir "Creando repositorio local en la rama $Rama…"
    git init -b $Rama | Out-Null
} else {
    Escribir "El repositorio local ya existe."
    $ramaActual = git rev-parse --abbrev-ref HEAD
    if ($ramaActual -ne $Rama) {
        Escribir "Cambiando de rama $ramaActual a $Rama…" "Yellow"
        git checkout -B $Rama | Out-Null
    }
}

# 3. Identidad de Git
$nombre = git config user.name
$correo = git config user.email

if (-not $nombre -or -not $correo) {
    Escribir "`nFalta configurar tu identidad de Git." "Yellow"
    Escribir 'Ejecuta esto una sola vez y vuelve a correr el script:' "Yellow"
    Escribir '  git config --global user.name "Tu Nombre"' "White"
    Escribir '  git config --global user.email "tu-correo@ejemplo.com"' "White"
    throw "Identidad de Git sin configurar."
}

Escribir "Autor de los commits: $nombre <$correo>"

# 4. Commit
git add -A
$cambios = git status --porcelain
if ($cambios) {
    Escribir "Creando commit: $Mensaje"
    git commit -m $Mensaje | Out-Null
} else {
    Escribir "No hay cambios nuevos para confirmar."
}

# 5. Remoto
$remoto = git remote
if ($remoto -contains "origin") {
    Escribir "Actualizando la URL del remoto origin…"
    git remote set-url origin $RepoUrl
} else {
    Escribir "Agregando el remoto origin…"
    git remote add origin $RepoUrl
}

# 6. Push
Escribir "`nSubiendo a GitHub (puede pedirte usuario y token)…"
git push -u origin $Rama

# 7. URL esperada
$urlLimpia = $RepoUrl -replace "\.git$", "" -replace ":", "/"
if ($urlLimpia -match "github\.com/([^/]+)/([^/]+)$") {
    $usuario = $Matches[1]
    $repo = $Matches[2]
    if ($repo -ieq "$usuario.github.io") {
        $sitio = "https://$usuario.github.io/"
    } else {
        $sitio = "https://$usuario.github.io/$repo/"
    }
    Escribir "`nListo. Último paso (solo la primera vez):" "Green"
    Escribir "  1. Abre https://github.com/$usuario/$repo/settings/pages" "White"
    Escribir "  2. En 'Build and deployment' elige: Source = Deploy from a branch" "White"
    Escribir "  3. Branch = $Rama · Folder = / (root) · Save" "White"
    Escribir "  4. Espera 1-2 minutos y abre: $sitio" "White"
}
Escribir "`nHecho.`n" "Green"
