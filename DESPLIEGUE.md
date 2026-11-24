# Cómo publicar Lunaria en GitHub Pages

Guía paso a paso para subir este sitio (estático, sin backend) a GitHub Pages
y obtener una URL pública tipo `https://tu-usuario.github.io/lunaria/`.

> El proyecto ya viene preparado: `.nojekyll`, `404.html` con la identidad de la marca,
> `.gitignore` y un script `deploy.ps1` que hace casi todo. Solo faltan tu cuenta y tus datos.

## Atajo: dos archivos que te evitan escribir comandos

En la carpeta del proyecto hay dos accesos directos (doble clic):

| Archivo | Qué hace |
|---|---|
| **`abrir-terminal.cmd`** | Abre PowerShell **ya ubicada** en la carpeta del proyecto |
| **`publicar.cmd`** | Te pide la URL del repositorio y ejecuta commit + push por ti |

Con `publicar.cmd` puedes saltarte los pasos 2, 4 y 6 de esta guía la primera vez.
Si prefieres entender qué pasa por dentro, sigue la guía con la terminal abierta.

---

## Antes de empezar

| Requisito | Cómo comprobarlo |
|---|---|
| Cuenta de GitHub | https://github.com/signup (gratis) |
| Git instalado | `git --version` en PowerShell |
| Repositorio **público** | GitHub Pages gratis no publica repos privados |

Decide el nombre del repositorio. Recomendado: **`lunaria`** o **`calzadoweb`**.
Ese nombre aparece en la URL final, así que evita mayúsculas, espacios y tildes.

---

## Paso 1 · Configura tu identidad en Git (una sola vez)

Abre PowerShell y ejecuta, con tus datos reales:

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

> Usa el mismo correo con el que te registraste en GitHub para que los commits te
> aparezcan como tuyos.

Comprueba:

```powershell
git config --global user.name
git config --global user.email
```

---

## Paso 2 · Prepara el repositorio local

Entra a la carpeta del proyecto:

```powershell
cd C:\Users\angello\Documents\calzadoweb
```

Si todavía no es un repositorio, inicialízalo en la rama `main`:

```powershell
git init -b main
git add -A
git commit -m "Sitio Lunaria: moda fresca, reel, WhatsApp y chatbot"
```

Comprueba que quedó bien:

```powershell
git status
git log --oneline
```

Debe aparecer un commit y ningún archivo pendiente (puede que `git status` muestre
la rama `main` sin remoto; es normal).

---

## Paso 3 · Crea el repositorio en GitHub

1. Entra a https://github.com/new
2. **Repository name:** `lunaria`
3. **Description:** `Tienda de calzado femenino · sitio estático`
4. Visibilidad: **Public**
5. **No** marques “Add a README file”, ni `.gitignore`, ni licencia
   (el proyecto ya los tiene; si los añades, el primer push choca).
6. Pulsa **Create repository**.

GitHub te mostrará una página con comandos. Quédate con la URL, que se ve así:

```
https://github.com/TU-USUARIO/lunaria.git
```

---

## Paso 4 · Sube el proyecto

### Opción A · Con el script incluido (recomendada)

```powershell
cd C:\Users\angello\Documents\calzadoweb
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -RepoUrl https://github.com/TU-USUARIO/lunaria.git
```

El script verifica Git, crea el commit, configura el remoto `origin`, hace el push
y te muestra la URL final de Pages. Si vuelves a ejecutarlo más adelante, sirve para
publicar cambios nuevos.

### Opción B · A mano

```powershell
cd C:\Users\angello\Documents\calzadoweb
git remote add origin https://github.com/TU-USUARIO/lunaria.git
git branch -M main
git push -u origin main
```

### Autenticación (lo que suele fallar aquí)

GitHub ya no acepta tu contraseña normal por HTTPS. Cuando `git push` pida credenciales:

- **La forma más simple:** se abre una ventana del navegador (Git Credential Manager)
  y autorizas con tu cuenta. Listo.
- **Con token manual:** crea un token en
  https://github.com/settings/tokens → *Generate new token (classic)* → marca el permiso
  **`repo`** → copia el token y úsalo como contraseña (tu usuario es el de GitHub).
  Guárdalo, no se vuelve a mostrar.
- **Con SSH** (si ya tienes llave configurada):

  ```powershell
  git remote set-url origin git@github.com:TU-USUARIO/lunaria.git
  git push -u origin main
  ```

✅ Si el push funcionó, al recargar la página del repositorio verás los 56 archivos
(incluido `index.html` y la carpeta `assets/video`).

---

## Paso 5 · Activa GitHub Pages

> **Importante en este repositorio:** ya está publicado con **GitHub Actions** mediante
> el archivo `.github/workflows/pages.yml`. Ese flujo habilita Pages solo y publica en cada
> `push`. Si lo tienes así, **no cambies la fuente a “Deploy from a branch”**: romperías el
> despliegue automático. Salta al Paso 6 y usa la pestaña **Actions** para ver el estado.

Si empiezas un repositorio desde cero y prefieres el método clásico:

1. En el repositorio, entra a **Settings** (arriba a la derecha).
2. Menú izquierdo → **Pages**.
3. En **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Pulsa **Save**.

No hace falta configurar build ni comandos: el sitio es HTML, CSS y JavaScript puro.

> La primera publicación tarda entre **1 y 3 minutos**. Verás un aviso amarillo
> “Your site is being deployed” y luego la URL en verde.

---

## Paso 6 · Abre tu sitio

La URL depende del nombre del repositorio:

| Escenario | URL |
|---|---|
| Repositorio `lunaria` | `https://TU-USUARIO.github.io/lunaria/` |
| Repositorio `TU-USUARIO.github.io` | `https://TU-USUARIO.github.io/` |

Comprueba que funcionen estas rutas:

- `.../lunaria/` → portada con el video
- `.../lunaria/tienda.html` → catálogo con filtros
- `.../lunaria/producto.html?id=perla` → ficha
- `.../lunaria/carrito.html` → carrito y checkout
- `.../lunaria/guia-de-tallas.html` → guía
- `.../lunaria/politicas.html` → legales
- Una URL inventada, por ejemplo `.../lunaria/loquesea` → debe mostrar el 404 de Lunaria


---

## Paso 7 · Actualiza el sitio más adelante

Cada vez que cambies algo:

```powershell
cd C:\Users\angello\Documents\calzadoweb
git add -A
git commit -m "Describe el cambio"
git push
```

GitHub Pages vuelve a publicar en 1–2 minutos. Si no ves el cambio, recarga con
`Ctrl + F5` (caché del navegador).

---

## Paso 8 · Opcional: dominio propio y HTTPS

Si compras un dominio (por ejemplo `lunaria.co`):

1. **Settings → Pages → Custom domain** → escribe `www.lunaria.co` → **Save**.
   Esto crea un archivo `CNAME` en el repositorio; no lo borres.
2. En tu proveedor de DNS crea:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | CNAME | `www` | `TU-USUARIO.github.io` |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

3. Espera la propagación (puede tardar hasta 24 h, normalmente minutos).
4. Marca **Enforce HTTPS**. GitHub emite el certificado automáticamente.

---

## Paso 9 · Alternativa: publicar con GitHub Actions

Si prefieres que cada push dispare un despliegue controlado, crea el archivo
`.github/workflows/pages.yml` con:

```yaml
name: Publicar en GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

Después, en **Settings → Pages → Source**, elige **GitHub Actions** (no “Deploy from a branch”).
Con el método del Paso 5 no necesitas este archivo; usa uno u otro, no ambos.

---

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| La URL da **404** | Pages todavía no terminó (espera 2–3 min) o la rama/carpeta no es `main` / `(root)`. Revisa **Settings → Pages**. |
| La página carga sin estilos ni fotos | Suele ser caché: `Ctrl + F5`. Si persiste, revisa que `assets/` se haya subido (mira el repo en GitHub). |
| Enlaces internos rotos | GitHub distingue mayúsculas. Los archivos del sitio están en minúsculas; mantén ese estándar al añadir imágenes. |
| “Repository not found” al hacer push | URL mal escrita o sin permisos. Comprueba con `git remote -v`. |
| Pide usuario y contraseña en bucle | Usa un **token** como contraseña (Paso 4) o cambia a SSH. |
| El video no se reproduce | Verifica que `assets/video/lunaria-reel.mp4` exista en el repo. Pesa 2,2 MB, muy por debajo del límite. |
| `git push` rechazado (non-fast-forward) | El repo remoto ya tenía commits (por ejemplo un README inicial). Ejecuta `git pull --rebase origin main` y vuelve a subir. |
| El 404 se ve sin estilos | El `404.html` es autocontenido; si lo editas, conserva el CSS en línea. |

---

## Límites de GitHub Pages (plan gratuito)

- Repositorio público de hasta **1 GB**; este proyecto ocupa ~7,5 MB.
- **100 GB** de tráfico al mes y **10 compilaciones por hora** (somos estáticos, no hay build).
- Sin backend, sin base de datos y sin envío de correos: el checkout y el popup son
  demostración. Para cobrar de verdad hay que conectar una pasarela (ver `README.md`).
- HTTPS incluido en `*.github.io` y en dominios propios verificados.

---

## Checklist final

- [ ] Identidad de Git configurada.
- [ ] Repositorio creado en GitHub como **público**.
- [ ] `git push -u origin main` sin errores.
- [ ] **Settings → Pages**: `main` + `/ (root)` + Save.
- [ ] Sitio abierto en `https://TU-USUARIO.github.io/lunaria/`.
- [ ] Video, catálogo, carrito y chatbot probados en la URL pública.
- [ ] Número de WhatsApp reemplazado en `assets/js/data.js` (hoy es de ejemplo).
- [ ] (Opcional) Dominio propio + Enforce HTTPS.

---

## Resumen en 6 comandos

```powershell
cd C:\Users\angello\Documents\calzadoweb
git init -b main
git add -A
git commit -m "Sitio Lunaria"
git remote add origin https://github.com/TU-USUARIO/lunaria.git
git push -u origin main
```

Y luego, en GitHub: **Settings → Pages → Deploy from a branch → main / (root) → Save**.
