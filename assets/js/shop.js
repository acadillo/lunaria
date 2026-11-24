/* ==========================================================================
   LUNARIA · shop.js
   Catálogo: filtros, orden, contador, chips activos y estado vacío.
   ========================================================================== */

(function () {
  "use strict";

  const grid = $("#productGrid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const modoFavoritos = params.get("fav") === "1";

  const filtros = {
    categoria: new Set(),
    talla: new Set(),
    tacon: new Set(),
    color: new Set(),
    precio: ""
  };

  if (params.get("cat")) filtros.categoria.add(params.get("cat"));
  if (params.get("talla")) filtros.talla.add(Number(params.get("talla")));
  if (params.get("tacon")) filtros.tacon.add(params.get("tacon"));
  if (params.get("color")) filtros.color.add(params.get("color"));
  let soloEtiqueta = params.get("etiqueta") || "";

  const RANGOS = {
    "": () => true,
    "0-200000": (p) => p.precio < 200000,
    "200000-300000": (p) => p.precio >= 200000 && p.precio <= 300000,
    "300000-400000": (p) => p.precio > 300000 && p.precio <= 400000,
    "400000-9999999": (p) => p.precio > 400000
  };

  function contadores(lista) {
    return {
      categoria: CATEGORIAS.reduce((acc, c) => {
        acc[c] = lista.filter((p) => p.categoria === c).length;
        return acc;
      }, {}),
      color: COLORES.reduce((acc, c) => {
        acc[c.grupo] = lista.filter((p) => p.grupoColor === c.grupo).length;
        return acc;
      }, {})
    };
  }

  function filtrados() {
    let lista = PRODUCTOS.slice();

    if (modoFavoritos) {
      const favs = favoritos.all();
      lista = lista.filter((p) => favs.includes(p.id));
    }
    if (filtros.categoria.size) {
      lista = lista.filter((p) => filtros.categoria.has(p.categoria));
    }
    if (filtros.talla.size) {
      lista = lista.filter((p) =>
        Array.from(filtros.talla).some((t) => p.tallas.includes(t) && !p.agotadas.includes(t))
      );
    }
    if (filtros.tacon.size) {
      lista = lista.filter((p) => filtros.tacon.has(p.tacon));
    }
    if (filtros.color.size) {
      lista = lista.filter((p) => filtros.color.has(p.grupoColor));
    }
    if (filtros.precio && RANGOS[filtros.precio]) {
      lista = lista.filter(RANGOS[filtros.precio]);
    }
    if (soloEtiqueta) {
      lista = lista.filter((p) => p.etiqueta === soloEtiqueta);
    }

    const orden = $("#orden") ? $("#orden").value : "destacados";
    if (orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
    if (orden === "valoracion") lista.sort((a, b) => b.valoracion - a.valoracion);
    if (orden === "novedades") {
      lista.sort(
        (a, b) => (b.etiqueta === "Nuevo" ? 1 : 0) - (a.etiqueta === "Nuevo" ? 1 : 0)
      );
    }
    return lista;
  }

  function pintarChips() {
    const cont = $("#activeFilters");
    if (!cont) return;
    const chips = [];

    filtros.categoria.forEach((c) => chips.push({ tipo: "categoria", valor: c, texto: c }));
    filtros.tacon.forEach((t) =>
      chips.push({ tipo: "tacon", valor: t, texto: `Tacón ${t.toLowerCase()}` })
    );
    filtros.talla.forEach((t) =>
      chips.push({ tipo: "talla", valor: t, texto: `Talla ${t}` })
    );
    filtros.color.forEach((c) => {
      const nombre = (COLORES.find((x) => x.grupo === c) || {}).nombre || c;
      chips.push({ tipo: "color", valor: c, texto: nombre });
    });
    if (filtros.precio) {
      const [desde, hasta] = filtros.precio.split("-");
      chips.push({
        tipo: "precio",
        valor: filtros.precio,
        texto: `${money(Number(desde))} – ${money(Number(hasta))}`
      });
    }
    if (soloEtiqueta) chips.push({ tipo: "etiqueta", valor: soloEtiqueta, texto: soloEtiqueta });
    if (modoFavoritos) chips.push({ tipo: "fav", valor: "1", texto: "Solo favoritos" });

    cont.innerHTML = chips.length
      ? chips
          .map(
            (chip) => `<span class="chip">${esc(chip.texto)}
              <button type="button" data-chip="${chip.tipo}" data-valor="${chip.valor}"
                      aria-label="Quitar filtro ${esc(chip.texto)}">×</button>
            </span>`
          )
          .join("") + '<button class="link-quiet" type="button" id="limpiarTodo">Limpiar todo</button>'
      : "";

    const limpiar = $("#limpiarTodo");
    if (limpiar) {
      limpiar.addEventListener("click", () => {
        filtros.categoria.clear();
        filtros.talla.clear();
        filtros.tacon.clear();
        filtros.color.clear();
        filtros.precio = "";
        soloEtiqueta = "";
        $$(".filters input[type=checkbox]").forEach((i) => (i.checked = false));
        $$(".filters input[type=radio]").forEach((i) => (i.checked = false));
        if (modoFavoritos) {
          location.href = "tienda.html";
          return;
        }
        render();
      });
    }
  }

  function render() {
    const lista = filtrados();
    const count = $("#resultCount");
    if (count) {
      count.textContent = `${lista.length} ${lista.length === 1 ? "pieza" : "piezas"}`;
    }

    const vacio = $("#emptyState");
    if (!lista.length) {
      grid.innerHTML = "";
      if (vacio) vacio.hidden = false;
    } else {
      if (vacio) vacio.hidden = true;
      grid.innerHTML = lista.map((p) => productCard(p)).join("");
      bindFavButtons(grid);
    }

    pintarChips();
  }

  function crearControles() {
    const listaCategoria = $("#listaCategoria");
    const listaTalla = $("#listaTalla");
    const listaTacon = $("#listaTacon");
    const listaColor = $("#listaColor");
    const listaPrecio = $("#listaPrecio");
    const counts = contadores(PRODUCTOS);

    if (listaCategoria) {
      listaCategoria.innerHTML = CATEGORIAS.map(
        (c) => `
        <label class="check">
          <input type="checkbox" name="categoria" value="${c}"${filtros.categoria.has(c) ? " checked" : ""}>
          ${c}<span>${counts.categoria[c]}</span>
        </label>`
      ).join("");
    }

    if (listaTalla) {
      listaTalla.innerHTML = TALLAS.map(
        (t) => `
        <label class="size-chip">
          <input type="checkbox" name="talla" value="${t}"${filtros.talla.has(t) ? " checked" : ""}>
          <span>${t}</span>
        </label>`
      ).join("");
    }

    if (listaTacon) {
      listaTacon.innerHTML = TACONES.map(
        (t) => `
        <label class="check">
          <input type="checkbox" name="tacon" value="${t}"${filtros.tacon.has(t) ? " checked" : ""}>
          ${t}
        </label>`
      ).join("");
    }

    if (listaColor) {
      listaColor.innerHTML = COLORES.map(
        (c) => `
        <label class="check">
          <input type="checkbox" name="color" value="${c.grupo}"${filtros.color.has(c.grupo) ? " checked" : ""}>
          ${c.nombre}<span>${counts.color[c.grupo]}</span>
        </label>`
      ).join("");
    }

    if (listaPrecio) {
      const opciones = [
        ["", "Cualquier precio"],
        ["0-200000", "Hasta $ 200.000"],
        ["200000-300000", "$ 200.000 – $ 300.000"],
        ["300000-400000", "$ 300.000 – $ 400.000"],
        ["400000-9999999", "Más de $ 400.000"]
      ];
      listaPrecio.innerHTML = opciones
        .map(
          ([valor, texto]) => `
          <label class="check">
            <input type="radio" name="precio" value="${valor}"${filtros.precio === valor ? " checked" : ""}>
            ${texto}
          </label>`
        )
        .join("");
    }
  }

  function bind() {
    $$(".filters input").forEach((input) => {
      input.addEventListener("change", () => {
        const tipo = input.name;
        if (tipo === "precio") {
          filtros.precio = input.checked ? input.value : "";
        } else if (tipo && filtros[tipo]) {
          const valor = tipo === "talla" ? Number(input.value) : input.value;
          if (input.checked) filtros[tipo].add(valor);
          else filtros[tipo].delete(valor);
        }
        render();
      });
    });

    const orden = $("#orden");
    if (orden) orden.addEventListener("change", render);

    const toggle = $("#filtersToggle");
    const panel = $("#filtersPanel");
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const abierto = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(abierto));
        if (abierto) {
          const back = document.createElement("div");
          back.className = "drawer-overlay is-open";
          back.dataset.cerrarFiltros = "1";
          document.body.appendChild(back);
        } else {
          const back = $("[data-cerrar-filtros]");
          if (back) back.remove();
        }
      });
    }

    document.addEventListener("click", (e) => {
      const cerrar = e.target.closest("[data-cerrar-filtros]");
      if (cerrar) {
        if (panel) panel.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        cerrar.remove();
        return;
      }

      const chip = e.target.closest("[data-chip]");
      if (!chip) return;
      const tipo = chip.dataset.chip;
      const valor = chip.dataset.valor;

      if (tipo === "precio") {
        filtros.precio = "";
      } else if (tipo === "etiqueta") {
        soloEtiqueta = "";
      } else if (tipo === "fav") {
        location.href = "tienda.html";
        return;
      } else if (filtros[tipo]) {
        filtros[tipo].delete(tipo === "talla" ? Number(valor) : valor);
      }

      $$(".filters input").forEach((input) => {
        if (input.name === tipo && input.value === valor) input.checked = false;
        if (tipo === "precio" && input.name === "precio") input.checked = false;
      });
      render();
    });

    $$(".filter-group h3").forEach((h) => {
      h.addEventListener("click", () => h.parentElement.classList.toggle("is-collapsed"));
    });
  }

  crearControles();
  bind();
  render();

  const avisoFav = $("#modoFavoritos");
  if (avisoFav && modoFavoritos) avisoFav.hidden = false;
})();
