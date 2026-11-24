/* ==========================================================================
   LUNARIA · chatbot.js
   Asistente local (sin API) que responde dudas de tallas, envíos, cambios,
   materiales, precios y stock usando PRODUCTOS. Deriva a WhatsApp.
   ========================================================================== */

(function () {
  "use strict";

  if (typeof PRODUCTOS === "undefined" || typeof LUNARIA === "undefined") return;
  if (document.getElementById("chatFab")) return;

  const WA = "https://wa.me/" + LUNARIA.whatsapp + "?text=" +
    encodeURIComponent(LUNARIA.whatsappTexto);

  const normalizar = (texto) =>
    String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const precio = (p) => money(p.precio);
  const enlaceProducto = (p) =>
    `<a href="producto.html?id=${p.id}">${esc(p.nombre)}</a>`;
  const enlaceTienda = (q) =>
    `<a href="tienda.html${q ? "?" + q : ""}">ver el catálogo</a>`;

  function listaProductos(lista, nota) {
    if (!lista.length) return "";
    const items = lista
      .slice(0, 4)
      .map((p) => `<li>${enlaceProducto(p)} · ${precio(p)}</li>`)
      .join("");
    return `${nota ? `<p>${nota}</p>` : ""}<ul>${items}</ul>`;
  }

  function disponiblesConTalla(talla) {
    return PRODUCTOS.filter(
      (p) => p.tallas.includes(Number(talla)) && !p.agotadas.includes(Number(talla))
    );
  }

  const CATEGORIAS_CLAVE = [
    { clave: ["botin", "botines"], categoria: "Botines" },
    { clave: ["bota", "botas"], categoria: "Botas" },
    { clave: ["sandalia", "sandalias", "playa"], categoria: "Sandalias" },
    { clave: ["tacon", "tacones", "stiletto", "pump"], categoria: "Tacones" },
    { clave: ["mocasin", "mocasines"], categoria: "Mocasines" },
    { clave: ["mule", "mules"], categoria: "Mules" },
    { clave: ["novia", "boda", "matrimonio", "ceremonia"], categoria: "Novia" },
    { clave: ["plano", "planos", "bailarina", "bailarinas"], categoria: "Planos" }
  ];

  const CHIPS_BASE = [
    "¿Qué talla elijo?",
    "Envíos y tiempos",
    "Cambios y garantía",
    "Ver botines",
    "Hablar con una persona"
  ];

  /* ---------- Motor de respuestas ---------------------------------------- */
  function responder(entrada) {
    const t = normalizar(entrada);

    if (!t) {
      return { html: "Escríbeme tu duda y te ayudo con gusto.", chips: CHIPS_BASE };
    }

    /* Saludos y cortesía */
    if (/^(hola|buenas|hey|buenos dias|buenas tardes|buenas noches|hi)\b/.test(t)) {
      return {
        html:
          "¡Hola! Soy <strong>Luna</strong>, la asesora de Lunaria 🌙<br>" +
          "Puedo ayudarte con tallas, hormas, envíos, cambios, materiales y stock. " +
          "¿Qué necesitas saber?",
        chips: CHIPS_BASE
      };
    }

    if (/\b(gracias|muchas gracias|genial|perfecto|listo)\b/.test(t) && t.length < 40) {
      return {
        html:
          "¡Con gusto! Si te surge otra duda, aquí estoy. También puedes escribirnos " +
          "por WhatsApp al " + esc(LUNARIA.telefono) + ".",
        chips: ["Ver el catálogo", "¿Cómo elijo mi talla?"]
      };
    }

    if (/\b(adios|chao|hasta luego|nos vemos)\b/.test(t)) {
      return { html: "¡Gracias por pasarte por Lunaria! Que camines bonito ✦", chips: [] };
    }

    /* Persona / WhatsApp */
    if (/\b(persona|humano|asesor|asesora|vendedor|whatsapp|telefono|contacto|hablar con alguien)\b/.test(t)) {
      return {
        html:
          "Claro, te paso con una persona de la boutique.<br>" +
          "WhatsApp: <a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\">" +
          esc(LUNARIA.telefono) + "</a><br>" +
          "Atendemos de lunes a sábado, 9:00 a 18:00. " +
          "También puedes escribir a <a href=\"mailto:" + LUNARIA.email + "\">" +
          LUNARIA.email + "</a>.",
        chips: ["Abrir WhatsApp", "Envíos y tiempos", "Cambios y garantía"]
      };
    }

    /* Envíos */
    if (/\b(envio|envios|entrega|entregas|despacho|domicilio|llega|demora|tarda|transportadora)\b/.test(t)) {
      return {
        html:
          "<strong>Envíos</strong><br>" +
          "• Preparación: hasta 24 h hábiles.<br>" +
          "• Medellín: 1 a 2 días hábiles.<br>" +
          "• Ciudades principales: 2 a 3 días.<br>" +
          "• Resto del país: 3 a 5 días.<br>" +
          "Gratis desde " + money(LUNARIA.envioGratisDesde) + "; si no, cuesta " +
          money(LUNARIA.costoEnvio) + ".<br>" +
          "Te enviamos la guía por correo y WhatsApp.",
        chips: ["¿Puedo pagar contra entrega?", "Cambios y garantía", "Hablar con una persona"]
      };
    }

    /* Cambios, devoluciones, garantía */
    if (/\b(cambio|cambios|devolucion|devolver|retracto|garantia|falla|defecto|talla equivocada)\b/.test(t)) {
      return {
        html:
          "<strong>Cambios y garantía</strong><br>" +
          "• Tienes 15 días calendario para cambiar la talla.<br>" +
          "• El primer cambio es sin costo (recogida y reenvío incluidos).<br>" +
          "• Garantía de 30 días por defectos de fabricación.<br>" +
          "• Devolución del dinero: 15 días hábiles al medio original.<br>" +
          "El zapato debe estar sin uso y con su caja.",
        chips: ["Quiero cambiar mi talla", "Envíos y tiempos", "Hablar con una persona"]
      };
    }

    /* Pagos */
    if (/\b(pago|pagar|tarjeta|pse|nequi|contra entrega|contraentrega|cuotas|efectivo|transferencia)\b/.test(t)) {
      return {
        html:
          "<strong>Medios de pago</strong><br>" +
          "• Tarjetas Visa y Mastercard (hasta 6 cuotas).<br>" +
          "• PSE y Nequi.<br>" +
          "• Pago contra entrega, sin recargo.<br>" +
          "No guardamos los datos de tu tarjeta: el cobro lo hace la pasarela.",
        chips: ["Envíos y tiempos", "¿Hay descuentos?", "Hablar con una persona"]
      };
    }

    /* Cupón y descuentos */
    if (/\b(cupon|cupones|descuento|descuentos|promo|promocion|oferta|rebaja)\b/.test(t) && !/talla/.test(t)) {
      return {
        html:
          "Con el código <strong>" + LUNARIA.cupon.codigo + "</strong> tienes <strong>" +
          LUNARIA.cupon.porcentaje + "%</strong> en tu primera compra.<br>" +
          "Es de un solo uso por persona, válido 14 días y no se acumula con outlet.<br>" +
          "Puedes aplicarlo en el carrito o desde el cupón que te enviamos al correo.",
        chips: ["Ver el catálogo", "Envíos y tiempos", "Hablar con una persona"]
      };
    }

    /* Talla y horma */
    const tallaDetectada = t.match(/\b(3[4-9]|4[01])\b/);
    if (/\b(talla|tallas|numero|horma|hormas|medida|medidas|calzo|pie ancho|empeine)\b/.test(t)) {
      if (tallaDetectada) {
        const talla = tallaDetectada[1];
        const disponibles = disponiblesConTalla(talla);
        return {
          html:
            `<strong>Talla ${talla}</strong>: hay ${disponibles.length} modelos disponibles.` +
            listaProductos(disponibles, "Te muestro algunos:") +
            `<p>${enlaceTienda("talla=" + talla)}</p>`,
          chips: ["¿Qué talla elijo?", "Guía de tallas", "Hablar con una persona"]
        };
      }
      return {
        html:
          "<strong>Para elegir tu talla</strong><br>" +
          "1. Apoya el pie en una hoja contra la pared.<br>" +
          "2. Marca el dedo más largo y mide en centímetros.<br>" +
          "3. Súmale 0,5 cm y busca esa medida en la tabla.<br>" +
          "Si estás entre dos tallas, elige la mayor cuando la horma es estrecha " +
          "(lo indicamos en cada ficha).<br>" +
          `<a href="guia-de-tallas.html">Ver la guía completa</a>`,
        chips: ["¿Tienen talla 38?", "Tengo el pie ancho", "Ver botines"]
      };
    }

    /* Materiales y cuidados */
    if (/\b(material|materiales|cuero|ante|seda|textil|cuidado|cuidados|limpiar|limpieza|mancha)\b/.test(t)) {
      return {
        html:
          "<strong>Materiales</strong><br>" +
          "Trabajamos cuero de curtición vegetal, ante, seda y textiles laminados.<br>" +
          "• Cuero: hidratar cada dos meses y secar a la sombra.<br>" +
          "• Ante: cepillo especial y protector hidrófugo antes del primer uso.<br>" +
          "• Seda y cristal: solo paño seco.<br>" +
          "Cada ficha trae la sección de cuidados del modelo.",
        chips: ["Ver el catálogo", "¿Son cómodos?", "Hablar con una persona"]
      };
    }

    /* Comodidad */
    if (/\b(comod|comodos|comodas|duele|dolor|ampolla|caminar|todo el dia)\b/.test(t)) {
      return {
        html:
          "Nuestro foco es que puedas caminar de verdad.<br>" +
          "• Plantillas acolchadas y tacones con base ancha.<br>" +
          "• Indicamos si la horma es estrecha, estándar o amplia.<br>" +
          "• El primer cambio de talla es gratis.<br>" +
          "Si quieres, te recomiendo algo según tu día: " +
          `<a href="tienda.html?tacon=Bajo">ver tacones bajos</a> o ` +
          `<a href="tienda.html?cat=Planos">ver planos</a>.`,
        chips: ["Ver botines", "¿Qué talla elijo?", "Hablar con una persona"]
      };
    }

    /* Rastreo de pedido */
    if (/\b(pedido|rastreo|rastrear|guia|donde esta|mi compra|orden)\b/.test(t)) {
      return {
        html:
          "Para revisar un pedido necesito el número que empieza por <strong>LN-</strong> " +
          "y el correo con el que compraste.<br>" +
          "Escríbenos por <a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\">WhatsApp</a> " +
          "y lo revisamos en minutos.",
        chips: ["Abrir WhatsApp", "Envíos y tiempos", "Cambios y garantía"]
      };
    }

    /* Tienda física y horarios */
    if (/\b(direccion|ubicacion|tienda fisica|donde estan|horario|medellin|poblado|visitar)\b/.test(t)) {
      return {
        html:
          "<strong>Boutique</strong><br>" + esc(LUNARIA.direccion) + "<br>" +
          "Lunes a sábado, 9:00 a 18:00.<br>" +
          "Puedes venir a probarte sin cita o agendar por WhatsApp.",
        chips: ["Agendar cita", "Envíos y tiempos", "Ver el catálogo"]
      };
    }

    if (/\b(cita|agendar|probar|probador|reservar)\b/.test(t)) {
      return {
        html:
          "Agendamos citas de prueba en la boutique de El Poblado " +
          "(30 minutos, sin costo y sin compromiso).<br>" +
          "<a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\">Agendar por WhatsApp</a>",
        chips: ["Ver la dirección", "¿Qué talla elijo?", "Hablar con una persona"]
      };
    }

    return null;
  }

  /* ---------- Búsqueda en el catálogo ------------------------------------ */
  function ficha(p) {
    return `<p><a href="producto.html?id=${p.id}">Ver ficha y tallas de ${esc(p.nombre)}</a></p>`;
  }

  function buscarProducto(t) {
    const encontrado = PRODUCTOS.find((p) => t.includes(normalizar(p.nombre)));
    if (!encontrado) return null;
    const agotadas = encontrado.agotadas.length
      ? `Agotadas: ${encontrado.agotadas.join(", ")}.`
      : "Todas las tallas disponibles.";
    return {
      html:
        `<strong>${esc(encontrado.nombre)}</strong> — ${esc(encontrado.subtitulo)}<br>` +
        `${precio(encontrado)} · ${esc(encontrado.material)} · tacón ${encontrado.taconCm} cm<br>` +
        `${esc(encontrado.horma)}<br>${agotadas}` +
        ficha(encontrado),
      chips: ["¿Qué talla elijo?", "Envíos y tiempos", "Hablar con una persona"]
    };
  }

  function buscarCategoria(t) {
    const grupo = CATEGORIAS_CLAVE.find((g) =>
      g.clave.some((k) => new RegExp("\\b" + k).test(t))
    );
    if (!grupo) return null;
    const lista = PRODUCTOS.filter((p) => p.categoria === grupo.categoria);
    return {
      html:
        `<strong>${grupo.categoria}</strong>: ${lista.length} modelos.` +
        listaProductos(lista) +
        `<p>${enlaceTienda("cat=" + encodeURIComponent(grupo.categoria))}</p>`,
      chips: ["¿Qué talla elijo?", "Ver el catálogo", "Hablar con una persona"]
    };
  }

  function buscarPrecio(t) {
    if (!/\b(precio|precios|cuanto|cuesta|vale|costo|barato|economico|caro)\b/.test(t)) return null;
    const ordenados = PRODUCTOS.slice().sort((a, b) => a.precio - b.precio);
    return {
      html:
        "Los precios van de " + money(ordenados[0].precio) + " a " +
        money(ordenados[ordenados.length - 1].precio) + ".<br>" +
        "Estos son los más económicos:" +
        listaProductos(ordenados, "") +
        `<p>${enlaceTienda("")}</p>`,
      chips: ["¿Hay descuentos?", "Envíos y tiempos", "Hablar con una persona"]
    };
  }

  function respuestaTallaSuelta(t) {
    const match = t.match(/\b(3[4-9]|4[01])\b/);
    if (!match) return null;
    const talla = match[1];
    const disponibles = disponiblesConTalla(talla);
    return {
      html:
        `Talla ${talla}: ${disponibles.length} modelos con stock.` +
        listaProductos(disponibles) +
        `<p>${enlaceTienda("talla=" + talla)}</p>`,
      chips: ["¿Qué talla elijo?", "Ver el catálogo", "Hablar con una persona"]
    };
  }

  function resolver(texto) {
    const t = normalizar(texto);
    return (
      responder(texto) ||
      buscarProducto(t) ||
      buscarCategoria(t) ||
      buscarPrecio(t) ||
      respuestaTallaSuelta(t) || {
        html:
          "No estoy segura de haber entendido 🤔<br>" +
          "Puedo ayudarte con <strong>tallas, hormas, envíos, cambios, materiales, precios y stock</strong>.<br>" +
          "Si prefieres, te paso con una persona por " +
          `<a href="${WA}" target="_blank" rel="noopener">WhatsApp ${esc(LUNARIA.telefono)}</a>.`,
        chips: CHIPS_BASE
      }
    );
  }


  /* ---------- Interfaz --------------------------------------------------- */
  const ICONO_CHAT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>';
  const ICONO_ENVIAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-7-7 16-2-7-7-2Z"/></svg>';

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <button class="chat-fab" id="chatFab" type="button" aria-label="Abrir chat de ayuda"
            aria-expanded="false" aria-controls="chatPanel">
      ${ICONO_CHAT}
      <span class="chat-dot" aria-hidden="true"></span>
    </button>
    <section class="chat-panel" id="chatPanel" role="dialog" aria-modal="false"
             aria-labelledby="chatTitle" aria-hidden="true">
      <header class="chat-head">
        <span class="chat-avatar" aria-hidden="true">L</span>
        <div>
          <strong id="chatTitle">Luna · asesora</strong>
          <span class="chat-status">En línea</span>
        </div>
        <button class="chat-close" type="button" data-chat-close aria-label="Cerrar chat">✕</button>
      </header>
      <div class="chat-log" id="chatLog" role="log" aria-live="polite"></div>
      <div class="chat-chips" id="chatChips"></div>
      <form class="chat-form" id="chatForm">
        <input id="chatInput" type="text" placeholder="Escribe tu duda…"
               autocomplete="off" aria-label="Escribe tu pregunta">
        <button type="submit" aria-label="Enviar mensaje">${ICONO_ENVIAR}</button>
      </form>
    </section>`
  );

  const fab = $("#chatFab");
  const panel = $("#chatPanel");
  const log = $("#chatLog");
  const chipsBox = $("#chatChips");
  const form = $("#chatForm");
  const input = $("#chatInput");
  let abierto = false;

  function pintarChips(chips) {
    chipsBox.innerHTML = "";
    (chips || []).forEach((texto) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.textContent = texto;
      boton.addEventListener("click", () => accionChip(texto));
      chipsBox.appendChild(boton);
    });
  }

  function agregar(html, tipo) {
    const div = document.createElement("div");
    div.className = "msg msg--" + tipo;
    if (tipo === "user") div.textContent = html;
    else div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function escribir(texto) {
    agregar(texto, "user");
  }

  function pensar() {
    const div = document.createElement("div");
    div.className = "msg-typing";
    div.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function contestar(texto) {
    const tip = pensar();
    setTimeout(() => {
      tip.remove();
      const r = resolver(texto);
      agregar(r.html, "bot");
      pintarChips(r.chips);
    }, 420 + Math.random() * 420);
  }

  const ACCIONES = {
    "Abrir WhatsApp": () => window.open(WA, "_blank", "noopener"),
    "Hablar con una persona": () => {
      escribir("Hablar con una persona");
      contestar("Hablar con una persona");
    },
    "Guía de tallas": () => {
      escribir("Guía de tallas");
      contestar("¿Cómo elijo mi talla?");
    },
    "Ver el catálogo": () => {
      escribir("Ver el catálogo");
      window.location.href = "tienda.html";
    },
    "Ver todo": () => {
      escribir("Ver todo");
      window.location.href = "tienda.html";
    },
    "Ver la dirección": () => {
      escribir("Ver la dirección");
      contestar("¿Dónde están ubicados?");
    },
    "Agendar cita": () => {
      escribir("Agendar cita");
      contestar("Quiero agendar una cita");
    }
  };

  function accionChip(texto) {
    if (ACCIONES[texto]) {
      ACCIONES[texto]();
      return;
    }
    escribir(texto);
    contestar(texto);
  }

  function abrir() {
    abierto = true;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");
    const punto = fab.querySelector(".chat-dot");
    if (punto) punto.remove();

    if (!log.dataset.iniciado) {
      log.dataset.iniciado = "1";
      agregar(
        "¡Hola! Soy <strong>Luna</strong> 🌙 Te ayudo con tallas, hormas, envíos, " +
          "cambios y stock.<br>¿Qué necesitas?",
        "bot"
      );
      pintarChips(CHIPS_BASE);
    }
    setTimeout(() => input.focus(), 120);
  }

  function cerrar() {
    abierto = false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");
  }

  fab.addEventListener("click", () => (abierto ? cerrar() : abrir()));

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-chat-close]")) cerrar();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = (input.value || "").trim();
    if (!texto) return;
    input.value = "";
    escribir(texto);
    pintarChips([]);
    contestar(texto);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && abierto) cerrar();
  });
})();
