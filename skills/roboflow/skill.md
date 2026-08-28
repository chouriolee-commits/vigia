# Skill: Roboflow (VIGÍA)

## Contexto
**No convertir el hackathon en un proyecto de entrenamiento de modelos desde cero.** Con 3h30 disponibles, la prioridad es demostrar "IA funcionando dentro de la solución", no un dataset perfectamente curado. Usar un dataset/modelo ya preparado (o el fallback de YOLOv8 pre-entrenado sobre COCO, clase "cow") es una decisión válida y esperada para el MVP — entrenar con Roboflow es Fase futura.

## Propósito
Guiar el uso de Roboflow como herramienta de gestión de dataset (anotación, versionado, preparación) para el modelo de detección de ganado, separado del uso del modelo en inferencia (eso es `skills/yolov8`).

## Cuándo utilizarla
- Al preparar, anotar o versionar el dataset de imágenes/video de ganado.
- Al exportar un dataset para entrenar o re-entrenar un modelo YOLOv8.
- Al documentar de dónde viene el dataset usado en la demo (aunque el MVP use detecciones simuladas).

## Tecnologías relacionadas
Roboflow (dataset management, anotación, versionado, export), YOLOv8.

## Flujo general
```
Dataset (imágenes/video de ganado)
   ↓
Anotación (bounding boxes por clase: vaca, ternero, etc. y opcionalmente comportamiento)
   ↓
Dataset Version (versionado en Roboflow)
   ↓
Export (formato YOLOv8)
   ↓
Training (fuera del scope del MVP de hackathon, o entrenamiento ligero si el tiempo lo permite)
   ↓
Modelo YOLOv8 (consumido por vision/inference/)
```

## Reglas
1. Roboflow gestiona dataset y anotaciones; **no** reemplaza a `vision/inference/` en tiempo de ejecución de la app (la app no llama a la API de Roboflow en producción salvo que una spec lo defina explícitamente para inferencia remota).
2. Toda versión de dataset usada para un modelo se referencia por su ID/versión de Roboflow en la documentación de `specs/005-yolov8-detection/design.md`, para trazabilidad.
3. Las clases anotadas (especies, y si aplica comportamientos) deben coincidir exactamente con las que el backend y frontend esperan mostrar (`normal`, `pastoreo`, `descanso`, `anómalo`, etc., según se defina en `005-yolov8-detection`).
4. No se versiona el dataset completo (imágenes) dentro del repo de código: se referencia por link/versión de Roboflow.

## Buenas prácticas
- Mantener un dataset pequeño pero representativo para el MVP (suficiente para demostrar detección, no para producción).
- Documentar el criterio de anotación (qué se considera "comportamiento anómalo") para que sea reproducible.
- Si no hay tiempo de entrenar un modelo propio en el hackathon, usar un modelo YOLOv8 pre-entrenado (COCO, que ya detecta "cow") como fallback documentado, y dejar Roboflow listo para el siguiente ciclo de entrenamiento.

## Restricciones
- No depender de la disponibilidad de la API de Roboflow para que la demo funcione (el pipeline debe poder correr offline con el modelo ya exportado o simulado).
- No mezclar dataset de prueba/demo con dataset de entrenamiento real sin distinguir versiones.

## Estructura esperada
Roboflow es una herramienta externa (SaaS); dentro del repo solo se documenta su uso:
```
vision/
└── models/
    └── README.md   # referencia a proyecto/versión de Roboflow usada, link, clases anotadas
```

## Testing requerido
No aplica testing de código directamente sobre Roboflow. Se valida indirectamente: el modelo exportado debe pasar los tests de `skills/computer-vision` y `skills/yolov8` (contrato de salida).

## Criterios de aceptación
- Queda documentado qué dataset/versión de Roboflow (o modelo pre-entrenado alternativo) se usó para la demo.
- Las clases del dataset coinciden con las que espera el backend/frontend.

## Errores que debe evitar la IA
- Bloquear el desarrollo del resto del sistema esperando un dataset perfectamente anotado.
- Inventar clases de comportamiento no acordadas con `005-yolov8-detection`.
- Commitear imágenes del dataset o credenciales de la API de Roboflow al repositorio.
