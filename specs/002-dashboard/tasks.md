# 002 — Dashboard — Tasks

- [ ] Crear `layouts/AppShell.jsx` (sidebar+topbar desktop / bottom-nav mobile) con los 3 destinos de navegación.
- [ ] Crear componente `components/BackButton.jsx` reutilizable ("← Volver" → `navigate('/')`).
- [ ] Crear componente `components/KpiCard.jsx` (icon, label, value, sublabel, onClick).
- [ ] Crear componente `components/LiveFeedPanel.jsx` (imagen/feed + overlay de bounding boxes + badge VIVO + timestamp + botón "Revisar imágenes capturadas").
- [ ] Crear componente `components/DetectedEventPanel.jsx` (evento detectado + barra de confidence + link "Ver análisis" que navega a `/alertas`).
- [ ] Crear componente `components/AiAssistantPanel.jsx`, recibiendo `context` (alertas + detecciones) desde `DashboardPage` (`007-ai-assistant`).
- [ ] Crear `services/mocks/dashboard.mock.js` con el contrato definido en `design.md`.
- [ ] Crear `services/dashboardService.js` (`getDashboardSummary()`) que hoy resuelve con el mock.
- [ ] Crear hook `hooks/useDashboardData.js` (`{ data, loading, error }`).
- [ ] Crear `pages/DashboardPage.jsx` componiendo `LiveFeedPanel`, 3× `KpiCard`, `DetectedEventPanel`, `AiAssistantPanel`.
- [ ] Configurar rutas en `router.jsx`: solo `/`, `/animales`, `/alertas`, `/eventos` (ninguna ruta adicional).
- [ ] Verificar responsive: desktop (grid 2 columnas) y mobile (apilado + bottom nav) contra `fotos-diseño/`.
- [ ] Escribir tests (ver `tests.md`).
