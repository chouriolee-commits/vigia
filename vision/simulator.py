"""
Simulador de dron: recorre un video (stand-in de un feed de dron real), muestrea
un frame cada N segundos, lo corre por el motor de visión (real o mock) y manda
las detecciones al backend real por HTTP — igual que haría un dron de verdad.
Por defecto también muestra una ventana con el video y las cajas superpuestas.

vision/ nunca toca Postgres/FastAPI directamente (skills/architecture): todo pasa
por la API HTTP del backend (POST /api/misiones, /api/media, /api/media/{id}/detecciones).
La ventana es solo un espejo local de lo que ya se mandó — no es una fuente de verdad.

Identificación + salud simulada (igual que la v1 del prototipo, adaptado al
contrato nuevo): YOLOv8 solo dice "hay una vaca aquí" — no re-identifica animales
ni mide temperatura de verdad. Para que la demo se vea como la v1 (animales
identificados, estados de fiebre/celo/parto), el simulador "reconoce" cada
detección contra el inventario real del potrero (round-robin, no es re-id real)
y simula una lectura de salud, tal como hacía app.py con datos de sensores que
no existen. Esto se puede apagar con --sin-identificar para probar el pipeline
"crudo" (solo lo que YOLOv8 entrega, sin nada simulado encima).

IMPORTANTE: la ventana necesita una terminal interactiva de verdad — no se ve
si se corre desde un proceso en background/automatizado. Correr en tu propia
terminal.

Uso:
    python simulator.py --video ../../imagenes_prueba/video_prueba.mp4 --potrero-id 1
    python simulator.py --video otro.mp4 --potrero-id 2 --mock --no-sleep
    python simulator.py --video otro.mp4 --potrero-id 1 --sin-identificar
    python simulator.py --video otro.mp4 --potrero-id 1 --sin-mostrar   # sin ventana
"""

import argparse
import random
import time
from datetime import datetime, timezone

import cv2
import requests

from inference import detector, mock_detector

# Color BGR por estado — mismo código de colores que la v1
_COLOR_NORMAL = (0, 200, 0)          # verde
_COLOR_FIEBRE = (0, 0, 255)          # rojo
_COLOR_CELO = (255, 200, 0)          # celeste
_COLOR_PARTO = (255, 0, 255)         # magenta
_COLOR_DESCONOCIDO = (180, 180, 180)  # gris


def _color_para(motivo, behavior):
    if motivo and "fiebre" in motivo.lower():
        return _COLOR_FIEBRE
    if motivo and "celo" in motivo.lower():
        return _COLOR_CELO
    if motivo and "parto" in motivo.lower():
        return _COLOR_PARTO
    if behavior == "desconocido":
        return _COLOR_DESCONOCIDO
    return _COLOR_NORMAL


def main():
    parser = argparse.ArgumentParser(description="Simulador de feed de dron para VIGÍA")
    parser.add_argument("--video", required=True, help="Ruta al video de prueba (o 0 para webcam)")
    parser.add_argument("--potrero-id", type=int, required=True, help="Potrero al que pertenece la misión")
    parser.add_argument("--backend-url", default="http://localhost:8000")
    parser.add_argument("--interval", type=float, default=2.0, help="Segundos entre cada muestreo")
    parser.add_argument("--drone-id", default="SIM-01")
    parser.add_argument("--mock", action="store_true", help="Usar mock_detector en vez de YOLOv8 real")
    parser.add_argument("--no-sleep", action="store_true", help="No esperar tiempo real entre frames (pruebas rápidas)")
    parser.add_argument(
        "--sin-identificar", action="store_true",
        help="No asignar livestock_id ni simular salud — solo lo que YOLOv8 detecta de verdad",
    )
    parser.add_argument("--sin-mostrar", action="store_true", help="No abrir ventana de video (solo consola)")
    parser.add_argument(
        "--loop", action="store_true",
        help="Al terminar el video, reiniciar desde el frame 0 en vez de salir (feed continuo para demo)",
    )
    args = parser.parse_args()

    engine = mock_detector if args.mock else detector
    session = requests.Session()

    # --- Crear misión ---
    resp = session.post(
        f"{args.backend_url}/api/misiones",
        json={"potrero_id": args.potrero_id, "drone_identifier": args.drone_id},
        timeout=10,
    )
    resp.raise_for_status()
    mission_id = resp.json()["id"]
    print(f"[INFO] Misión creada: id={mission_id} | potrero={args.potrero_id} | motor={'mock' if args.mock else 'yolov8'}")

    # --- Inventario real del potrero (para "reconocer" animales, ver docstring) ---
    # Nota: el contrato de /reconciliacion expone el campo como "livestock_tag"
    # (ver nota de consistencia en specs/005-yolov8-detection/design.md); aquí lo
    # guardamos bajo la clave interna "tag_code" solo por legibilidad local.
    animales = []
    if not args.sin_identificar:
        r = session.get(f"{args.backend_url}/api/potreros/{args.potrero_id}/reconciliacion", timeout=10)
        if r.status_code == 200:
            animales = [
                {"livestock_id": a["livestock_id"], "tag_code": a["livestock_tag"]}
                for a in r.json().get("animales_esperados", [])
            ]
        if animales:
            print(f"[INFO] Identificación simulada activa — {len(animales)} animales registrados en el potrero")
        else:
            print("[AVISO] Potrero sin animales registrados — las detecciones quedarán sin identificar")

    # --- Abrir video ---
    video_source = int(args.video) if args.video.isdigit() else args.video
    captura = cv2.VideoCapture(video_source)
    if not captura.isOpened():
        print(f"[ERROR] No se pudo abrir: {args.video}")
        return

    fps = captura.get(cv2.CAP_PROP_FPS) or 30
    frames_por_intervalo = max(int(fps * args.interval), 1)
    numero_frame = 0
    ultimas_cajas = []  # se refresca solo en frames muestreados; se dibuja en todos
    resumen = _resumen_vacio()

    print(f"[INFO] Video: {args.video} | FPS: {fps:.1f} | muestreo cada {args.interval}s")
    if not args.sin_mostrar:
        print("[INFO] Presiona 'q' en la ventana de video para salir")

    try:
        while True:
            exito, frame = captura.read()
            if not exito:
                if args.loop:
                    print("[INFO] Fin del video — reiniciando (--loop activo)")
                    captura.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    numero_frame = 0
                    continue
                print("[INFO] Video terminado")
                break

            if numero_frame % frames_por_intervalo == 0:
                ultimas_cajas = _procesar_frame(
                    session, args.backend_url, mission_id, frame, numero_frame, engine, animales, resumen
                )
                if not args.no_sleep:
                    time.sleep(args.interval)

            if not args.sin_mostrar:
                _dibujar_cajas(frame, ultimas_cajas)
                cv2.imshow("VIGÍA — Simulador de dron (q para salir)", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

            numero_frame += 1
    except KeyboardInterrupt:
        print("\n[INFO] Interrumpido (Ctrl+C)")

    captura.release()
    if not args.sin_mostrar:
        cv2.destroyAllWindows()

    _imprimir_resumen(resumen)


def _simular_estado_salud():
    """
    Réplica de la lógica de la v1 (app.py: simular_temperatura / simular_postura_parto
    / simular_celo / clasificar_riesgo), adaptada al enum behavior de 005-yolov8-detection.
    Prioridad clínica: parto > celo > fiebre > normal.

    Devuelve (behavior, motivo). motivo es None para estados normales.
    """
    roll = random.random()
    if roll < 0.06:
        return "anomalo", "Sospecha de parto en curso"
    if roll < 0.12:
        return "anomalo", "Comportamiento de celo detectado"
    if roll < 0.27:
        temperatura = round(random.uniform(39.6, 41.0), 1)
        return "anomalo", f"Sospecha de fiebre ({temperatura}°C)"
    return random.choices(["pastoreo", "descanso"], weights=[0.8, 0.2])[0], None


def _resumen_vacio():
    return {
        "frames_muestreados": 0,
        "crudas": 0,
        "aceptadas": 0,
        "animales_vistos": set(),
        "por_estado": {"fiebre": 0, "celo": 0, "parto": 0, "normal": 0},
    }


def _categoria(motivo):
    if not motivo:
        return "normal"
    m = motivo.lower()
    if "fiebre" in m:
        return "fiebre"
    if "celo" in m:
        return "celo"
    if "parto" in m:
        return "parto"
    return "normal"


def _imprimir_resumen(resumen):
    por_estado = resumen["por_estado"]
    print()
    print("========== RESUMEN ==========")
    print(f"Frames muestreados:      {resumen['frames_muestreados']}")
    print(f"Detecciones crudas:      {resumen['crudas']}")
    print(f"Detecciones aceptadas:   {resumen['aceptadas']}  (confianza >= umbral del backend)")
    print(f"Animales distintos identificados: {len(resumen['animales_vistos'])} → {sorted(resumen['animales_vistos']) or '—'}")
    print("Por estado (sobre las aceptadas):")
    print(f"  normal:  {por_estado['normal']}")
    print(f"  fiebre:  {por_estado['fiebre']}")
    print(f"  celo:    {por_estado['celo']}")
    print(f"  parto:   {por_estado['parto']}")
    print("==============================")


def _procesar_frame(session, backend_url, mission_id, frame, numero_frame, engine, animales, resumen):
    ahora = datetime.now(timezone.utc)

    # --- Registrar el frame como "media" ---
    resp = session.post(
        f"{backend_url}/api/media",
        json={
            "mission_id": mission_id,
            "type": "imagen",
            "url": f"simulador://frame-{numero_frame}",
            "captured_at": ahora.isoformat(),
        },
        timeout=10,
    )
    resp.raise_for_status()
    media_id = resp.json()["id"]

    # --- Detectar, "reconocer" e ingestar cada detección ---
    detecciones = engine.detect(frame)
    aceptadas = 0
    estados = []
    cajas = []

    for det in detecciones:
        animal = random.choice(animales) if animales else None
        det["livestock_id"] = animal["livestock_id"] if animal else None

        motivo = None
        if animales:
            behavior, motivo = _simular_estado_salud()
            det["behavior"] = behavior
            det["motivo"] = motivo
            estados.append(f"{animal['tag_code']}:{motivo or behavior}")

        r = session.post(f"{backend_url}/api/media/{media_id}/detecciones", json=det, timeout=10)
        if r.status_code == 200 and r.json() is not None:
            aceptadas += 1
            etiqueta = animal["tag_code"] if animal else "Animal no identificado"
            cajas.append({
                "bbox": det["bbox"],
                "color": _color_para(motivo, det["behavior"]),
                "texto": f"{etiqueta} · {motivo or det['behavior']}",
            })

            resumen["animales_vistos"].add(etiqueta)
            resumen["por_estado"][_categoria(motivo)] += 1

    resumen["frames_muestreados"] += 1
    resumen["crudas"] += len(detecciones)
    resumen["aceptadas"] += aceptadas

    linea_estados = f" | {', '.join(estados)}" if estados else ""
    print(f"Frame {numero_frame:5d} | media_id={media_id} | crudas={len(detecciones)} | aceptadas={aceptadas}{linea_estados}")

    return cajas


def _dibujar_cajas(frame, cajas):
    alto, ancho = frame.shape[0], frame.shape[1]
    for caja in cajas:
        b = caja["bbox"]
        x1, y1 = int(b["x"] * ancho), int(b["y"] * alto)
        x2, y2 = int((b["x"] + b["width"]) * ancho), int((b["y"] + b["height"]) * alto)
        color = caja["color"]

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        (tw, th), _ = cv2.getTextSize(caja["texto"], cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        ty = max(y1 - 8, th + 4)
        cv2.rectangle(frame, (x1, ty - th - 4), (x1 + tw + 6, ty + 2), color, -1)
        cv2.putText(
            frame, caja["texto"], (x1 + 3, ty),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA,
        )


if __name__ == "__main__":
    main()
