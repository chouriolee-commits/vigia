"""
Detector simulado (005-yolov8-detection, RF5): mismo contrato que detector.py,
para poder demostrar/probar todo el pipeline (dashboard, alertas, eventos) sin
depender de un modelo real ni de la calidad de la imagen de entrada.
"""

import random
from datetime import datetime, timezone

MODEL_VERSION = "mock-detector-v1"

_BEHAVIORS = ["pastoreo", "pastoreo", "pastoreo", "descanso", "anomalo", "desconocido"]


def detect(image=None) -> list[dict]:
    """Ignora `image` (puede ser None) y genera entre 1 y 5 detecciones plausibles."""
    cantidad = random.randint(1, 5)
    detecciones = []

    for _ in range(cantidad):
        ancho = round(random.uniform(0.05, 0.2), 3)
        alto = round(random.uniform(0.08, 0.25), 3)
        detecciones.append({
            "livestock_id": None,
            "animal_label": "cow",
            "bbox": {
                "x": round(random.uniform(0, 1 - ancho), 3),
                "y": round(random.uniform(0, 1 - alto), 3),
                "width": ancho,
                "height": alto,
            },
            "confidence": round(random.uniform(0.5, 0.98), 3),
            "behavior": random.choice(_BEHAVIORS),
            "detected_at": datetime.now(timezone.utc).isoformat(),
            "model_version": MODEL_VERSION,
        })

    return detecciones
