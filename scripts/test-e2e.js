/* Prueba end-to-end temporal: usa el protocolo DevTools de Edge. */
const http = require("http");

const PUERTO = 9333;

function json(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await json(`http://127.0.0.1:${PUERTO}/json`);
  const pagina = targets.find((t) => t.type === "page");
  if (!pagina) throw new Error("No hay pestaña disponible");

  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let seq = 0;
  const pendientes = new Map();
  const errores = [];

  ws.onmessage = (evento) => {
    const msg = JSON.parse(evento.data);
    if (msg.id && pendientes.has(msg.id)) {
      pendientes.get(msg.id)(msg);
      pendientes.delete(msg.id);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      errores.push(
        msg.params.exceptionDetails.text + " " +
          (msg.params.exceptionDetails.exception?.description || "")
      );
    }
  };

  const enviar = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++seq;
      pendientes.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluar = async (expression) => {
    const r = await enviar("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.result && r.result.exceptionDetails) {
      return { error: r.result.exceptionDetails.text };
    }
    return r.result.result.value;
  };

  const ir = async (url) => {
    await enviar("Page.navigate", { url });
    await dormir(2600);
  };

  await enviar("Runtime.enable");
  await enviar("Page.enable");

  const resultados = {};

  /* ---------- Home ---------- */
  await ir("http://127.0.0.1:8765/index.html");
  resultados.home = await evaluar(`(async () => {
    const out = {};
    out.titulo = document.title;
    out.tarjetas = document.querySelectorAll('.card').length;
    out.fondo = getComputedStyle(document.body).backgroundColor;
    out.tipografia = getComputedStyle(document.querySelector('.brand strong')).fontFamily;
    const video = document.querySelector('.hero video');
    out.heroVideo = !!video;
    out.videoListo = video ? video.readyState : null;
    out.secciones = [...document.querySelectorAll('h2')].slice(0, 6).map(h => h.textContent.trim());
    out.reel = !!document.querySelector('.reel-thumb');
    out.chatFab = !!document.getElementById('chatFab');
    const abre = document.querySelector('[data-open-video]');
    if (abre) {
      abre.click();
      await new Promise(r => setTimeout(r, 700));
      const modal = document.getElementById('videoModal');
      const pelicula = document.getElementById('reelVideo');
      out.modalVideo = modal.classList.contains('is-open');
      out.videoFuente = pelicula.currentSrc.split('/').pop();
      out.videoPausado = pelicula.paused;
      modal.querySelector('[data-close-video]').click();
      out.modalCerrado = !modal.classList.contains('is-open');
    }
    return out;
  })()`);


  /* ---------- Chat: talla, producto y WhatsApp ---------- */
  resultados.chat = await evaluar(`(async () => {
    const out = {};
    const fab = document.getElementById('chatFab');
    if (!fab) return { error: 'sin chat' };
    fab.click();
    out.abierto = document.getElementById('chatPanel').classList.contains('is-open');
    out.chipsIniciales = document.querySelectorAll('#chatChips button').length;
    const input = document.getElementById('chatInput');
    const form = document.getElementById('chatForm');
    const enviar = (txt) => {
      input.value = txt;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };
    enviar('tienen talla 38?');
    await new Promise(r => setTimeout(r, 1600));
    let msgs = [...document.querySelectorAll('#chatLog .msg')];
    out.mensajes = msgs.length;
    out.ultima = msgs[msgs.length - 1].textContent.replace(/\\s+/g, ' ').slice(0, 140);
    out.enlacesTalla = msgs[msgs.length - 1].querySelectorAll('a').length;

    enviar('cuanto cuesta la perla');
    await new Promise(r => setTimeout(r, 1600));
    msgs = [...document.querySelectorAll('#chatLog .msg')];
    out.ultima2 = msgs[msgs.length - 1].textContent.replace(/\\s+/g, ' ').slice(0, 140);

    enviar('quiero hablar con una persona');
    await new Promise(r => setTimeout(r, 1600));
    msgs = [...document.querySelectorAll('#chatLog .msg')];
    out.whatsapp = msgs[msgs.length - 1].innerHTML.includes('wa.me');

    enviar('hola');
    await new Promise(r => setTimeout(r, 1600));
    msgs = [...document.querySelectorAll('#chatLog .msg')];
    out.saludo = msgs[msgs.length - 1].textContent.slice(0, 40);
    return out;
  })()`);

  /* ---------- Producto ---------- */
  await ir("http://127.0.0.1:8765/producto.html?id=perla");
  resultados.producto = await evaluar(`(() => {
    const out = {};
    out.titulo = document.querySelector('#productInfo h1')?.textContent;
    out.precio = document.querySelector('.product-price')?.textContent.replace(/\\s+/g, ' ').trim();
    out.tallas = document.querySelectorAll('.size-btn').length;
    out.agotadas = document.querySelectorAll('.size-btn[disabled]').length;
    out.relacionados = document.querySelectorAll('#relatedGrid .card').length;
    out.whatsapp = !!document.querySelector('a[href*="wa.me"]');
    out.numeroVisible = document.body.textContent.includes('300 123 4567');
    out.radioBoton = getComputedStyle(document.querySelector('#addToCart')).borderRadius;
    return out;
  })()`);

  /* ---------- Carrito con cupón ---------- */
  await evaluar(`localStorage.setItem('lunaria_carrito_v1', JSON.stringify([
      {id:'amelie', talla:37, qty:1}, {id:'noir', talla:38, qty:2}
    ]));
    localStorage.setItem('lunaria_cupon_v1', JSON.stringify('LUNARIA20'));
    localStorage.setItem('lunaria_popup_v1', JSON.stringify(Date.now()));
    localStorage.setItem('lunaria_cookies_v1', 'true');`);
  await ir("http://127.0.0.1:8765/carrito.html");
  resultados.carrito = await evaluar(`(() => {
    const out = {};
    out.filas = document.querySelectorAll('.cart-row').length;
    out.resumen = document.querySelector('#summary')?.textContent.replace(/\\s+/g, ' ').trim().slice(0, 180);
    out.total = document.querySelector('.summary-row--total strong')?.textContent;
    out.checkout = !!document.querySelector('#checkoutForm');
    out.campos = document.querySelectorAll('#checkoutForm input, #checkoutForm select').length;
    return out;
  })()`);

  /* ---------- Tienda ---------- */
  await ir("http://127.0.0.1:8765/tienda.html");
  resultados.tienda = await evaluar(`(() => ({
    tarjetas: document.querySelectorAll('.card').length,
    filtros: document.querySelectorAll('.filter-group').length,
    selects: !!document.getElementById('orden'),
    chipsTalla: document.querySelectorAll('.size-chip').length
  }))()`);

  /* ---------- Guía de tallas ---------- */
  await ir("http://127.0.0.1:8765/guia-de-tallas.html");
  resultados.tallas = await evaluar(`(() => ({
    filas: document.querySelectorAll('#hormaTable tr').length,
    pasos: document.querySelectorAll('.size-step').length,
    faq: document.querySelectorAll('.accordion details').length
  }))()`);

  resultados.erroresJS = errores.slice(0, 8);
  console.log(JSON.stringify(resultados, null, 2));
  ws.close();
  process.exit(0);
})().catch((e) => {
  console.error("FALLO E2E:", e.message);
  process.exit(1);
});
