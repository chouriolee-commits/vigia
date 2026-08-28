# 002 — Dashboard

> Esta es la pantalla más importante del MVP: sin ella no hay demo. Ver `README.md` §9 (orden de implementación) — es lo primero que se construye después de `001`.

## Problema
El usuario necesita una vista única al entrar a VIGÍA que resuma el estado del monitoreo ganadero y le permita saltar rápidamente al detalle que necesita, sin menús profundos.

## Objetivo
Construir la pantalla principal (`/`) **exactamente** como en `fotos-diseño/desktop.jpeg` y `fotos-diseño/mobile.jpeg`: feed de monitoreo actual, 3 KPI cards clicables (que son también la navegación), panel de "evento detectado" y chat VIGÍA AI. Sin agregar ninguna pantalla o interacción fuera de las ya definidas (ver `README.md` §3).

## Usuario
Operador/ganadero.

## User stories
- Como operador, quiero ver de un vistazo animales monitoreados, alertas activas y eventos de hoy.
- Como operador, quiero hacer click en cada una de las 3 cards y navegar al detalle correspondiente.
- Como operador, quiero ver el feed simulado del dron con detecciones superpuestas.
- Como operador, quiero ver el evento más reciente que requiere atención y poder ver su análisis.
- Como operador, quiero interactuar con el asistente VIGÍA AI desde el dashboard.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Header: logo "VIGÍA" + subtítulo "Monitoreo inteligente de ganado".
- RF2 **[MVP]** `LiveFeedPanel` (de `004-drone-media`): feed simulado con overlay de detecciones, badge "VIVO", timestamp, botón "Revisar imágenes capturadas" (sin navegación en el MVP, ver `004`).
- RF3 **[MVP]** 3 KPI cards clicables — **el corazón del contrato de navegación**:
  - **Animales Monitoreados** → `/animales` (`003-livestock-monitoring`).
  - **Alertas Activas** → `/alertas` (`006-alert-system`).
  - **Eventos Hoy** → `/eventos` (`012-events-log`).
- RF4 **[MVP]** Panel "Evento detectado": ícono de alerta, animal, descripción, barra de confidence, link **"Ver análisis →" que navega a `/alertas`** (reutiliza esa pantalla; no crea una pantalla de detalle nueva — corrección de auditoría).
- RF5 **[MVP]** Panel "VIGÍA AI" (`007-ai-assistant`): historial de mensajes, input, envío, alimentado con el contexto real (KPIs + alertas activas + detecciones recientes).
- RF6 **[MVP]** Responsive: desktop (feed + panel lateral en 2 columnas, 3 cards debajo) / mobile (apilado + bottom nav con los mismos 3 destinos).
- RF7 **[MVP]** Datos mockeados con la forma de `GET /api/dashboard` (contrato en `design.md`), conectable a backend real en fase futura sin tocar componentes.

## Requisitos no funcionales
- RNF1 **[MVP]** Debe funcionar 100% con mocks, sin requerir backend.
- RNF2 **[MVP]** Debe respetar la identidad visual de `fotos-diseño/` (fondo oscuro, acentos verde/teal).

## Criterios de aceptación (Given/When/Then)

```
Dado que el dashboard está cargado con datos mock,
cuando el usuario hace click en la card "Animales Monitoreados",
entonces navega a "/animales" y ve las 2 tablas de esa pantalla.

Dado que el dashboard está cargado con datos mock,
cuando el usuario hace click en la card "Alertas Activas",
entonces navega a "/alertas" y ve la tabla de alertas.

Dado que el dashboard está cargado con datos mock,
cuando el usuario hace click en la card "Eventos Hoy",
entonces navega a "/eventos" y ve la tabla de eventos del día.

Dado que existe un evento detectado en el mock (animal #024, comportamiento anómalo, confidence 94%),
cuando el usuario hace click en "Ver análisis →",
entonces navega a "/alertas" (no a una pantalla nueva).
```

## Casos límite
- Sin alertas activas → card muestra 0, sigue siendo clicable, navega a una tabla vacía con estado "sin alertas".
- Sin evento reciente → panel "Evento detectado" muestra estado vacío, no un evento roto.
- Feed sin detecciones en el frame actual → sin overlays, sin error.

## Restricciones
- El dashboard no implementa lógica de negocio: solo consume datos ya resueltos por `services/`.
- Exactamente 3 elementos de navegación principal — no se agregan más.
- Ninguna interacción del dashboard crea una ruta nueva fuera de `/`, `/animales`, `/alertas`, `/eventos`.
