"""
Motor real de detección (005-yolov8-detection): YOLOv8 pre-entrenado sobre COCO,
filtrando solo la clase "cow". No se entrena modelo propio en el MVP (RF5) y no
depende de ningún servicio externo (Roboflow queda fuera del runtime, solo se usa
para gestionar/entrenar dataset en fase futura — ver skills/roboflow).

Interfaz pública estable: detect(image) -> list[dict], mismo contrato que
mock_detector.detect(), para que sean intercambiables sin tocar el resto del pipeline.
"""

from datetime import datetime, timezone
from pathlib import Path

from ultralytics import YOLO

MODEL_VERSION = "yolov8n-coco-cow-v1"
# Peso ya descargado junto a vision/ — evita que ultralytics lo re-descargue
# y hace que la ruta no dependa del directorio de trabajo desde el que se ejecute.
_MODEL_PATH = str(Path(__file__).resolve().parent.parent / "yolov8n.pt")

_model: YOLO | None = None


def _get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(_MODEL_PATH)
    return _model


def detect(image) -> list[dict]:
    """
    image: array BGR (numpy) tipo OpenCV, un frame o imagen ya decodificada.

    Devuelve detecciones con bbox NORMALIZADO 0-1 {x, y, width, height} (esquina
    superior izquierda + ancho/alto), tal como exige 005-yolov8-detection.

    `behavior` no lo puede inferir un detector de objetos puro (YOLOv8 no clasifica
    comportamiento) — se deja "desconocido" a propósito; behavior real requeriría
    seguimiento de pose/movimiento entre frames (fuera de alcance del MVP).
    `livestock_id` siempre es None aquí: no hay re-identificación individual del
    animal implementada todavía (lo decide el backend al hacer matching, si aplica).
    """
    model = _get_model()
    alto_img, ancho_img = image.shape[0], image.shape[1]

    resultados = model(image, verbose=False)
    detecciones = []

    for r in resultados:
        for box in r.boxes:
            if model.names[int(box.cls[0])] != "cow":
                continue

            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]

            detecciones.append({
                "livestock_id": None,
                "animal_label": "cow",
                "bbox": {
                    "x": max(x1 / ancho_img, 0.0),
                    "y": max(y1 / alto_img, 0.0),
                    "width": min((x2 - x1) / ancho_img, 1.0),
                    "height": min((y2 - y1) / alto_img, 1.0),
                },
                "confidence": round(float(box.conf[0]), 3),
                "behavior": "desconocido",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "model_version": MODEL_VERSION,
            })

    return detecciones
