/* Prueba de humo de la lógica de precios (no forma parte del sitio). */
const fs = require("fs");
const vm = require("vm");

const memoria = {};
const ctx = {
  localStorage: {
    getItem: (k) => (k in memoria ? memoria[k] : null),
    setItem: (k, v) => {
      memoria[k] = String(v);
    }
  },
  document: { dispatchEvent() {}, addEventListener() {} },
  CustomEvent: class CustomEvent {},
  Intl,
  console
};
vm.createContext(ctx);

const fuente = `${fs.readFileSync("assets/js/data.js", "utf8")}
${fs.readFileSync("assets/js/core.js", "utf8")}
(() => {
  const out = [];
  const check = (nombre, real, esperado) => {
    out.push({ nombre, real, esperado, ok: JSON.stringify(real) === JSON.stringify(esperado) });
  };

  check("productos cargados", PRODUCTOS.length, 17);
  check("carrito vacío", cart.count(), 0);

  cart.add("amelie", 37, 1);          // 289.000
  cart.add("noir", 38, 2);            // 349.000 x2
  check("unidades", cart.count(), 3);
  check("subtotal", cart.subtotal(), 289000 + 698000);
  check("envío gratis sobre umbral", cart.shipping(), 0);

  cart.setCoupon("LUNARIA20");
  check("descuento 20%", cart.discount(), Math.round(987000 * 0.2));
  check("total con cupón", cart.total(), 987000 - 197400);

  cart.setCoupon("NOEXISTE");
  check("cupón inválido ignorado", cart.coupon(), null);
  check("total sin cupón", cart.total(), 987000);

  cart.remove("noir", 38);
  check("quitar producto", cart.count(), 1);
  check("subtotal sobre umbral", cart.subtotal(), 289000);
  check("envío gratis", cart.shipping(), 0);

  cart.remove("amelie", 37);
  cart.add("coco", 37, 1);            // 199.000, bajo el umbral de 250.000
  check("subtotal bajo umbral", cart.subtotal(), 199000);
  check("envío cobrado bajo umbral", cart.shipping(), 15000);
  cart.setCoupon("LUNARIA20");
  check("total con envío", cart.total(), 199000 - 39800 + 15000);

  cart.setQty("coco", 37, 0);
  check("carrito vacío tras qty 0", cart.count(), 0);
  check("envío en carrito vacío", cart.shipping(), 0);

  check("formato moneda", money(289000).replace(/\\u00a0/g, " "), "$ 289.000");

  return JSON.stringify(out);
})()`;

const resultados = JSON.parse(vm.runInContext(fuente, ctx));
let fallos = 0;
resultados.forEach((r) => {
  if (!r.ok) {
    fallos += 1;
    console.log(`FALLO ${r.nombre}: ${JSON.stringify(r.real)} != ${JSON.stringify(r.esperado)}`);
  } else {
    console.log(`ok    ${r.nombre}`);
  }
});
console.log(fallos === 0 ? "\\nTODAS LAS PRUEBAS PASAN" : `\\n${fallos} FALLOS`);
process.exit(fallos === 0 ? 0 : 1);
