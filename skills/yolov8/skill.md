# Skill: YOLOv8 (VIGÍA)

## Contexto
Para el MVP de 3h30, la ruta recomendada es: modelo simulado (`mock_detector.py`) para desarrollar rápido, y si sobra tiempo, YOLOv8 pre-entrenado (COCO ya detecta "cow") sobre 1-2 imágenes/video de ejemplo para demostrar CV real funcionando ante el jurado. Entrenar un modelo propio con dataset anotado en Roboflow es Fase futura — no es requisito para la demo.

## Propósito
Guiar la integración de YOLOv8 como motor de detección de animales (y opcionalmente clasificación de comportamiento) dentro del pipeline definido en `skills/computer-vision`.

## Cuándo utilizarla
- Al implementar `vision/inference/` con un modelo YOLOv8 real o simulado.
- Al definir el formato exacto de las detecciones que se entregan al backend.
- Al decidir umbrales de confianza (`confidence threshold`) y de superposición (`IoU/NMS`).

## Tecnologías relacionadas
YOLOv8 (Ultralytics), Python, OpenCV, dataset gestionado en Roboflow (`skills/roboflow`).

## Reglas
1. La interfaz pública de inferencia es estable: `detect(image_or_frame) -> list[Detection]`, sin importar si el modelo es real o simulado (`skills/computer-vision`, regla 1 y 5).
2. Cada `Detection` incluye como mínimo: clase/animal detectado, `confidence` (0–1), `bbox` (x, y, width, height o x1,y1,x2,y2 — definir una sola convención en `005-yolov8-detection/design.md` y respetarla en todo el sistema), `timestamp`, referencia al frame/media de origen.
3. El umbral de confianza mínimo para considerar una detección válida se define explícitamente (ej. 0.5) y es configurable, no hardcodeado sin nombre de constante.
4. Si el modelo real no está entrenado/disponible durante el desarrollo, se usa un modelo simulado que genera detecciones plausibles (contrato idéntico) — nunca se bloquea el desarrollo de backend/frontend por falta de modelo.
5. La clasificación de "comportamiento" (pastoreo, descanso, anómalo) es una capa adicional sobre la detección base de YOLOv8 (puede ser una regla simple sobre movimiento/posición en el MVP, no necesariamente un modelo separado) — se documenta la heurística usada en `005-yolov8-detection/design.md`.

## Buenas prácticas
- Versionar el modelo usado (`model_version`) en cada detección para trazabilidad y depuración.
- Medir y documentar el tiempo de inferencia aproximado por imagen (relevante para la demo en vivo).
- Mantener el tamaño del modelo (`yolov8n`/`yolov8s`) acorde a los recursos disponibles en el hackathon (priorizar velocidad sobre precisión máxima).

## Restricciones
- No entrenar/cargar modelos pesados que no puedan correr en el hardware disponible durante la demo.
- No mezclar la lógica de inferencia con la lógica de negocio de alertas (eso vive en `backend/app/services/`, que consume las detecciones ya generadas).

## Estructura esperada
```
vision/
├── models/            # pesos del modelo (.pt) o referencia — no commitear binarios grandes si se puede evitar
├── inference/
│   ├── detector.py     # wrapper de YOLOv8: detect(image) -> list[Detection]
│   └── mock_detector.py # generador de detecciones simuladas con el mismo contrato
└── tests/
```

## Testing requerido
- Test que valida que `mock_detector` y `detector` (real) devuelven objetos con la misma forma/contrato.
- Test de `detector.py` con una imagen de prueba pequeña (idealmente CPU-only) validando que corre sin error y respeta el umbral de confianza configurado.

## Criterios de aceptación
- `vision/inference/detect()` devuelve detecciones válidas según el contrato de `005-yolov8-detection`.
- El sistema completo funciona con `mock_detector` sin requerir el modelo real entrenado.
- El umbral de confianza y la convención de bbox están documentados y son consistentes end-to-end (vision → backend → frontend).

## Errores que debe evitar la IA
- Cambiar la convención de bbox (ej. de x1,y1,x2,y2 a x,y,w,h) en un solo punto del pipeline sin actualizar el contrato completo.
- Devolver confidence fuera del rango 0–1 o sin normalizar.
- Acoplar el detector a un formato de imagen específico del frontend en vez de un formato estándar (numpy array / bytes).
