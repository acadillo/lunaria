/* LUNARIA · home.js — pinta la selección de temporada */
(function () {
  "use strict";
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  const ids = ["amelie", "noir", "perla", "odette", "siena", "lazo", "aurora", "lua"];
  const lista = ids.map((id) => byId(id)).filter(Boolean);

  grid.innerHTML = lista.map((p, i) => productCard(p, { eager: i < 4 })).join("");
  bindFavButtons(grid);
})();
