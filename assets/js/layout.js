/* ==========================================================================
   LUNARIA · layout.js
   Cabecera, footer, carrito lateral, popup de temporada y captura de correos.
   Depende de data.js y core.js
   ========================================================================== */

const NAV = [
  { href: "tienda.html", label: "Tienda", page: "tienda" },
  { href: "tienda.html?cat=Botines", label: "Botines", page: "botines" },
  { href: "tienda.html?cat=Sandalias", label: "Sandalias", page: "sandalias" },
  { href: "tienda.html?cat=Novia", label: "Novia", page: "novia" },
  { href: "guia-de-tallas.html", label: "Guía de tallas", page: "tallas" },
  { href: "historia.html", label: "Historia", page: "historia" }
];

function headerHTML(page) {
  const links = NAV.map(
    (item) =>
      `<a href="${item.href}"${item.page === page ? ' aria-current="page"' : ""}>${item.label}</a>`
  ).join("");

  return `
    <div class="topbar">
      Envío gratis desde ${money(LUNARIA.envioGratisDesde)} · <strong>20% en tu primera compra</strong> ·
      <a href="https://wa.me/${LUNARIA.whatsapp}" target="_blank" rel="noopener">WhatsApp ${LUNARIA.telefono}</a>
    </div>
    <header class="site-header" id="siteHeader">
      <div class="wrap header-inner">
        <div class="header-left">
          <button class="icon-btn nav-toggle" type="button" aria-label="Abrir menú"
                  aria-expanded="false" aria-controls="mobileNav">${ICONS.menu}</button>
          <nav class="main-nav" aria-label="Navegación principal">${links}</nav>
        </div>
        <a class="brand" href="index.html" aria-label="Lunaria, ir al inicio">
          <strong>LUNARIA</strong>
          <span>Moda fresca · calzado</span>
        </a>
        <div class="header-actions">
          <a class="icon-btn icon-btn--wa" href="https://wa.me/${LUNARIA.whatsapp}?text=${encodeURIComponent(
            LUNARIA.whatsappTexto
          )}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICONS.wa}</a>
          <a class="icon-btn icon-btn--search" href="tienda.html" aria-label="Ver todo el catálogo">${ICONS.search}</a>
          <a class="icon-btn" href="tienda.html?fav=1" aria-label="Favoritos">${ICONS.heart}</a>
          <a class="icon-btn" href="carrito.html" aria-label="Ver carrito" data-open-cart>
            ${ICONS.bag}
            <span class="cart-count" data-cart-count hidden>0</span>
          </a>
        </div>
      </div>
    </header>
    <nav class="mobile-nav" id="mobileNav" aria-label="Navegación móvil">
      ${NAV.map((i) => `<a href="${i.href}">${i.label}</a>`).join("")}
      <a href="politicas.html">Envíos y cambios</a>
      <div class="mobile-nav-foot">
        <a href="carrito.html">Carrito (<span data-cart-count>0</span>)</a>
        <a href="mailto:${LUNARIA.email}">${LUNARIA.email}</a>
        <a href="https://wa.me/${LUNARIA.whatsapp}" target="_blank" rel="noopener">WhatsApp ${LUNARIA.telefono}</a>
      </div>
    </nav>`;
}

function footerHTML() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <strong>LUNARIA</strong>
            <p>Boutique de calzado femenino en pequeños lotes. Diseñamos para caminar la ciudad completa, no solo para la foto.</p>
            <div class="pay-badges">
              <span>Visa</span><span>Mastercard</span><span>PSE</span><span>Nequi</span><span>Contra entrega</span>
            </div>
          </div>
          <div class="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="tienda.html">Todo el catálogo</a></li>
              <li><a href="tienda.html?cat=Tacones">Tacones</a></li>
              <li><a href="tienda.html?cat=Botines">Botines</a></li>
              <li><a href="tienda.html?cat=Sandalias">Sandalias</a></li>
              <li><a href="tienda.html?cat=Novia">Novia</a></li>
              <li><a href="tienda.html?etiqueta=Outlet">Outlet</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Ayuda</h4>
            <ul>
              <li><a href="guia-de-tallas.html">Guía de tallas</a></li>
              <li><a href="politicas.html#envios">Envíos y entregas</a></li>
              <li><a href="politicas.html#cambios">Cambios y devoluciones</a></li>
              <li><a href="politicas.html#privacidad">Tratamiento de datos</a></li>
              <li><a href="politicas.html#terminos">Términos y condiciones</a></li>
              <li><a href="historia.html">Sobre Lunaria</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Hablemos</h4>
            <ul class="footer-contact">
              <li>${LUNARIA.direccion}</li>
              <li><a href="mailto:${LUNARIA.email}">${LUNARIA.email}</a></li>
              <li><a href="https://wa.me/${LUNARIA.whatsapp}" target="_blank" rel="noopener">${LUNARIA.telefono}</a></li>
              <li>Lunes a sábado, 9:00 a 18:00</li>
            </ul>
            <div class="footer-cta" style="margin-top:18px">
              <p>Recibe la guía de tallas y las novedades de temporada.</p>
              <form class="footer-form" data-newsletter="footer" novalidate>
                <label for="footerEmail" style="position:absolute;left:-9999px">Correo electrónico</label>
                <input id="footerEmail" name="email" type="email" placeholder="tu@correo.com" required>
                <button type="submit">Unirme</button>
              </form>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} ${LUNARIA.nombre} S.A.S. · NIT ${LUNARIA.nit} · ${LUNARIA.ciudad}</span>
          <nav aria-label="Legales">
            <a href="politicas.html#privacidad">Privacidad</a>
            <a href="politicas.html#terminos">Términos</a>
            <a href="politicas.html#cambios">Cambios</a>
          </nav>
        </div>
      </div>
    </footer>
    <a class="whatsapp-float"
       href="https://wa.me/${LUNARIA.whatsapp}?text=${encodeURIComponent(
         "Hola Lunaria, quiero asesoría para elegir mi talla."
       )}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
      ${ICONS.wa}
    </a>`;
}

/* ---------- Carrito lateral --------------------------------------------- */
function drawerItemHTML(it) {
  const p = it.producto;
  return `
    <div class="drawer-item">
      <img src="${p.imagenes[0].src}" alt="${esc(p.nombre)}" width="74" height="93"
           style="object-position:${p.imagenes[0].pos || "50% 50%"}">
      <div>
        <h4>${esc(p.nombre)}</h4>
        <div class="meta">Talla ${it.talla} · ${esc(p.color)}</div>
        <div class="row">
          <div class="qty qty--sm">
            <button type="button" data-drawer-qty="-1" data-id="${p.id}" data-talla="${it.talla}"
                    aria-label="Quitar una unidad">−</button>
            <input type="text" value="${it.qty}" readonly aria-label="Cantidad">
            <button type="button" data-drawer-qty="1" data-id="${p.id}" data-talla="${it.talla}"
                    aria-label="Añadir una unidad">+</button>
          </div>
          <span class="price">${money(it.total)}</span>
        </div>
        <button class="link-quiet" type="button" data-drawer-remove data-id="${p.id}"
                data-talla="${it.talla}" style="margin-top:8px">Eliminar</button>
      </div>
    </div>`;
}

function renderDrawer() {
  const body = $("[data-drawer-body]");
  const foot = $("[data-drawer-foot]");
  if (!body || !foot) return;

  const items = cart.detailed();

  if (!items.length) {
    body.innerHTML = `
      <div class="drawer-empty">
        <h3>Tu bolsa está vacía</h3>
        <p>Tus pies merecen algo nuevo esta temporada.</p>
        <a class="btn" href="tienda.html" style="margin-top:12px">Ver la colección</a>
      </div>`;
    foot.hidden = true;
    return;
  }

  body.innerHTML =
    items.map(drawerItemHTML).join("") +
    `<div class="drawer-shipping">
       <p>${
         cart.missingForFreeShipping() > 0
           ? `Te faltan <strong>${money(cart.missingForFreeShipping())}</strong> para el envío gratis.`
           : "Tu envío es gratis."
       }</p>
       <div class="progress-bar"><span style="width:${Math.min(
         100,
         (cart.subtotal() / LUNARIA.envioGratisDesde) * 100
       )}%"></span></div>
     </div>`;

  foot.hidden = false;
  foot.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${money(cart.subtotal())}</span></div>
    ${
      cart.discount()
        ? `<div class="summary-row"><span>Descuento ${cart.coupon().codigo}</span><span class="discount">−${money(
            cart.discount()
          )}</span></div>`
        : ""
    }
    <div class="summary-row"><span>Envío</span><span>${
      cart.shipping() === 0 ? "Gratis" : money(cart.shipping())
    }</span></div>
    <div class="summary-row summary-row--total"><span>Total</span><strong>${money(
      cart.total()
    )}</strong></div>
    <a class="btn btn--solid btn--block" href="carrito.html">Ver carrito y pagar</a>
    <button class="link-quiet" type="button" data-close-cart style="width:100%;margin-top:10px">Seguir comprando</button>`;
}

function updateCartCount() {
  const count = cart.count();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

function openDrawer() {
  renderDrawer();
  const drawer = $("#cartDrawer");
  const overlay = $(".drawer-overlay");
  if (!drawer) return;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  if (overlay) overlay.classList.add("is-open");
  document.body.classList.add("no-scroll");
}

function closeDrawer() {
  const drawer = $("#cartDrawer");
  const overlay = $(".drawer-overlay");
  if (!drawer) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  if (overlay) overlay.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

/* ---------- Popup de temporada ------------------------------------------ */
function popupHTML() {
  return `
    <div class="overlay" id="popupOverlay" role="dialog" aria-modal="true"
         aria-labelledby="popupTitle" aria-hidden="true">
      <div class="popup" id="popup">
        <button class="popup-close" type="button" data-popup-close aria-label="Cerrar ventana">✕</button>
        <div class="popup-media">
          <img src="assets/img/popup-temporada.jpg" alt="Tacones rojos junto a adornos de temporada"
               width="900" height="1200" loading="lazy">
          <span>Temporada de fiesta<br>hasta el 24 de diciembre</span>
        </div>
        <div class="popup-body">
          <p class="eyebrow">Regalo de temporada</p>
          <h2 id="popupTitle">20% en tu <em>primera compra</em></h2>
          <p class="popup-intro">Déjanos tu correo y te enviamos el código de descuento de temporada,
             más la guía para elegir tu talla sin adivinar.</p>
          <form class="popup-form" id="popupForm" novalidate>
            <input type="email" name="email" id="popupEmail" placeholder="tu@correo.com"
                   aria-label="Correo electrónico" required>
            <label class="popup-check">
              <input type="checkbox" name="consent" required>
              <span>Acepto la <a href="politicas.html#privacidad" target="_blank">política de tratamiento de datos</a>
              y recibir correos de Lunaria. Puedo darme de baja cuando quiera.</span>
            </label>
            <p class="popup-error" id="popupError" role="alert"></p>
            <button class="btn btn--solid btn--block" type="submit">Quiero mi cupón</button>
          </form>
          <div class="popup-success">
            <p>Listo. Tu código de temporada es:</p>
            <div class="coupon-reveal">
              <strong>${LUNARIA.cupon.codigo}</strong>
              <button type="button" data-copy-coupon>Copiar</button>
            </div>
            <p style="font-size:.82rem">Válido por 14 días en tu primera compra. También lo enviamos a tu correo.</p>
            <a class="btn btn--solid" href="tienda.html?cupon=${LUNARIA.cupon.codigo}">Comprar con mi cupón</a>
          </div>
          <button class="popup-decline" type="button" data-popup-close>
            No gracias, prefiero pagar precio completo
          </button>
        </div>
      </div>
    </div>`;
}

function openPopup() {
  const overlay = $("#popupOverlay");
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  setTimeout(() => {
    const input = $("#popupEmail");
    if (input) input.focus();
  }, 250);
}

function closePopup(remember = true) {
  const overlay = $("#popupOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (remember) store.set("lunaria_popup_v1", Date.now());
}

/* ---------- Modal del reel ---------------------------------------------- */
function videoModalHTML() {
  return `
    <div class="video-modal" id="videoModal" role="dialog" aria-modal="true"
         aria-label="Reel de la colección" aria-hidden="true">
      <button class="video-close" type="button" data-close-video aria-label="Cerrar video">✕</button>
      <video id="reelVideo" controls playsinline preload="none" muted
             poster="assets/img/reel-poster.jpg">
        <source src="assets/video/lunaria-reel.mp4" type="video/mp4">
        Tu navegador no reproduce video HTML5.
      </video>
    </div>`;
}

function abrirVideo() {
  const modal = $("#videoModal");
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  const video = $("#reelVideo");
  if (video) {
    video.currentTime = 0;
    const intento = video.play();
    if (intento && intento.catch) intento.catch(() => {});
  }
}

function cerrarVideo() {
  const modal = $("#videoModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  const video = $("#reelVideo");
  if (video) video.pause();
}

/* ---------- Captura de correos ------------------------------------------ */
function guardarSuscriptor(email, origen) {
  const lista = store.get("lunaria_suscriptores_v1", []);
  const actual = Array.isArray(lista) ? lista : [];
  const existe = actual.some((s) => s.email === email);
  if (!existe) {
    actual.push({ email, origen, fecha: new Date().toISOString() });
    store.set("lunaria_suscriptores_v1", actual);
  }
  return !existe;
}

function initNewsletters() {
  $$("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
        input.focus();
        input.style.borderColor = "#b4574f";
        toast("Revisa tu correo, parece incompleto", "warn");
        return;
      }
      guardarSuscriptor(email, form.dataset.newsletter || "web");
      form.innerHTML = `<p style="color:#cbb38d;font-size:.85rem;margin:0">
        Gracias. Revisa tu correo: te enviamos el cupón ${LUNARIA.cupon.codigo} y la guía de tallas.</p>`;
      toast("Cupón enviado a " + email);
    });
  });
}

/* ---------- Montaje general --------------------------------------------- */
function initLayout() {
  const page = document.body.dataset.page || "";

  const headerSlot = $("#app-header");
  if (headerSlot) headerSlot.innerHTML = headerHTML(page);

  const footerSlot = $("#app-footer");
  if (footerSlot) footerSlot.innerHTML = footerHTML();

  const drawerSlot = $("#app-drawer");
  if (drawerSlot) {
    drawerSlot.innerHTML = `
      <div class="drawer-overlay" data-close-cart></div>
      <aside class="drawer" id="cartDrawer" aria-label="Carrito de compras" aria-hidden="true">
        <div class="drawer-head">
          <h2>Tu bolsa</h2>
          <button class="icon-btn" type="button" data-close-cart aria-label="Cerrar carrito">✕</button>
        </div>
        <div class="drawer-body" data-drawer-body></div>
        <div class="drawer-foot" data-drawer-foot hidden></div>
      </aside>`;
  }

  const modalSlot = $("#app-modal");
  if (modalSlot) modalSlot.innerHTML = popupHTML();

  const videoSlot = $("#app-video");
  if (videoSlot) videoSlot.innerHTML = videoModalHTML();

  updateCartCount();
  renderFavCount();
  initNewsletters();

  if (!store.get("lunaria_cookies_v1", false)) {
    const bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.innerHTML = `
      <p>Usamos cookies para recordar tu carrito y mejorar tu experiencia. Puedes leer nuestra
      <a href="politicas.html#privacidad">política de datos</a>.</p>
      <button class="btn btn--solid" type="button" data-cookie-accept>Entendido</button>`;
    document.body.appendChild(bar);
    $("[data-cookie-accept]", bar).addEventListener("click", () => {
      store.set("lunaria_cookies_v1", true);
      bar.remove();
    });
  }

  const header = $("#siteHeader");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $(".nav-toggle");
  const mobileNav = $("#mobileNav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("no-scroll", open);
    });
    $$("a", mobileNav).forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      })
    );
  }

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-cart]");
    if (open) {
      e.preventDefault();
      openDrawer();
      return;
    }
    if (e.target.closest("[data-close-cart]")) closeDrawer();

    if (e.target.closest("[data-open-video]")) {
      e.preventDefault();
      abrirVideo();
      return;
    }
    if (e.target.closest("[data-close-video]") || e.target.id === "videoModal") {
      cerrarVideo();
      return;
    }

    const qtyBtn = e.target.closest("[data-drawer-qty]");
    if (qtyBtn) {
      const { id, talla } = qtyBtn.dataset;
      const current = cart
        .items()
        .find((it) => it.id === id && Number(it.talla) === Number(talla));
      if (current) cart.setQty(id, talla, Number(current.qty) + Number(qtyBtn.dataset.drawerQty));
      renderDrawer();
      return;
    }

    const removeBtn = e.target.closest("[data-drawer-remove]");
    if (removeBtn) {
      cart.remove(removeBtn.dataset.id, Number(removeBtn.dataset.talla));
      renderDrawer();
      toast("Producto eliminado del carrito");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDrawer();
    closePopup();
    cerrarVideo();
    if (mobileNav && mobileNav.classList.contains("is-open")) {
      mobileNav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    }
  });

  document.addEventListener("lunaria:cart", () => {
    updateCartCount();
    const drawer = $("#cartDrawer");
    if (drawer && drawer.classList.contains("is-open")) renderDrawer();
  });

  document.addEventListener("lunaria:favs", renderFavCount);

  const params = new URLSearchParams(location.search);
  const cuponUrl = params.get("cupon");
  if (cuponUrl) {
    cart.setCoupon(cuponUrl);
    store.set("lunaria_popup_v1", Date.now());
  }

  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  initPopup(page);
}



/* ---------- Lógica del popup -------------------------------------------- */
function initPopup(page) {
  const overlay = $("#popupOverlay");
  if (!overlay) return;

  const yaVisto = store.get("lunaria_popup_v1", 0);
  const dias = LUNARIA.popupDias * 24 * 60 * 60 * 1000;
  const puedeMostrar = !yaVisto || Date.now() - Number(yaVisto) > dias;
  const paginaQuieta = ["carrito", "checkout"].includes(page);

  if (!puedeMostrar || paginaQuieta) return;

  let mostrado = false;
  const mostrar = () => {
    if (mostrado) return;
    mostrado = true;
    openPopup();
  };

  const timer = setTimeout(mostrar, LUNARIA.popupRetraso);

  const onScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const avance = total > 0 ? window.scrollY / total : 0;
    if (avance > 0.45) {
      mostrar();
      window.removeEventListener("scroll", onScroll);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const onLeave = (e) => {
    if (e.clientY <= 0 && window.innerWidth > 900) mostrar();
  };
  document.addEventListener("mouseout", onLeave);

  document.addEventListener("lunaria:popup-off", () => {
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("mouseout", onLeave);
  });

  $$("[data-popup-close]").forEach((btn) =>
    btn.addEventListener("click", () => closePopup())
  );

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  const form = $("#popupForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#popupEmail").value.trim();
    const consent = form.querySelector('input[name="consent"]').checked;
    const error = $("#popupError");

    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      error.textContent = "Escribe un correo válido para enviarte el cupón.";
      $("#popupEmail").focus();
      return;
    }
    if (!consent) {
      error.textContent = "Necesitamos tu autorización para escribirte (Ley 1581 de 2012).";
      return;
    }

    error.textContent = "";
    guardarSuscriptor(email, "popup");
    $("#popup").classList.add("is-success");
    document.dispatchEvent(new CustomEvent("lunaria:popup-off"));
    toast("Cupón " + LUNARIA.cupon.codigo + " reservado para ti");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-copy-coupon]")) return;
    const texto = LUNARIA.cupon.codigo;
    const done = () => toast("Código copiado: " + texto);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(done, done);
    } else {
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        /* sin permiso de portapapeles */
      }
      area.remove();
      done();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLayout);
} else {
  initLayout();
}

