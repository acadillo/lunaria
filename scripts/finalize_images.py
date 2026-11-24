"""Descarga las imagenes definitivas del sitio a assets/img con nombres semanticos."""

import concurrent.futures
import os
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(BASE, "assets", "img")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"

# destino : (slug de Burst, ancho en px)
IMAGES = {
    # --- Editorial / marca ---
    "hero.jpg": ("flowing-summer-green-dress", 1900),
    "campaña-temporada.jpg": ("red-party-dress-in-silver-room", 1500),
    "editorial-boutique.jpg": ("person-shops-in-a-clothing-store", 1400),
    "editorial-minimal.jpg": ("ruffled-summer-dress-white", 1200),
    "editorial-retrato.jpg": ("model-in-gold-fashion", 1000),
    "editorial-verde.jpg": ("woman-in-green-dress-walking-between-archways", 1200),
    "tallas.jpg": ("woman-resting-her-feet-by-the-window", 1200),
    "popup-temporada.jpg": ("red-women-s-shoes-and-christmas-decorations-on-the-floor", 900),
    "ocasion-diario.jpg": ("high-heels-with-baggy-fashion", 900),
    "ocasion-oficina.jpg": ("model-walks-in-heels-in-the-city", 900),
    "ocasion-fiesta.jpg": ("fashionable-woman-sitting-on-stairs", 900),
    "look-calle.jpg": ("women-walk-into-store-front", 900),
    # --- Productos ---
    "p-amelie.jpg": ("a-pair-of-white-womens-shoes", 1000),
    "p-noir.jpg": ("black-and-nude-boots-on-red", 1000),
    "p-siena.jpg": ("boots-against-the-wall", 1000),
    "p-perla.jpg": ("fashionable-high-heels-with-hanging-tassels", 1000),
    "p-coco.jpg": ("heels-and-flowers", 1000),
    "p-lua.jpg": ("loafers-leaning-along-white-wall", 1000),
    "p-estrella.jpg": ("studded-flats", 1000),
    "p-bruna.jpg": ("suede-boots-fashion", 1000),
    "p-odette.jpg": ("resting-by-a-window-in-heels", 1000),
    "p-aurora.jpg": ("clear-bridal-shoes-with-crystal-decoration", 1000),
    "p-argent.jpg": ("silver-wingtip-shoes-on-silver-background", 1000),
    "p-dama.jpg": ("tattoo-high-heels", 1000),
    "p-mar.jpg": ("sandals-in-sand", 1000),
    "p-otono.jpg": ("black-shoes-on-contrete-with-scattered-leaves", 1000),
    "p-roble.jpg": ("boots-in-autumn-leaves", 1000),
    "p-lazo.jpg": ("high-heels-on-steps", 1000),
    "p-milan.jpg": ("women-walk-into-store-front", 1000),
}


def grab(item):
    name, (slug, width) = item
    path = os.path.join(DEST, name)
    if os.path.exists(path) and os.path.getsize(path) > 8000:
        return name, "cached", os.path.getsize(path)
    url = (
        f"https://burst.shopifycdn.com/photos/{slug}.jpg"
        f"?width={width}&format=pjpg&exif=0&iptc=0"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp, open(path, "wb") as fh:
            fh.write(resp.read())
        return name, "ok", os.path.getsize(path)
    except Exception as exc:  # noqa: BLE001
        return name, "fail " + str(exc), 0


def main():
    os.makedirs(DEST, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(grab, IMAGES.items()))
    total = 0
    for name, status, size in results:
        total += size
        if not status.startswith(("ok", "cached")):
            print("FALLO", name, status)
    print(f"archivos: {len(results)} | peso total: {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
