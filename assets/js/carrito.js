/* ==========================================================================
   LUNARIA · carrito.js
   Carrito, cupón, checkout simulado y confirmación de pedido.
   ========================================================================== */

(function () {
  "use strict";

  const root = $("#cartContent");
  if (!root) return;

  // Evita que el estado vacío aparezca debajo de la confirmación del pedido.
  let pedidoConfirmado = false;

  const DEPARTAMENTOS = [
    "Antioquia", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá", "Caldas",
    "Cundinamarca", "Huila", "Magdalena", "Nariño", "Norte de Santander",
    "Quindío", "Risaralda", "Santander", "Tolima", "Valle del Cauca", "Otro"
  ];

  function filaCarrito(it) {
    const p = it.producto;
    return `
      <div class="cart-row" data-fila="${p.id}-${it.talla}">
        <a href="producto.html?id=${p.id}">
          <img src="${p.imagenes[0].src}" alt="${esc(p.nombre)}" width="104" height="130"
               style="object-position:${p.imagenes[0].pos || "50% 50%"}">
        </a>
        <div>
          <h3><a href="producto.html?id=${p.id}">${esc(p.nombre)}</a></h3>
          <p class="meta">Talla ${it.talla} · ${esc(p.color)} · ${esc(p.material)}</p>
          <div class="row-controls">
            <div class="qty qty--sm">
              <button type="button" data-cart-qty="-1" data-id="${p.id}" data-talla="${it.talla}"
                      aria-label="Quitar una unidad">−</button>
              <input type="text" value="${it.qty}" readonly aria-label="Cantidad de ${esc(p.nombre)}">
              <button type="button" data-cart-qty="1" data-id="${p.id}" data-talla="${it.talla}"
                      aria-label="Añadir una unidad">+</button>
            </div>
            <button class="link-quiet" type="button" data-cart-remove data-id="${p.id}"
                    data-talla="${it.talla}">Eliminar</button>
          </div>
        </div>
        <div class="price-col">
          <span class="line-total">${money(it.total)}</span>
          ${p.antes ? `<del>${money(p.antes * it.qty)}</del>` : ""}
        </div>
      </div>`;
  }

  function resumenHTML(incluyeBoton) {
    const coupon = cart.coupon();
    return `
      <h2>Resumen</h2>
      <div class="summary-row"><span>Subtotal (${cart.count()} ${cart.count() === 1 ? "par" : "pares"})</span>
        <span>${money(cart.subtotal())}</span></div>
      ${
        coupon
          ? `<div class="summary-row"><span>Descuento ${coupon.codigo}</span>
             <span class="discount">−${money(cart.discount())}</span></div>`
          : ""
      }
      <div class="summary-row"><span>Envío</span><span>${
        cart.shipping() === 0 ? "Gratis" : money(cart.shipping())
      }</span></div>
      <div class="summary-row summary-row--total"><span>Total</span><strong>${money(
        cart.total()
      )}</strong></div>

      <div class="coupon-box">
        <label for="cuponInput" style="position:absolute;left:-9999px">Código de descuento</label>
        <input id="cuponInput" type="text" placeholder="Código de descuento"
               value="${coupon ? coupon.codigo : ""}">
        <button type="button" id="aplicarCupon">Aplicar</button>
      </div>
      <p class="coupon-msg" id="cuponMsg"></p>

      ${
        incluyeBoton
          ? `<a class="btn btn--solid btn--block" href="#checkout">Finalizar compra</a>`
          : ""
      }

      <ul class="trust-list">
        <li>${ICONS.lock}<span>Pago seguro. No guardamos datos de tu tarjeta.</span></li>
        <li>${ICONS.refresh}<span>Cambios gratis hasta 15 días.</span></li>
        <li>${ICONS.truck}<span>Enviamos en 24 horas hábiles desde Medellín.</span></li>
      </ul>
      <div class="pay-methods">
        <span>Visa</span><span>Mastercard</span><span>PSE</span><span>Nequi</span><span>Contra entrega</span>
      </div>`;
  }

  function renderCarrito() {
    if (pedidoConfirmado) return;
    const items = cart.detailed();
    const vacio = $("#emptyCart");
    const contenido = $("#cartContent");

    if (!items.length) {
      if (vacio) vacio.hidden = false;
      if (contenido) contenido.hidden = true;
      return;
    }

    if (vacio) vacio.hidden = true;
    if (contenido) contenido.hidden = false;

    const faltante = cart.missingForFreeShipping();
    $("#progressCard").innerHTML = `
      <p>${
        faltante > 0
          ? `Estás a <strong>${money(faltante)}</strong> del envío gratis.`
          : "¡Listo! Tu envío es gratis."
      }</p>
      <div class="progress-bar"><span style="width:${Math.min(
        100,
        (cart.subtotal() / LUNARIA.envioGratisDesde) * 100
      )}%"></span></div>`;

    $("#cartList").innerHTML = items.map(filaCarrito).join("");
    $("#summary").innerHTML = resumenHTML(true);

    $("#cuponInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") aplicarCupon();
    });
    $("#aplicarCupon").addEventListener("click", aplicarCupon);
  }

  function aplicarCupon() {
    const input = $("#cuponInput");
    const msg = $("#cuponMsg");
    const codigo = (input.value || "").trim().toUpperCase();

    if (!codigo) {
      msg.textContent = "Escribe un código para aplicarlo.";
      msg.className = "coupon-msg error";
      return;
    }
    if (codigo !== LUNARIA.cupon.codigo) {
      msg.textContent = "Ese código no existe o ya venció.";
      msg.className = "coupon-msg error";
      return;
    }
    cart.setCoupon(codigo);
    renderCarrito();
    actualizarCheckoutTotal();
    const msgNuevo = $("#cuponMsg");
    if (msgNuevo) {
      msgNuevo.textContent = `Cupón aplicado: ${LUNARIA.cupon.porcentaje}% de descuento.`;
      msgNuevo.className = "coupon-msg ok";
    }
  }

  /* ---------- Checkout --------------------------------------------------- */
  function actualizarCheckoutTotal() {
    const cont = $("#checkoutTotals");
    if (!cont) return;
    const coupon = cart.coupon();
    cont.innerHTML = `
      <h2>Tu pedido</h2>
      <div id="checkoutItems">
        ${cart
          .detailed()
          .map(
            (it) => `
          <div class="summary-row">
            <span>${esc(it.producto.nombre)} · ${it.talla} × ${it.qty}</span>
            <span>${money(it.total)}</span>
          </div>`
          )
          .join("")}
      </div>
      <div class="summary-row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:12px">
        <span>Subtotal</span><span>${money(cart.subtotal())}</span>
      </div>
      ${
        coupon
          ? `<div class="summary-row"><span>Descuento ${coupon.codigo}</span>
             <span class="discount">−${money(cart.discount())}</span></div>`
          : ""
      }
      <div class="summary-row"><span>Envío</span><span>${
        cart.shipping() === 0 ? "Gratis" : money(cart.shipping())
      }</span></div>
      <div class="summary-row summary-row--total"><span>Total</span><strong>${money(
        cart.total()
      )}</strong></div>
      <p class="checkout-note">Los precios incluyen IVA. Este sitio es una demostración:
        no se procesan pagos reales.</p>`;
  }

  function generarNumeroPedido() {
    return "LN-" + String(Date.now()).slice(-6);
  }

  function validarCampo(input) {
    const field = input.closest(".field");
    if (!field) return true;
    const valor = (input.value || "").trim();
    let ok = true;

    if (input.required && !valor) ok = false;
    if (ok && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valor)) ok = false;
    if (ok && input.type === "tel" && valor.replace(/\D/g, "").length < 7) ok = false;

    field.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  function mostrarConfirmacion(datos) {
    const numero = generarNumeroPedido();
    const total = cart.total();
    const resumen = cart
      .detailed()
      .map((it) => `${it.producto.nombre} (talla ${it.talla}) x${it.qty}`)
      .join(", ");

    const mensaje = encodeURIComponent(
      `Hola Lunaria, acabo de hacer el pedido ${numero}.\n` +
        `Productos: ${resumen}\n` +
        `Total: ${money(total)}\n` +
        `Entrega: ${datos.direccion}, ${datos.ciudad} (${datos.departamento})\n` +
        `Pago: ${datos.pago}`
    );

    $("#cartContent").hidden = true;
    const conf = $("#confirmation");
    conf.hidden = false;
    conf.innerHTML = `
      <div class="confirmation">
        <div class="check-circle">✓</div>
        <h2>Gracias, ${esc(datos.nombre)}</h2>
        <p>Tu pedido quedó registrado. Te escribimos a <strong>${esc(datos.email)}</strong>
           con la confirmación y la guía de tallas de tu modelo.</p>
        <span class="order-num">Pedido ${numero}</span>
        <div style="text-align:left;max-width:420px;margin:0 auto 24px">
          <div class="summary-row"><span>Entrega estimada</span><span>2 a 4 días hábiles</span></div>
          <div class="summary-row"><span>Dirección</span><span>${esc(datos.direccion)}</span></div>
          <div class="summary-row"><span>Ciudad</span><span>${esc(datos.ciudad)}, ${esc(datos.departamento)}</span></div>
          <div class="summary-row"><span>Medio de pago</span><span>${esc(datos.pago)}</span></div>
          <div class="summary-row summary-row--total"><span>Total</span><strong>${money(total)}</strong></div>
        </div>
        <a class="btn btn--solid" href="https://wa.me/${LUNARIA.whatsapp}?text=${mensaje}"
           target="_blank" rel="noopener">Confirmar por WhatsApp</a>
        <a class="btn" href="tienda.html" style="margin-left:8px">Seguir comprando</a>
        <p class="checkout-note" style="margin-top:24px">Demostración: no se realizó ningún cobro.
          En producción este paso se conecta con la pasarela de pagos y el correo transaccional.</p>
      </div>`;

    pedidoConfirmado = true;
    cart.clear();
    updateCartCount();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initCheckout() {
    const form = $("#checkoutForm");
    if (!form) return;

    const select = $("#departamento");
    if (select) {
      select.innerHTML =
        '<option value="">Selecciona…</option>' +
        DEPARTAMENTOS.map((d) => `<option value="${d}">${d}</option>`).join("");
    }

    $$("input, select", form).forEach((input) => {
      input.addEventListener("blur", () => {
        if (input.required) validarCampo(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const campos = $$("input[required], select[required]", form);
      const invalidos = campos.filter((input) => !validarCampo(input));

      if (invalidos.length) {
        invalidos[0].focus();
        toast("Revisa los campos marcados", "warn");
        return;
      }

      const consent = $("#consentDatos");
      if (consent && !consent.checked) {
        toast("Necesitamos tu autorización de datos para enviar el pedido", "warn");
        consent.focus();
        return;
      }

      const pago = $('input[name="pago"]:checked', form);
      if (!pago) {
        toast("Elige un medio de pago", "warn");
        return;
      }

      mostrarConfirmacion({
        nombre: $("#nombre").value.trim(),
        email: $("#email").value.trim(),
        direccion: $("#direccion").value.trim(),
        ciudad: $("#ciudad").value.trim(),
        departamento: $("#departamento").value,
        pago: pago.dataset.label || pago.value
      });
    });

    actualizarCheckoutTotal();
  }

  /* ---------- Eventos e inicio ------------------------------------------ */
  document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-cart-qty]");
    if (qtyBtn) {
      const { id, talla } = qtyBtn.dataset;
      const actual = cart
        .items()
        .find((it) => it.id === id && Number(it.talla) === Number(talla));
      if (actual) {
        cart.setQty(id, Number(talla), Number(actual.qty) + Number(qtyBtn.dataset.cartQty));
      }
      return;
    }

    const removeBtn = e.target.closest("[data-cart-remove]");
    if (removeBtn) {
      cart.remove(removeBtn.dataset.id, Number(removeBtn.dataset.talla));
      toast("Producto eliminado del carrito");
    }
  });

  document.addEventListener("lunaria:cart", () => {
    renderCarrito();
    actualizarCheckoutTotal();
  });

  renderCarrito();
  initCheckout();

  const cuponUrl = new URLSearchParams(location.search).get("cupon");
  if (cuponUrl && cart.coupon()) {
    const msg = $("#cuponMsg");
    if (msg) {
      msg.textContent = `Cupón ${LUNARIA.cupon.codigo} aplicado: -${LUNARIA.cupon.porcentaje}%.`;
      msg.className = "coupon-msg ok";
    }
  }
})();

