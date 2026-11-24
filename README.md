# LUNARIA · Moda fresca en calzado femenino

Tienda online funcional para una boutique de calzado femenino, con estética
**Moda fresca**: paleta ácida, tipografía bold, tarjetas redondeadas, stickers
y un reel de presentación generado con los modelos reales del catálogo.

Sitio **estático**: no necesita build ni servidor. Abre `index.html` y funciona.

---

## 1. La marca

| | |
|---|---|
| **Nombre** | Lunaria |
| **Slogan** | El arte de caminar bonito |
| **Categoría** | Calzado femenino en pequeños lotes |
| **Ciudad** | Medellín, Colombia |
| **Público** | Mujeres de 25 a 45 años que compran por ocasión y valoran comodidad real |
| **Promesa** | Hormas medidas sobre pies reales y una guía de tallas que funciona |

La historia sigue igual: nació en 2019 de una libreta donde dos hermanas anotaban
medidas de plantillas. Lo que cambió es la actitud visual: pasó de boutique editorial
a **moda fresca**, más urbana, más color, más movimiento.

---

## 2. Estilo “Moda fresca”

- **Paleta:** crema `#FFFCF4`, tinta `#0E0E10`, lima ácida `#DFFF3B`, azul eléctrico
  `#2B3BFF`, coral `#FF5B3A`, lila `#D8C9FF` y rosa `#FFD8E8`.
- **Tipografía:** Archivo Black para titulares en mayúsculas + Manrope para todo lo demás.
- **Formas:** tarjetas con borde de 2 px y radio de 18–26 px, botones tipo píldora con
  sombra dura (`6px 6px 0`), stickers rotados, etiquetas tipo parche y cinta animada.
- **Interacción:** hover con desplazamiento, marquesina infinita, badge flotante en el hero.

### Qué se reescribió
- `assets/css/styles.css` completo (nuevo sistema visual, 14 secciones).
- Hero con **video de fondo** + botón “Ver el reel”.
- Nueva sección **El reel** con póster y reproductor en modal.
- El popup, el carrito lateral, el checkout y las páginas internas heredaron el nuevo estilo.

---

## 3. El video del reel

Archivo: `assets/video/lunaria-reel.mp4` · Póster: `assets/img/reel-poster.jpg`

- **22,5 s · 1280×720 · H.264 · 25 fps · 2,2 MB · sin audio** (autoplay silencioso).
- Estructura: intro con marca → 8 modelos (Amélie, Noir, Perla, Siena, Lazo, Roble,
  Aurora, Estrella) con zoom lento, panel de color, precio y tallas → cierre con cupón.
- Los datos (nombres, precios, categorías) salen de `data.js`, no están escritos a mano.

### Cómo regenerarlo

```powershell
node -e "const fs=require('fs');const s=fs.readFileSync('assets/js/data.js','utf8');const d=eval(s.replace(/const /g,'var ')+'; ({PRODUCTOS})');fs.writeFileSync('scripts/_productos.json',JSON.stringify(d.PRODUCTOS,null,1))"
python scripts/make_video.py
```

`make_video.py` renderiza los fotogramas con Pillow (Archivo Black + Manrope) y codifica
con el ffmpeg estático de `imageio-ffmpeg`. Si no lo tienes:

```powershell
python -m pip install imageio-ffmpeg
```

Para cambiar modelos, colores, duración o textos del reel, edita el arreglo `SECUENCIA`
y las funciones `escena_*` al final de `scripts/make_video.py`.

> El video es decorativo en el hero (mudo y en bucle) y se ofrece con controles en el
> modal, donde el usuario puede verlo completo.

---

## 4. WhatsApp

**Un solo lugar para cambiarlo:** `assets/js/data.js`

```js
whatsapp: "573001234567",          // ⚠️ REEMPLAZA por tu número real
whatsappTexto: "Hola Lunaria, tengo una duda sobre el calzado 👟",
telefono: "+57 300 123 4567",      // cómo se muestra en pantalla
```

Formato: internacional, sin `+`, sin espacios ni guiones (ej. `573001234567`).

Aparece en:

- Barra superior de todas las páginas (número visible).
- Icono de WhatsApp en la cabecera.
- Botón flotante en la esquina inferior derecha.
- Menú móvil.
- Ficha de producto (“¿Dudas con este modelo?” con mensaje precargado del modelo).
- Footer y página de políticas.
- Chatbot: respuesta “Hablar con una persona” y cierre del reel.


---

## 5. Chatbot “Luna”

Archivo: `assets/js/chatbot.js` (se incluye en las 7 páginas). **Funciona sin API ni
claves**: es un motor de reglas en el navegador, con el catálogo real como fuente.

- Botón flotante con punto coral de “nuevo mensaje”.
- Panel con cabecera, estado “En línea”, historial, chips de preguntas rápidas e input.
- Indicador de escritura y respuestas con enlaces al catálogo y a fichas concretas.

### Qué responde

| Tema | Ejemplo de pregunta |
|---|---|
| Tallas y hormas | “¿Qué talla elijo?”, “tienen talla 38?”, “tengo el pie ancho” |
| Producto concreto | “cuánto cuesta la Perla”, “háblame de Noir” |
| Categorías | “ver botines”, “sandalias para boda”, “tacones bajos” |
| Precios | “¿cuánto valen?”, “¿cuál es el más económico?” |
| Envíos | “¿cuánto tarda a Bogotá?”, “¿envían gratis?” |
| Cambios y garantía | “¿puedo cambiar la talla?”, “¿tiene garantía?” |
| Pagos | “¿puedo pagar contra entrega?”, “¿reciben Nequi?” |
| Descuentos | “¿hay cupón?”, “¿tienen promoción?” |
| Materiales y cuidado | “¿es cuero?”, “¿cómo limpio el ante?” |
| Comodidad | “¿son cómodos para todo el día?” |
| Pedido | “¿dónde está mi pedido?” |
| Boutique | “¿dónde están?”, “¿puedo agendar cita?” |
| Humano | “quiero hablar con una persona” → abre WhatsApp |

### Cómo extenderlo

Cada tema es un bloque `if` dentro de `responder()` que devuelve `{ html, chips }`.
Para añadir una pregunta, copia un bloque y cambia la expresión regular y el HTML.
Si no encuentra coincidencia, busca en el catálogo por nombre, categoría, precio o talla,
y como último recurso ofrece WhatsApp.

---

## 6. Estructura de archivos

```
calzadoweb/
├── index.html                 Inicio con hero en video, reel, colección, ocasiones…
├── tienda.html                Catálogo con filtros y orden
├── producto.html              Ficha dinámica (?id=perla)
├── carrito.html               Carrito + checkout + confirmación
├── guia-de-tallas.html        Medición, tabla, hormas por modelo, FAQ
├── historia.html              Marca, valores, línea de tiempo
├── politicas.html             Envíos, cambios, garantía, datos, términos
├── assets/
│   ├── css/styles.css         Sistema visual “Moda fresca”
│   ├── video/
│   │   └── lunaria-reel.mp4   Reel generado (22,5 s, 1280×720)
│   ├── img/                   28 fotos + póster del reel + favicon
│   └── js/
│       ├── data.js            Configuración, WhatsApp, cupón y 17 productos
│       ├── core.js            Utilidades, carrito, favoritos, tarjeta
│       ├── layout.js          Cabecera, footer, drawer, popup, modal de video
│       ├── chatbot.js         Asistente Luna
│       ├── home.js / shop.js / producto.js / carrito.js
├── scripts/
│   ├── make_video.py          Generador del reel (Pillow + ffmpeg)
│   ├── finalize_images.py     Descarga de fotos de demostración
│   ├── test-logica.js         Pruebas de precios, cupón y envío
│   ├── test-e2e.js            Pruebas reales en Edge vía CDP
│   └── fonts/                 Tipografías usadas para renderizar el video
└── README.md
```

---

## 7. Cómo abrirlo

**Opción A:** doble clic en `index.html`.

**Opción B:** servidor local (recomendado para el video y las rutas)

```powershell
cd C:\Users\angello\Documents\calzadoweb
python -m http.server 8000
```

Abre `http://localhost:8000`.

> En este equipo el puerto 5500 lo ocupa Oracle; por eso el README usa 8000.

### Publicar en GitHub Pages

La guía completa, con autenticación, dominio propio y solución de problemas, está en
**[DESPLIEGUE.md](DESPLIEGUE.md)**. Resumen:

```powershell
cd C:\Users\angello\Documents\calzadoweb
git init -b main
git add -A
git commit -m "Sitio Lunaria"
git remote add origin https://github.com/TU-USUARIO/lunaria.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Deploy from a branch → `main` + `/ (root)` → Save**.
El sitio queda en `https://TU-USUARIO.github.io/lunaria/`.

También puedes ejecutar `deploy.ps1` con la URL del repositorio y hace el commit y el push
por ti. El proyecto ya incluye `.nojekyll`, `404.html` y `.gitignore` para Pages.

---

## 8. Qué funciona de verdad

### Catálogo
- 17 productos con categoría, color, material, tacón, altura, tallas y stock por talla.
- Filtros combinables: **talla disponible**, categoría, tacón, color y precio.
- Orden, chips de filtros activos, favoritos persistentes y estado vacío.

### Ficha de producto
- Galería con miniaturas, tallas agotadas deshabilitadas, aviso de horma.
- Añadir a la bolsa, comprar ahora, acordeones y barra de compra fija en móvil.
- Enlace directo a WhatsApp con el nombre del modelo en el mensaje.

### Carrito y checkout
- Persistente en `localStorage`, mini-carrito lateral y barra de envío gratis.
- Cupón **`LUNARIA20`** (−20 %), envío gratis desde $ 250.000.
- Checkout validado, cuatro medios de pago y confirmación con número de pedido.

### Popup de temporada
- A los 16 s, al 45 % de scroll o con intención de salida; se silencia 7 días.
- Captura correo con consentimiento (Ley 1581) y entrega el cupón con botón “Copiar”.

### Reel
- Autoplay silencioso en el hero y reproductor con controles en el modal.
- Póster propio para carga rápida.


---

## 9. Personalización rápida

Todo lo configurable está en **`assets/js/data.js`**:

```js
const LUNARIA = {
  whatsapp: "573001234567",   // número real, sin + ni espacios
  envioGratisDesde: 250000,
  costoEnvio: 15000,
  cupon: { codigo: "LUNARIA20", porcentaje: 20, minima: 0 },
  popupRetraso: 16000,
  popupDias: 7
};
```

Cada producto es un objeto de `PRODUCTOS` con `precio`, `antes`, `tallas`, `agotadas`,
`imagenes` y `horma`. Al añadir uno, el catálogo, los filtros, la ficha, el carrito y
el chatbot se actualizan solos (el video se regenera con el script).

Colores y tipografía: variables de `:root` en `assets/css/styles.css`.
Textos del chat: `assets/js/chatbot.js`.
Duración y escenas del reel: `SECUENCIA` en `scripts/make_video.py`.

---

## 10. Qué es demostración y qué falta para producción

Este sitio **no procesa pagos reales ni envía correos**. Todo el flujo vive en el
navegador y guarda datos en `localStorage`.

Para pasarlo a producción:

1. **Pasarela de pagos** (Wompi, Mercado Pago, ePayco o Stripe) conectada al checkout.
2. **Backend de pedidos e inventario** (o Shopify / Tiendanube).
3. **Correo transaccional** (Klaviyo, MailerLite o Brevo) para cupón y confirmación.
4. **WhatsApp Business API** si quieres automatizar respuestas y seguimiento.
5. **Analítica** (GA4 con eventos de catálogo, carrito y compra) y consentimiento real de cookies.
6. **Chatbot con IA** solo si lo necesitas: hoy responde con reglas y el catálogo, sin costo
   por mensaje. Si más adelante quieres respuestas libres, se puede conectar a un modelo
   con un backend propio.
7. Reemplazar las fotos de demostración por producción propia y ajustar el número de WhatsApp.

> Fotografías de demostración: **Burst (Shopify)**, licencia libre para uso comercial.
> El video se generó a partir de esas fotos, así que también es material de maqueta.

---

## 11. Textos legales incluidos

`politicas.html` trae contenido redactado para revisar con abogado:

- Envíos: tiempos, tarifas, seguimiento y entregas fallidas.
- Cambios y devoluciones: 15 días, primer cambio gratis, reembolsos y derecho de retracto
  (Ley 1480 de 2011).
- Garantía de 30 días con coberturas y exclusiones.
- Tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013).
- Términos de compra, cupones y propiedad intelectual.

---

## 12. Pruebas

**Lógica de precios** (Node, sin navegador):

```powershell
node scripts/test-logica.js
```

18 casos: unidades, subtotal, cupón, envío gratis, envío cobrado, cupón inválido y
carrito vacío.

**Prueba end-to-end real** (Edge con protocolo DevTools):

```powershell
# 1. servidor
python -m http.server 8765

# 2. Edge con depuración remota
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --remote-debugging-port=9333 --remote-allow-origins=* `
  --user-data-dir="$env:TEMP\edgee2e" http://127.0.0.1:8765/index.html

# 3. pruebas
node scripts/test-e2e.js
```

Comprueba: catálogo renderizado, tipografía y fondo nuevos, video cargado, modal de
video, apertura del chat, respuesta por talla, respuesta de producto, derivación a
WhatsApp, ficha de producto, carrito con cupón, tienda, guía de tallas y errores de JS.

---

## 13. Datos de contacto de la maqueta

Los datos son ficticios y están centralizados en `data.js`:
correo `hola@lunaria.co`, WhatsApp `+57 300 123 4567`, dirección en El Poblado,
Medellín y NIT `901.482.775-3`.

> Recuerda: el número de WhatsApp del demo es de ejemplo. Cámbialo por el real antes
> de publicar.
