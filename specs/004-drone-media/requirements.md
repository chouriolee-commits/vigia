# 004 — Drone Media (Feed simulado — reducido en auditoría)

> **Corrección de auditoría:** la versión anterior de esta spec incluía una galería completa (`/monitoreo/capturas`, grid, modal de detalle). Esa pantalla **no es uno de los 3 botones** definidos por el usuario y viola la regla "sin agregar más funcionalidades" (ver `README.md` §3). Se elimina del MVP y se deja documentada como Fase futura al final de este archivo.

## Problema
El dashboard necesita mostrar el feed simulado del dron (tal como aparece en `fotos-diseño/`) para dar contexto visual al monitoreo, sin que esto implique una pantalla de navegación adicional.

## Objetivo
Construir únicamente el panel `LiveFeedPanel`, embebido en `002-dashboard`, con overlay de detecciones.

## Usuario
Operador/ganadero.

## User stories
- Como operador, quiero ver el feed del dron con las detecciones superpuestas sin salir del dashboard.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** `LiveFeedPanel`: imagen/frame de fondo (imagen de ejemplo, no video real), overlay de bounding boxes por detección activa (reutiliza `DetectionOverlay` de `005-yolov8-detection`), badge "VIVO", timestamp simulado que avanza, botón "Revisar imágenes capturadas".
- RF2 **[MVP]** El botón "Revisar imágenes capturadas" existe visualmente (fiel al diseño) pero **no navega a ninguna pantalla nueva** en el MVP — puede quedar deshabilitado o mostrar un tooltip "Próximamente" (decisión de implementación, sin bloquear la demo).
- RF3 **[MVP]** Datos del feed mockeados con la forma que tendría `GET /api/misiones/{id}/media` (contrato documentado abajo, para no perder el diseño si se retoma en fase futura).

### Fase futura
- RF4 **[Fase futura]** Pantalla `/monitoreo/capturas` con galería de medios de una misión, click para ver detalle ampliado.
- RF5 **[Fase futura]** Reproducción de video real (el MVP usa imágenes estáticas).

## Requisitos no funcionales
- RNF1 **[MVP]** El feed debe sentirse "en vivo" (timestamp que avanza) sin requerir stream real.

## Criterios de aceptación (Given/When/Then)

```
Dado que el dashboard está cargado con datos mock de detecciones activas,
cuando se renderiza LiveFeedPanel,
entonces se muestran los bounding boxes correspondientes sobre la imagen de fondo,
con la etiqueta "Animal #ID - Comportamiento: <estado>" por cada detección.

Dado que el usuario hace click en "Revisar imágenes capturadas",
cuando el MVP no tiene esa pantalla implementada,
entonces no ocurre ningún error ni navegación rota (botón deshabilitado o "Próximamente").
```

## Casos límite
- Frame sin detecciones activas → el feed se muestra sin overlays, sin error.

## Restricciones
- No se crea ninguna ruta nueva en esta spec. `LiveFeedPanel` es un componente embebido en `002-dashboard`, no una página.
