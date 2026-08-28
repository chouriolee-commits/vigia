# 010 — Testing — Design

## Estructura de la suite

```
frontend/
├── src/**/*.test.jsx        # Vitest + RTL, co-ubicados o en tests/
└── tests/                    # tests de integración de página completa

backend/
└── tests/
    ├── test_health.py
    ├── test_dashboard.py
    ├── test_potreros.py
    ├── test_media.py
    ├── test_detections.py
    ├── test_alerts.py
    ├── test_events.py
    └── test_assistant.py

e2e/                            # Fase futura si se separan; MVP puede vivir en 1 solo archivo
├── playwright.config.js
└── flows/
    └── dashboard-navigation.spec.js   # MVP: cubre los 3 botones + volver en un solo archivo
    # Fase futura: ai-assistant-send-message.spec.js, monitoring-to-detection.spec.js
```

## Flujo de datos de los tests E2E
Los tests E2E corren contra el frontend levantado con `VITE_USE_MOCK=true` (no requieren backend), validando la experiencia demostrable del hackathon de forma determinística. Un segundo perfil opcional (`VITE_USE_MOCK=false` + backend + DB de test) se documenta como validación de integración real, no bloqueante para la demo.

## Decisiones técnicas
- Playwright corre contra `npm run dev` (o `npm run preview` de un build) del frontend en modo mock, para no depender de Docker/backend en cada corrida de E2E durante el desarrollo.
- Cada flujo E2E es independiente (no depende del estado dejado por otro test) — se resetea el mock/estado en cada test.
