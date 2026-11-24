/* ==========================================================================
   LUNARIA · core.js
   Utilidades, estado del carrito, favoritos y avisos.
   Depende de data.js
   ========================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);

const esc = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* modo privado o cuota llena: la tienda sigue funcionando */
    }
  }
};

const byId = (id) => PRODUCTOS.find((p) => p.id === id);
const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

const ICONS = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="3.4"/><path d="M5 20c1.2-3.4 3.7-5 7-5s5.8 1.6 7 5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.6-5.7L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.6 5.7L4 16"/><path d="M4 20v-4h4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-13 0 9-5 13-14 13Z"/><path d="M5 19c3-5 6-7 10-8.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.3 5 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 9.7 9.7 9Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a10 10 0 0 1-4-2.6 9 9 0 0 1-2-3.2c-.2-.6-.2-1.2 0-1.6.2-.4.9-1.1 1.1-1.2.3-.1.6-.1.8.2l.9 1.6c.1.3.1.5-.1.7l-.5.6c-.1.2-.2.4 0 .6.4.7 1.6 1.9 2.4 2.3.2.1.4.1.6-.1l.6-.6c.2-.2.4-.2.6-.1l1.6.9c.3.2.4.4.4.6 0 .1 0 .2-.1.4Z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>'
};

/* ---------- Carrito ------------------------------------------------------ */
const CART_KEY = "lunaria_carrito_v1";
const FAV_KEY = "lunaria_favoritos_v1";
const COUPON_KEY = "lunaria_cupon_v1";

const cart = {
  items() {
    const raw = store.get(CART_KEY, []);
    return Array.isArray(raw)
      ? raw.filter((it) => byId(it.id) && Number(it.talla) > 0)
      : [];
  },
  save(items) {
    store.set(CART_KEY, items);
    document.dispatchEvent(new CustomEvent("lunaria:cart"));
  },
  count() {
    return this.items().reduce((acc, it) => acc + Number(it.qty || 0), 0);
  },
  add(id, talla, qty = 1) {
    const producto = byId(id);
    if (!producto || !talla) return false;
    const items = this.items();
    const found = items.find((it) => it.id === id && Number(it.talla) === Number(talla));
    if (found) {
      found.qty = Math.min(9, Number(found.qty) + Number(qty));
    } else {
      items.push({ id, talla: Number(talla), qty: Math.min(9, Number(qty) || 1) });
    }
    this.save(items);
    return true;
  },
  setQty(id, talla, qty) {
    const items = this.items();
    const found = items.find((it) => it.id === id && Number(it.talla) === Number(talla));
    if (!found) return;
    const value = Math.max(0, Math.min(9, Number(qty) || 0));
    if (value === 0) {
      this.remove(id, talla);
      return;
    }
    found.qty = value;
    this.save(items);
  },
  remove(id, talla) {
    this.save(
      this.items().filter((it) => !(it.id === id && Number(it.talla) === Number(talla)))
    );
  },
  clear() {
    this.save([]);
    store.set(COUPON_KEY, null);
  },
  detailed() {
    return this.items()
      .map((it) => {
        const producto = byId(it.id);
        return { ...it, producto, total: producto.precio * Number(it.qty) };
      })
      .filter((it) => it.producto);
  },
  subtotal() {
    return this.detailed().reduce((acc, it) => acc + it.total, 0);
  },
  coupon() {
    const code = store.get(COUPON_KEY, null);
    if (!code) return null;
    if (String(code).toUpperCase() !== LUNARIA.cupon.codigo) return null;
    if (this.subtotal() < LUNARIA.cupon.minima) return null;
    return LUNARIA.cupon;
  },
  discount() {
    const coupon = this.coupon();
    return coupon ? Math.round((this.subtotal() * coupon.porcentaje) / 100) : 0;
  },
  shipping() {
    if (!this.count()) return 0;
    return this.subtotal() >= LUNARIA.envioGratisDesde ? 0 : LUNARIA.costoEnvio;
  },
  total() {
    return Math.max(0, this.subtotal() - this.discount() + this.shipping());
  },
  missingForFreeShipping() {
    return Math.max(0, LUNARIA.envioGratisDesde - this.subtotal());
  },
  setCoupon(code) {
    store.set(COUPON_KEY, code ? String(code).toUpperCase() : null);
    document.dispatchEvent(new CustomEvent("lunaria:cart"));
  }
};

/* ---------- Favoritos ---------------------------------------------------- */
const favoritos = {
  all() {
    const raw = store.get(FAV_KEY, []);
    return Array.isArray(raw) ? raw.filter((id) => byId(id)) : [];
  },
  has(id) {
    return this.all().includes(id);
  },
  toggle(id) {
    const list = this.all();
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);
    store.set(FAV_KEY, list);
    document.dispatchEvent(new CustomEvent("lunaria:favs"));
    return idx < 0;
  }
};

/* ---------- Avisos ------------------------------------------------------- */
function toast(message, variant) {
  let stack = $(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = "toast" + (variant === "warn" ? " toast--warn" : "");
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 350);
  }, 3400);
}

/* ---------- Tarjeta de producto ----------------------------------------- */
function productCard(p, opts = {}) {
  const alt = p.imagenes[1] ? p.imagenes[1].src : p.imagenes[0].src;
  const agotado = p.tallas.every((t) => p.agotadas.includes(t));
  const descuento = p.antes ? Math.round(100 - (p.precio / p.antes) * 100) : 0;
  const fav = favoritos.has(p.id);

  return `
    <article class="card" data-card="${p.id}">
      <div class="card-media">
        <a href="producto.html?id=${p.id}" aria-label="Ver ${esc(p.nombre)}">
          <img src="${p.imagenes[0].src}" alt="${esc(p.nombre)} — ${esc(p.subtitulo)}"
               width="1000" height="1250" loading="${opts.eager ? "eager" : "lazy"}"
               style="object-position:${p.imagenes[0].pos || "50% 50%"}">
          <img class="card-alt" src="${alt}" alt="" aria-hidden="true" loading="lazy"
               width="1000" height="1250">
        </a>
        <div class="card-tag">
          ${p.etiqueta ? `<span class="tag ${p.etiqueta === "Outlet" ? "tag--wine" : ""}">${esc(p.etiqueta)}</span>` : ""}
          ${agotado ? '<span class="tag">Agotado</span>' : ""}
        </div>
        <button class="card-fav${fav ? " is-active" : ""}" type="button"
                data-fav="${p.id}" aria-pressed="${fav}" aria-label="Guardar ${esc(p.nombre)} en favoritos">
          ${ICONS.heart}
        </button>
        <div class="card-overlay">
          <a class="btn" href="producto.html?id=${p.id}">Ver y elegir talla</a>
        </div>
      </div>
      <div class="card-body">
        <h3><a href="producto.html?id=${p.id}">${esc(p.nombre)}</a></h3>
        <span class="card-sub">${esc(p.subtitulo)}</span>
        <div class="card-price">
          <span>${money(p.precio)}</span>
          ${p.antes ? `<del>${money(p.antes)}</del><span class="off">-${descuento}%</span>` : ""}
        </div>
      </div>
    </article>`;
}

function bindFavButtons(root = document) {
  $$("[data-fav]", root).forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const activo = favoritos.toggle(btn.dataset.fav);
      btn.classList.toggle("is-active", activo);
      btn.setAttribute("aria-pressed", String(activo));
      toast(activo ? "Guardado en favoritos" : "Eliminado de favoritos");
    });
  });
}

function renderFavCount() {
  const total = favoritos.all().length;
  $$('a[href="tienda.html?fav=1"]').forEach((a) => {
    a.setAttribute("aria-label", `Favoritos (${total})`);
  });
}

