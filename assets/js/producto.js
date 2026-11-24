/* ==========================================================================
   LUNARIA · producto.js
   Ficha de producto: galería, tallas con stock, carrito y relacionados.
   ========================================================================== */

(function () {
  "use strict";

  const root = $("#productRoot");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const producto = byId(params.get("id")) || PRODUCTOS[0];

  let tallaElegida = null;
  let cantidad = 1;

  /* ---------- Galería ---------------------------------------------------- */
  function renderGaleria() {
    const cont = $("#gallery");
    cont.innerHTML = `
      <div class="gallery-thumbs" role="tablist" aria-label="Fotos del producto">
        ${producto.imagenes
          .map(
            (img, i) => `
          <button type="button" role="tab" aria-selected="${i === 0}"
                  data-foto="${i}" aria-label="Foto ${i + 1}">
            <img src="${img.src}" alt="" width="82" height="103" loading="lazy"
                 style="object-position:${img.pos || "50% 50%"}">
          </button>`
          )
          .join("")}
      </div>
      <div class="gallery-main">
        ${producto.etiqueta ? `<span class="tag">${esc(producto.etiqueta)}</span>` : ""}
        <img id="fotoPrincipal" src="${producto.imagenes[0].src}"
             alt="${esc(producto.nombre)} — ${esc(producto.subtitulo)}"
             width="1000" height="1250"
             style="object-position:${producto.imagenes[0].pos || "50% 50%"}">
      </div>`;

    $$("[data-foto]", cont).forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = producto.imagenes[Number(btn.dataset.foto)];
        const principal = $("#fotoPrincipal");
        principal.src = img.src;
        principal.style.objectPosition = img.pos || "50% 50%";
        $$("[data-foto]", cont).forEach((b) =>
          b.setAttribute("aria-selected", String(b === btn))
        );
      });
    });
  }

  function añadir(abrir = true) {
    if (!tallaElegida) {
      toast("Elige tu talla para continuar", "warn");
      const grid = $("#sizeGrid");
      grid.scrollIntoView({ behavior: "smooth", block: "center" });
      grid.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 260, iterations: 2 }
      );
      return false;
    }
    cart.add(producto.id, tallaElegida, cantidad);
    toast(`${producto.nombre} · talla ${tallaElegida} en tu bolsa`);
    if (abrir) openDrawer();
    return true;
  }

  /* ---------- Ficha ------------------------------------------------------ */
  function renderInfo() {
    const cont = $("#productInfo");
    const descuento = producto.antes
      ? Math.round(100 - (producto.precio / producto.antes) * 100)
      : 0;
    const cuotas = Math.round(producto.precio / 6 / 1000) * 1000;

    cont.innerHTML = `
      <p class="cat">${esc(producto.categoria)} · ${esc(producto.material)}</p>
      <h1>${esc(producto.nombre)}</h1>
      <p class="sub">${esc(producto.subtitulo)}</p>
      <div class="rating">
        <span class="stars">${stars(producto.valoracion)}</span>
        <span>${producto.valoracion.toFixed(1)} · ${producto.resenas} reseñas</span>
      </div>

      <div class="product-price">
        <span>${money(producto.precio)}</span>
        ${producto.antes ? `<del>${money(producto.antes)}</del><span class="save">-${descuento}%</span>` : ""}
      </div>
      <p class="afterpay">6 cuotas de ${money(cuotas)} con tarjeta · 20% con ${LUNARIA.cupon.codigo}</p>

      <p class="product-desc">${esc(producto.corto)}</p>

      <div class="option-label">
        <span>Talla (UE)
          <span id="tallaTexto" style="color:var(--muted);text-transform:none;letter-spacing:0">— elige una</span>
        </span>
        <a href="guia-de-tallas.html">Guía de tallas</a>
      </div>
      <div class="size-grid" id="sizeGrid" role="group" aria-label="Selecciona tu talla">
        ${producto.tallas
          .map((t) => {
            const agotada = producto.agotadas.includes(t);
            return `<button class="size-btn" type="button" data-talla="${t}"
                      aria-pressed="false" ${agotada ? "disabled" : ""}>${t}</button>`;
          })
          .join("")}
      </div>
      <p class="size-note">${
        producto.agotadas.length
          ? `Agotadas: ${producto.agotadas.join(", ")}. Escríbenos y te avisamos cuando vuelvan.`
          : "Todas las tallas disponibles."
      }</p>

      <div class="fit-note">
        ${ICONS.star}
        <span><strong>Horma:</strong> ${esc(producto.horma)}</span>
      </div>

      <div class="buy-row">
        <div class="qty">
          <button type="button" data-qty="-1" aria-label="Menos unidades">−</button>
          <input id="cantidad" type="number" value="1" min="1" max="9" aria-label="Cantidad">
          <button type="button" data-qty="1" aria-label="Más unidades">+</button>
        </div>
        <button class="btn btn--solid" type="button" id="addToCart">Añadir a mi bolsa</button>
      </div>
      <button class="btn btn--block" type="button" id="buyNow" style="margin-top:10px">
        Comprar ahora
      </button>

      <p style="font-size:.82rem;font-weight:600;margin:14px 0 0;text-align:center">
        ¿Dudas con este modelo?
        <a href="https://wa.me/${LUNARIA.whatsapp}?text=${encodeURIComponent(
          "Hola Lunaria, tengo una duda sobre " + producto.nombre
        )}" target="_blank" rel="noopener"
           style="text-decoration:underline;text-underline-offset:3px">
          Escríbenos al ${LUNARIA.telefono}
        </a>
      </p>

      <ul class="trust-list">
        <li>${ICONS.truck}<span>Envío gratis desde ${money(LUNARIA.envioGratisDesde)}. Entrega en 1 a 4 días hábiles.</span></li>
        <li>${ICONS.refresh}<span>Cambios sin costo hasta 15 días. Si no te queda, la cambiamos.</span></li>
        <li>${ICONS.lock}<span>Pago seguro con tarjeta, PSE, Nequi o contra entrega.</span></li>
      </ul>

      <div class="accordion">
        <details open>
          <summary>Descripción y materiales</summary>
          <div class="acc-body">
            <p>${esc(producto.descripcion)}</p>
            <p><strong>Material:</strong> ${esc(producto.material)} · <strong>Tacón:</strong> ${producto.taconCm} cm · <strong>Suela:</strong> ${esc(producto.suela)}</p>
          </div>
        </details>
        <details>
          <summary>Cuidados</summary>
          <div class="acc-body"><p>${esc(producto.cuidados)}</p></div>
        </details>
        <details>
          <summary>Envíos y cambios</summary>
          <div class="acc-body">
            <p>Despachamos desde Medellín en 24 horas hábiles. Envío gratis en compras superiores a
            ${money(LUNARIA.envioGratisDesde)}; si no, cuesta ${money(LUNARIA.costoEnvio)}.</p>
            <p>Tienes 15 días calendario para cambiar la talla sin costo. Escríbenos a
            ${LUNARIA.email} o por WhatsApp y coordinamos la recogida.</p>
          </div>
        </details>
      </div>`;


    $$("#sizeGrid .size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        tallaElegida = Number(btn.dataset.talla);
        $$("#sizeGrid .size-btn").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn))
        );
        const label = $("#tallaTexto");
        label.textContent = "— " + tallaElegida;
        label.style.color = "var(--ink)";
      });
    });

    $$("[data-qty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cantidad = Math.max(1, Math.min(9, cantidad + Number(btn.dataset.qty)));
        $("#cantidad").value = cantidad;
      });
    });

    $("#cantidad").addEventListener("change", (e) => {
      cantidad = Math.max(1, Math.min(9, Number(e.target.value) || 1));
      e.target.value = cantidad;
    });

    $("#addToCart").addEventListener("click", () => añadir());
    $("#buyNow").addEventListener("click", () => {
      if (añadir(false)) location.href = "carrito.html";
    });
  }

  /* ---------- Relacionados ---------------------------------------------- */
  function renderRelacionados() {
    const grid = $("#relatedGrid");
    if (!grid) return;
    const misma = PRODUCTOS.filter(
      (p) => p.categoria === producto.categoria && p.id !== producto.id
    );
    const resto = PRODUCTOS.filter(
      (p) => p.categoria !== producto.categoria && p.id !== producto.id
    );
    const lista = misma.concat(resto).slice(0, 4);
    grid.innerHTML = lista.map((p) => productCard(p)).join("");
    bindFavButtons(grid);
  }

  /* ---------- Reseñas ---------------------------------------------------- */
  const RESENAS = [
    {
      nombre: "Mariana G.",
      talla: 37,
      texto:
        "Pedí mi talla habitual y quedó perfecta. Se sienten firmes pero no rígidas; las usé ocho horas el primer día y no me sacaron ampolla.",
      valor: 5
    },
    {
      nombre: "Laura C.",
      talla: 38,
      texto:
        "La calidad del cuero se nota al abrir la caja. Compré media talla más como dice la guía y fue el consejo correcto.",
      valor: 5
    },
    {
      nombre: "Andrea P.",
      talla: 36,
      texto:
        "Llegaron en dos días a Bogotá. El empaque es una belleza y trae bolsa de tela. Solo diría que el color es un poco más cálido que en la foto.",
      valor: 4
    }
  ];

  function renderResenas() {
    const cont = $("#reviewsList");
    if (!cont) return;
    cont.innerHTML = RESENAS.map(
      (r) => `
      <div class="quote">
        <span class="stars">${stars(r.valor)}</span>
        <p>“${esc(r.texto)}”</p>
        <footer>${esc(r.nombre)} · talla ${r.talla} · compra verificada</footer>
      </div>`
    ).join("");
  }

  /* ---------- Barra fija de compra -------------------------------------- */
  function initStickyBuy() {
    const bar = $("#stickyBuy");
    if (!bar) return;
    bar.innerHTML = `
      <div class="sb-info">
        <b>${esc(producto.nombre)}</b>
        <span>${money(producto.precio)}</span>
      </div>
      <button class="btn btn--solid" type="button">Añadir a mi bolsa</button>`;
    $("button", bar).addEventListener("click", () => añadir());

    const observador = $("#addToCart");
    if (!observador || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          bar.classList.toggle(
            "is-visible",
            !entry.isIntersecting && window.innerWidth <= 980
          );
        });
      },
      { threshold: 0 }
    );
    io.observe(observador);
  }

  function renderMigas() {
    const crumbs = $("#crumbs");
    if (!crumbs) return;
    crumbs.innerHTML = `
      <a href="index.html">Inicio</a><span></span>
      <a href="tienda.html">Tienda</a><span></span>
      <a href="tienda.html?cat=${encodeURIComponent(producto.categoria)}">${esc(producto.categoria)}</a><span></span>
      <span>${esc(producto.nombre)}</span>`;
  }

  document.title = `${producto.nombre} — ${producto.subtitulo} · Lunaria`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", producto.corto);

  renderMigas();
  renderGaleria();
  renderInfo();
  renderRelacionados();
  renderResenas();
  initStickyBuy();
})();

