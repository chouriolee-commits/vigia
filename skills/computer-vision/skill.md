# Skill: Computer Vision (VIGÍA)

## Contexto
Esta es la pieza que demuestra ante el jurado que **la IA participa en la solución**, no que es decorativa (`README.md` §2). Para el hackathon de 3h30 no se entrena un modelo propio: se usa un modelo simulado o YOLOv8 pre-entrenado (COCO, clase "cow") — ver `skills/yolov8` y `skills/roboflow`. El overlay de detecciones vive **dentro** del feed del dashboard (`LiveFeedPanel`), no en una pantalla propia — el detalle de detección individual se eliminó del MVP.

## Propósito
Definir el pipeline general de visión artificial de VIGÍA (preprocesamiento → inferencia → salida normalizada) de forma agnóstica al modelo específico, para que YOLOv8 (`skills/yolov8`) y Roboflow (`skills/roboflow`) se integren sobre una base común.

## Cuándo utilizarla
- Al diseñar o modificar el pipeline de `vision/preprocessing/` o `vision/inference/`.
- Al definir el contrato de salida que el backend va a consumir (`005-yolov8-detection`).
- Al decidir si una imagen/video simulado es válida para probar el pipeline sin modelo real todavía.

## Tecnologías relacionadas
Python, OpenCV (cuando se requiera preprocesamiento real), YOLOv8 (`skills/yolov8`), Roboflow (`skills/roboflow`).

## Flujo general
```
Drone → Imagen/Video → Preprocessing → Modelo (YOLOv8) → Detecciones → Backend → PostgreSQL → Frontend
```

## Reglas
1. El pipeline debe poder correr con un **modelo simulado** (función que devuelve detecciones mock con la misma forma que el output real) para no bloquear frontend/backend mientras el modelo real no esté listo.
2. La salida de `vision/` siempre respeta el contrato definido en `specs/005-yolov8-detection/design.md`: lista de detecciones con `bbox`, `confidence`, `class/animal`, `timestamp`, referencia al media de origen.
3. `vision/` no persiste datos ni conoce PostgreSQL: entrega su salida al backend (vía llamada HTTP a un endpoint de ingesta, o archivo/cola si así se decide en `009-api-integration`).
4. El preprocesamiento (resize, normalización, recorte) vive en `vision/preprocessing/`, separado de la inferencia (`vision/inference/`).
5. Toda decisión de umbral (confidence threshold, IoU, tamaño mínimo de bbox) se documenta en el `design.md` de la spec correspondiente, no se hardcodea sin justificación.

## Buenas prácticas
- Diseñar `inference/` con una interfaz estable (`detect(image) -> list[Detection]`) para poder cambiar de modelo simulado a modelo real sin tocar el resto del pipeline.
- Registrar la versión del modelo usada en cada detección (`model_version`) para trazabilidad.
- Mantener el pipeline testeable sin GPU ni pesos reales (usar imágenes de prueba pequeñas y un modelo mock en tests).

## Restricciones
- No acoplar `vision/` a FastAPI ni a React.
- No introducir dependencias pesadas de CV más allá de OpenCV/YOLOv8 sin justificación.
- No calcular lógica de negocio (prioridad de alerta, comparación esperado/real) dentro de `vision/`: esa lógica vive en `backend/app/services/`.

## Estructura esperada
```
vision/
├── models/            # pesos/modelo (o referencia a Roboflow/YOLOv8, no versionar binarios pesados en git)
├── inference/          # detect(image) -> detections, wrapper del modelo (real o simulado)
├── preprocessing/       # resize, normalización, extracción de frames de video
└── tests/
```

## Testing requerido
- Tests unitarios de `preprocessing/` con imágenes de prueba pequeñas incluidas en el repo.
- Tests de `inference/` usando el modelo simulado, validando que el output cumple el contrato (forma, tipos, rangos de confidence 0–1).

## Criterios de aceptación
- El pipeline corre end-to-end con datos simulados y produce detecciones válidas según el contrato.
- El swap de modelo simulado a modelo real (YOLOv8 entrenado) no requiere cambios fuera de `vision/inference/`.

## Errores que debe evitar la IA
- Mezclar preprocesamiento e inferencia en una sola función difícil de testear.
- Hardcodear rutas de archivos o credenciales de Roboflow en el código (usar variables de entorno).
- Bloquear el desarrollo de frontend/backend esperando el modelo real en vez de usar la salida simulada.
