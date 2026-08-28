# 009 — API Integration — Tasks

> Fase 2 completa — no ejecutar hasta que 002, 003, 006, 007, 012 funcionen con mocks (ver `README.md` §9).

- [ ] Crear `frontend/src/services/api.js` (cliente base + `USE_MOCK`).
- [ ] Refactorizar cada `services/*.js` de dominio a modo dual (mock/real) según `design.md`.
- [ ] Crear `frontend/.env.example` actualizado con `VITE_API_URL` y `VITE_USE_MOCK`.
- [ ] Implementar router + service + repository + schemas para cada endpoint de la tabla en `design.md` (uno por uno, siguiendo su spec de origen).
- [ ] Configurar CORS en `backend/app/core/config.py`.
- [ ] Configurar manejo de errores consistente (`{ "detail": "..." }`) en `backend/app/main.py` (exception handlers).
- [ ] Probar el frontend completo con `VITE_USE_MOCK=false` contra el backend real levantado localmente.
- [ ] Escribir tests de contrato (ver `tests.md`).
