# Skill: Frontend (VIGÍA)

## Contexto
El frontend con mocks es lo que garantiza la demo en 3h30 (`README.md` §4, §9): backend/BD son fase 2. El diseño es **exactamente** el de `fotos-diseño/` — no se agregan pantallas, botones ni interacciones fuera de las ya definidas: dashboard + 3 destinos (`/animales`, `/alertas`, `/eventos`) + botón "← Volver". Ni la galería de imágenes capturadas ni el detalle de detección individual son pantallas propias — fueron eliminadas del MVP en la auditoría de arquitectura (ver `specs/004-drone-media` y `specs/005-yolov8-detection`). Única excepción, agregada después: `/login` (`013-authentication`), la puerta de entrada antes del dashboard — misma paleta oscura/verde-teal de la app, con una ilustración 2D de un dron grabando vacas dentro del propio panel del formulario.

## Propósito
Guiar la construcción del frontend de VIGÍA (React + Vite) manteniendo una arquitectura modular, consistente con el diseño visual definido en `fotos-diseño/`, y preparada para reemplazar datos mock por FastAPI sin reescribir componentes.

## Cuándo utilizarla
- Al crear cualquier página, componente, hook o servicio en `frontend/`.
- Al implementar navegación/routing entre pantallas.
- Al conectar un componente a datos (mock o reales).
- Al revisar si un cambio de UI respeta el diseño de referencia (`fotos-diseño/desktop.jpeg`, `mobile.jpeg`).

## Tecnologías relacionadas
React, JavaScript (no TypeScript salvo justificación), Vite, React Router, CSS (módulos o CSS plano, sin frameworks CSS pesados salvo justificación), Fetch API o Axios, Vitest, React Testing Library.

## Reglas
1. Ningún componente hace `fetch`/`axios` directamente: siempre pasa por `services/`.
2. No colocar lógica de negocio (cálculos, reglas de alerta, reconciliación de datos) dentro de componentes: vive en `services/` o `hooks/`.
3. Todo dato remoto (real o mock) se consume a través de un hook (`useDashboardData`, `useAlerts`, etc.) que internamente llama al service correspondiente.
4. Los mocks viven en `services/mocks/` (o `services/*.mock.js`) con la **misma forma** que tendrá la respuesta real de FastAPI (mismos nombres de campo, mismos tipos). Cambiar de mock a real debe ser un cambio de implementación dentro del service, no del componente.
5. Toda pantalla a la que se navega desde el dashboard (Animales Monitoreados, Alertas Activas, Eventos Hoy) debe incluir un control de navegación "← Volver" que regrese a `/` (ver `specs/002-dashboard/design.md`, contrato de navegación).
6. Componentes reutilizables (cards, badges de estado, tablas, modal/panel de detalle) van en `components/`; las pantallas completas van en `pages/`; layouts compartidos (sidebar, topbar, shell con nav mobile) van en `layouts/`.
7. No duplicar componentes visualmente similares: un `StatusBadge` o un `KPICard` se reutiliza en todas las pantallas que lo necesiten.
8. Responsive: el layout debe adaptarse a mobile siguiendo `fotos-diseño/mobile.jpeg` (bottom nav de 3 accesos: Animales, Alertas, Eventos Hoy) y a desktop siguiendo `fotos-diseño/desktop.jpeg` (sidebar/topbar + grid de cards).

## Buenas prácticas
- Nombrar componentes y archivos en PascalCase (`AlertCard.jsx`), hooks en camelCase con prefijo `use` (`useAlerts.js`), servicios en camelCase (`alertService.js`).
- Un componente recibe datos y callbacks por props; no accede a estado global salvo que la spec lo requiera explícitamente.
- Loading, error y empty state son obligatorios en cualquier componente que consuma datos asíncronos (aunque el mock resuelva instantáneo, el contrato del hook debe exponer `{ data, loading, error }`).
- CSS organizado por componente/página (co-ubicado o en `styles/`), evitando estilos globales salvo variables de tema (colores, tipografía) en un archivo central (`theme.css` o `variables.css`).
- Paleta y tono visual: fondo oscuro (dark UI), acentos en verde/teal (identidad "VIGÍA"), tipografía técnica/monoespaciada para datos (hora, IDs, coordenadas), iconografía simple — consistente con `fotos-diseño/`.

## Restricciones
- No agregar librerías de UI pesadas (Material UI, Ant Design, etc.) salvo justificación explícita y aprobada en el `design.md` de la spec.
- No usar Redux/estado global complejo para un MVP de hackathon: `useState`/`useContext` alcanza salvo que una spec justifique lo contrario.
- No hardcodear URLs de API fuera de `services/api.js` (base URL configurable por variable de entorno, ej. `VITE_API_URL`).
- No implementar features de UI que no estén en una spec (`specs/00X-*/requirements.md`).
- **No crear ninguna ruta fuera de `/login`, `/`, `/animales`, `/alertas`, `/eventos`.** El botón "Revisar imágenes capturadas" y el link "Ver análisis →" no navegan a pantallas nuevas (ver `002-dashboard`, `004-drone-media`, `005-yolov8-detection`).
- El login no guarda el password en `localStorage`, solo una bandera de sesión (`013-authentication`).
- No construir un `PotreroSelector`, `AlertDetailModal`, `MediaGrid`/`MediaDetailModal` ni `DetectionDetailPanel` salvo que el MVP completo ya esté demostrable y sobre tiempo — todos están marcados como Fase futura en sus specs.

## Estructura esperada
```
frontend/
├── src/
│   ├── components/     # UI reutilizable (Card, Badge, Table, Modal, ChatBubble, etc.)
│   ├── pages/           # Dashboard, Animales, Alertas, Eventos, Monitoreo, Asistente
│   ├── layouts/          # AppShell (sidebar+topbar desktop / bottom nav mobile)
│   ├── hooks/            # useDashboardData, useAlerts, useLivestock, useDetections, useChat
│   ├── services/         # api.js, livestockService.js, detectionService.js, alertService.js, eventService.js, aiService.js, mocks/
│   ├── utils/            # formatDate, formatConfidence, etc. (funciones puras)
│   ├── types/            # JSDoc typedefs o PropTypes compartidos (contratos de datos)
│   ├── assets/
│   └── App.jsx / main.jsx / router.jsx
├── tests/
├── public/
└── package.json
```

## Testing requerido
- **Vitest + React Testing Library** para: renderizado de páginas y componentes clave, interacciones (click en las 3 cards de navegación, envío de mensaje en el chat), estados (loading/error/empty), servicios (mockeando fetch).
- Cobertura mínima obligatoria: `Dashboard`, las 3 pantallas de detalle (Animales/Alertas/Eventos), el control "← Volver", y los services.
- Los tests no dependen de un backend real: usan los mocks definidos en `services/mocks/`.

## Criterios de aceptación
- `npm install && npm run dev` levanta la app sin errores y navega entre las 4 pantallas principales.
- Cada pantalla de detalle tiene su botón de regreso funcional.
- Los componentes que consumen datos usan un hook + service, nunca fetch directo.
- El diseño visual es reconocible frente a `fotos-diseño/` (dark theme, acentos verdes, cards de KPI, panel de evento detectado, chat IA).
- `npm run test` pasa en verde.

## Errores que debe evitar la IA
- Poner `fetch(...)` dentro de un `.jsx`.
- Mezclar mocks y llamadas reales en el mismo componente.
- Crear una pantalla nueva sin su spec correspondiente en `specs/`.
- Romper la navegación (rutas rotas, botón "Volver" ausente o que no regresa a `/`).
- Ignorar el estado de loading/error y asumir que los datos siempre llegan.
