"""
Simulador de dron: recorre un video (stand-in de un feed de dron real), muestrea
un frame cada N segundos, lo corre por el motor de visión (real o mock) y manda
las detecciones al backend real por HTTP — igual que haría un dron de verdad.

vision/ nunca toca Postgres/FastAPI directamente (skills/architecture): todo pasa
por la API HTTP del backend (POST /api/misiones, /api/media, /api/media/{id}/detecciones).

Uso:
    python simulator.py --video ../../imagenes_prueba/video_prueba.mp4 --potrero-id 1
    python simulator.py --video otro.mp4 --potrero-id 2 --mock --no-sleep
"""

import argparse
import time
from datetime import datetime, timezone

import cv2
import requests

from inference import detector, mock_detector


def main():
    parser = argparse.ArgumentParser(description="Simulador de feed de dron para VIGÍA")
    parser.add_argument("--video", required=True, help="Ruta al video de prueba (o 0 para webcam)")
    parser.add_argument("--potrero-id", type=int, required=True, help="Potrero al que pertenece la misión")
    parser.add_argument("--backend-url", default="http://localhost:8000")
    parser.add_argument("--interval", type=float, default=2.0, help="Segundos entre cada muestreo")
    parser.add_argument("--drone-id", default="SIM-01")
    parser.add_argument("--mock", action="store_true", help="Usar mock_detector en vez de YOLOv8 real")
    parser.add_argument("--no-sleep", action="store_true", help="No esperar tiempo real entre frames (pruebas rápidas)")
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

    # --- Abrir video ---
    video_source = int(args.video) if args.video.isdigit() else args.video
    captura = cv2.VideoCapture(video_source)
    if not captura.isOpened():
        print(f"[ERROR] No se pudo abrir: {args.video}")
        return

    fps = captura.get(cv2.CAP_PROP_FPS) or 30
    frames_por_intervalo = max(int(fps * args.interval), 1)
    numero_frame = 0

    print(f"[INFO] Video: {args.video} | FPS: {fps:.1f} | muestreo cada {args.interval}s")

    while True:
        exito, frame = captura.read()
        if not exito:
            print("[INFO] Video terminado")
            break

        if numero_frame % frames_por_intervalo == 0:
            _procesar_frame(session, args.backend_url, mission_id, frame, numero_frame, engine)
            if not args.no_sleep:
                time.sleep(args.interval)

        numero_frame += 1

    captura.release()


def _procesar_frame(session, backend_url, mission_id, frame, numero_frame, engine):
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

    # --- Detectar y enviar cada detección ---
    detecciones = engine.detect(frame)
    aceptadas = 0
    for det in detecciones:
        r = session.post(f"{backend_url}/api/media/{media_id}/detecciones", json=det, timeout=10)
        if r.status_code == 200 and r.json() is not None:
            aceptadas += 1

    print(f"Frame {numero_frame:5d} | media_id={media_id} | crudas={len(detecciones)} | aceptadas={aceptadas}")


if __name__ == "__main__":
    main()
