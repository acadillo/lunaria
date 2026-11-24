"""
Genera el reel de presentación de Lunaria.

Renderiza 1280x720 a 25 fps con Pillow (tipografía Archivo Black + Manrope)
y codifica H.264 con el ffmpeg estático de imageio-ffmpeg.

Uso:  python scripts/make_video.py
Salidas: assets/video/lunaria-reel.mp4 y assets/img/reel-poster.jpg
"""

import json
import math
import os
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = os.path.join(BASE, "scripts", "_video")
FRAMES = os.path.join(TMP, "frames")
FONT_DISPLAY = os.path.join(BASE, "scripts", "fonts", "ArchivoBlack.ttf")
FONT_UI = os.path.join(BASE, "scripts", "fonts", "Manrope.ttf")
SALIDA_MP4 = os.path.join(BASE, "assets", "video", "lunaria-reel.mp4")
POSTER = os.path.join(BASE, "assets", "img", "reel-poster.jpg")

W, H, FPS = 1280, 720, 25
OVERLAP = 0.32

CREMA = (255, 253, 246)
TINTA = (15, 15, 16)
LIMA = (223, 255, 59)
AZUL = (43, 59, 255)
CORAL = (255, 91, 58)
LILA = (217, 203, 255)
ROSA = (255, 215, 230)
BLANCO = (255, 255, 255)

with open(os.path.join(BASE, "scripts", "_productos.json"), encoding="utf-8") as fh:
    CATALOGO = {p["id"]: p for p in json.load(fh)}


# ---------- utilidades de dibujo ------------------------------------------
def fuente(path, size, weight=None):
    f = ImageFont.truetype(path, size)
    if weight is not None and hasattr(f, "set_variation_by_axes"):
        try:
            f.set_variation_by_axes([weight])
        except Exception:  # noqa: BLE001
            pass
    return f


def ease_out(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def envolver(draw, texto, font, ancho_max):
    palabras = texto.split()
    lineas, actual = [], ""
    for palabra in palabras:
        prueba = (actual + " " + palabra).strip()
        if draw.textlength(prueba, font=font) <= ancho_max or not actual:
            actual = prueba
        else:
            lineas.append(actual)
            actual = palabra
    if actual:
        lineas.append(actual)
    return lineas


def pastilla(draw, caja, relleno, radio=None, borde=None, grosor=3):
    x0, y0, x1, y1 = caja
    radio = radio if radio is not None else (y1 - y0) / 2
    if borde:
        draw.rounded_rectangle([x0, y0, x1, y1], radius=radio, fill=relleno,
                               outline=borde, width=grosor)
    else:
        draw.rounded_rectangle([x0, y0, x1, y1], radius=radio, fill=relleno)


def pegar_rotado(base, capa, centro, angulo):
    girada = capa.rotate(angulo, resample=Image.BICUBIC, expand=True)
    base.paste(girada, (int(centro[0] - girada.width / 2),
                        int(centro[1] - girada.height / 2)), girada)


def formato_precio(valor):
    return "$ " + f"{valor:,.0f}".replace(",", ".")


# ---------- escena: intro --------------------------------------------------
def escena_intro(t, dur):
    img = Image.new("RGB", (W, H), CREMA)
    capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)

    # círculo lima que crece desde la derecha (va debajo del texto)
    p = ease_out(t / 0.8)
    radio = int(430 * p)
    if radio:
        d0 = ImageDraw.Draw(img)
        d0.ellipse([1010 - radio, 360 - radio, 1010 + radio, 360 + radio], fill=LIMA)
        d0.ellipse([1010 - radio, 360 - radio, 1010 + radio, 360 + radio],
                   outline=TINTA, width=4)

    # titular con revelado desde abajo
    disp = fuente(FONT_DISPLAY, 148)
    texto = "LUNARIA"
    ancho = d.textlength(texto, font=disp)
    tmp = Image.new("RGBA", (int(ancho) + 60, 230), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text((30, 20), texto, font=disp, fill=TINTA)
    alto = int(tmp.height * ease_out((t - 0.15) / 0.7))
    if alto > 0:
        recorte = tmp.crop((0, tmp.height - alto, tmp.width, tmp.height))
        img.paste(recorte, (72, 214 + (tmp.height - alto)), recorte)

    # línea y bajada
    d.line([80, 470, 80 + int(360 * ease_out((t - 0.9) / 0.6)), 470], fill=TINTA, width=4)
    ui = fuente(FONT_UI, 26, 600)
    if t > 1.1:
        d.text((82, 500), "Calzado femenino · Medellín", font=ui,
               fill=(TINTA[0], TINTA[1], TINTA[2], 220))

    # sticker MODA FRESCA
    if t > 0.55:
        k = ease_out((t - 0.55) / 0.45)
        texto = "MODA FRESCA"
        f = fuente(FONT_DISPLAY, 30)
        tw = d.textlength(texto, font=f)
        capa_st = Image.new("RGBA", (int(tw) + 56, 66), (0, 0, 0, 0))
        ds = ImageDraw.Draw(capa_st)
        pastilla(ds, (2, 2, tw + 54, 64), LIMA, radio=12, borde=TINTA, grosor=4)
        ds.text(((tw + 56) / 2, 32), texto, font=f, fill=TINTA, anchor="mm")
        pegar_rotado(img, capa_st, (960, 545 + (1 - k) * 40), -6)

    # puntos animados
    for i in range(3):
        activo = int(t * 3) % 3 == i
        cx, cy = 82 + i * 26, 600
        d.ellipse([cx, cy, cx + 14, cy + 14],
                  fill=TINTA if activo else (TINTA[0], TINTA[1], TINTA[2], 60))

    base = Image.alpha_composite(img.convert("RGBA"), capa)
    return base.convert("RGB")


# ---------- escena: producto ----------------------------------------------
def escena_producto(prod, indice, t, dur, acento, texto_color):
    img = Image.new("RGB", (W, H), CREMA)
    capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)

    # panel de color (estático, debajo del texto)
    ImageDraw.Draw(img).rectangle([0, 0, 600, H], fill=acento)

    # número con contorno
    f_num = fuente(FONT_DISPLAY, 170)
    d.text((42, 10), f"{indice:02d}", font=f_num, fill=acento,
           stroke_width=3, stroke_fill=texto_color)

    # etiqueta de categoría
    cat = prod["categoria"].upper()
    f_cat = fuente(FONT_UI, 19, 700)
    ancho_cat = d.textlength(cat, font=f_cat)
    pastilla(d, (44, 234, 44 + ancho_cat + 32, 272), BLANCO, radio=8,
             borde=texto_color, grosor=2)
    d.text((44 + 16, 253), cat, font=f_cat, fill=TINTA, anchor="lm")

    # nombre
    f_nombre = fuente(FONT_DISPLAY, 56)
    lineas = envolver(d, prod["nombre"].upper(), f_nombre, 500)[:2]
    y = 296
    for linea in lineas:
        d.text((44, y), linea, font=f_nombre, fill=texto_color)
        y += 60

    # subtítulo
    f_sub = fuente(FONT_UI, 20, 500)
    for linea in envolver(d, prod["subtitulo"], f_sub, 470)[:2]:
        d.text((44, y + 10), linea, font=f_sub, fill=texto_color + (225,))
        y += 27

    # precio
    f_pre = fuente(FONT_DISPLAY, 31)
    precio = formato_precio(prod["precio"])
    ancho_pre = d.textlength(precio, font=f_pre)
    pastilla(d, (44, 524, 44 + ancho_pre + 48, 588), BLANCO, radio=10,
             borde=texto_color, grosor=3)
    d.text((44 + 24, 556), precio, font=f_pre, fill=TINTA, anchor="lm")

    # tallas y dominio
    f_pie = fuente(FONT_UI, 18, 600)
    tallas = f"Tallas {prod['tallas'][0]} – {prod['tallas'][-1]}"
    d.text((44, 612), tallas, font=f_pie, fill=texto_color + (230,))
    d.text((44, 644), "lunaria.co", font=fuente(FONT_UI, 16, 500),
           fill=texto_color + (190,))

    # entrada suave de todo el contenido del panel
    p = ease_out(t / 0.45)
    alpha = capa.split()[3].point(lambda a: int(a * p))
    capa.putalpha(alpha)
    desplazamiento = int((1 - p) * 34)

    # fotografía con zoom lento
    ruta = os.path.join(BASE, prod["imagenes"][0]["src"])
    src = Image.open(ruta).convert("RGB")
    zoom = 1.08 + 0.07 * (t / dur)
    foto = ImageOps.fit(src, (int(760 * zoom), int(820 * zoom)), method=Image.LANCZOS)
    foto = foto.rotate(-3, resample=Image.BICUBIC, expand=True)
    izq = int(foto.width / 2 - 390)
    arr = int(foto.height / 2 - 390)
    foto = foto.crop((izq, arr, izq + 780, arr + 780))
    img.paste(foto, (500, -30))

    base = Image.alpha_composite(img.convert("RGBA"),
                                 Image.new("RGBA", (W, H), (0, 0, 0, 0)))
    capa_movida = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    capa_movida.paste(capa, (desplazamiento, 0))
    base = Image.alpha_composite(base, capa_movida)

    # sticker giratorio
    etiqueta = prod.get("etiqueta") or "EDITORIAL"
    f_st = fuente(FONT_DISPLAY, 21)
    ancho_st = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textlength(etiqueta, font=f_st)
    sello = Image.new("RGBA", (int(ancho_st) + 52, 58), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sello)
    pastilla(ds, (2, 2, ancho_st + 50, 56), LIMA, radio=10, borde=TINTA, grosor=4)
    ds.text(((ancho_st + 52) / 2, 29), etiqueta, font=f_st, fill=TINTA, anchor="mm")
    pegar_rotado(base, sello, (1030, 96 + math.sin(t * 1.6) * 5), 9)

    return base.convert("RGB")


# ---------- escena: cierre -------------------------------------------------
def escena_outro(t, dur):
    img = Image.new("RGB", (W, H), TINTA)
    capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)

    # barra lima que barre
    p = ease_out(t / 0.7)
    d.rectangle([0, 0, int(W * p), 14], fill=LIMA)

    # marca
    f_marca = fuente(FONT_DISPLAY, 128)
    texto = "LUNARIA"
    ancho = d.textlength(texto, font=f_marca)
    d.text(((W - ancho) / 2, 200), texto, font=f_marca, fill=LIMA)

    # bajada
    p2 = ease_out((t - 0.2) / 0.6)
    d.text((W / 2, 372), "El arte de caminar bonito",
           font=fuente(FONT_UI, 29, 600), fill=CREMA + (int(255 * p2),), anchor="mm")

    # cupón
    if t > 0.45:
        f_cup = fuente(FONT_DISPLAY, 26)
        cup = "LUNARIA20 · -20%"
        ancho_cup = d.textlength(cup, font=f_cup)
        pastilla(d, (W / 2 - ancho_cup / 2 - 28, 452, W / 2 + ancho_cup / 2 + 28, 510),
                 LIMA, radio=10)
        d.text((W / 2, 481), cup, font=f_cup, fill=TINTA, anchor="mm")

    d.text((W / 2, 636), "lunaria.co  ·  WhatsApp +57 300 123 4567",
           font=fuente(FONT_UI, 19, 500), fill=CREMA + (170,), anchor="mm")

    base = Image.alpha_composite(img.convert("RGBA"), capa)

    # cierre hacia crema para que el loop del hero sea continuo
    resto = dur - t
    if resto < 0.55:
        k = 1 - max(0.0, resto) / 0.55
        base = Image.blend(base, Image.new("RGBA", (W, H), CREMA + (255,)), k)

    return base.convert("RGB")


# ---------- montaje y codificación ----------------------------------------
SECUENCIA = [
    ("intro", None, 2.8, None, None),
    ("producto", "amelie", 2.4, LIMA, TINTA),
    ("producto", "noir", 2.4, AZUL, BLANCO),
    ("producto", "perla", 2.4, LILA, TINTA),
    ("producto", "siena", 2.4, CORAL, TINTA),
    ("producto", "lazo", 2.4, ROSA, TINTA),
    ("producto", "roble", 2.4, LIMA, TINTA),
    ("producto", "aurora", 2.4, AZUL, BLANCO),
    ("producto", "estrella", 2.4, LILA, TINTA),
    ("outro", None, 3.4, None, None),
]


def render(indice, local):
    tipo, pid, dur, acento, color_texto = SECUENCIA[indice]
    if tipo == "intro":
        return escena_intro(local, dur)
    if tipo == "outro":
        return escena_outro(local, dur)
    return escena_producto(CATALOGO[pid], indice, local, dur, acento, color_texto)


def calcular_tiempos():
    inicios, t = [], 0.0
    for _, _, dur, _, _ in SECUENCIA:
        inicios.append(t)
        t += dur - OVERLAP
    return inicios, inicios[-1] + SECUENCIA[-1][2]


INICIOS, TOTAL = calcular_tiempos()
N_FRAMES = int(TOTAL * FPS)


def frame_en(t):
    indice = 0
    for k, inicio in enumerate(INICIOS):
        if t >= inicio - 1e-9:
            indice = k

    if indice + 1 < len(SECUENCIA) and t >= INICIOS[indice + 1]:
        avance = (t - INICIOS[indice + 1]) / OVERLAP
        anterior = render(indice, t - INICIOS[indice])
        siguiente = render(indice + 1, t - INICIOS[indice + 1])
        return Image.blend(anterior, siguiente, max(0.0, min(1.0, avance)))

    return render(indice, t - INICIOS[indice])


def main():
    import imageio_ffmpeg

    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(FRAMES, exist_ok=True)
    os.makedirs(os.path.dirname(SALIDA_MP4), exist_ok=True)

    print(f"{N_FRAMES} fotogramas · {TOTAL:.1f} s · {W}x{H} @ {FPS}fps")
    for g in range(N_FRAMES):
        frame_en(g / FPS).save(os.path.join(FRAMES, f"{g:04d}.jpg"), quality=90)
        if g % 80 == 0:
            print(f"  render {g}/{N_FRAMES}")

    poster = escena_producto(CATALOGO["amelie"], 1, 1.3, 2.4, LIMA, TINTA)
    poster.save(POSTER, quality=90)

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    comando = [
        ffmpeg, "-y", "-loglevel", "error",
        "-framerate", str(FPS),
        "-i", os.path.join(FRAMES, "%04d.jpg"),
        "-c:v", "libx264", "-preset", "medium", "-crf", "22",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        SALIDA_MP4,
    ]
    subprocess.run(comando, check=True)

    peso = os.path.getsize(SALIDA_MP4) / 1024 / 1024
    print(f"video: {SALIDA_MP4} ({peso:.2f} MB)")
    print(f"poster: {POSTER}")
    shutil.rmtree(TMP)


if __name__ == "__main__":
    main()

