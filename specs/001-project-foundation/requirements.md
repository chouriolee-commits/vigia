# 001 — Project Foundation

> Primera spec a implementar (ver `README.md` §9, minuto 0:00–0:20). Prioridad: dejar el frontend listo para trabajar con mocks lo antes posible — es lo que garantiza la demo dentro de las 3h30.

## Problema
No existe todavía una estructura de proyecto ni convenciones que permitan a múltiples desarrolladores (humanos o IA) construir VIGÍA de forma consistente durante el hackathon.

## Objetivo
Establecer el monorepo, el stack tecnológico definitivo, la estructura de carpetas de cada servicio y las convenciones (nombres, variables de entorno, scripts) que todas las demás specs van a asumir como base.

## Usuario
Desarrolladores/IA que implementan cualquier feature de VIGÍA. No es una pantalla ni feature visible para el usuario final.

## User stories
- Como desarrollador, quiero clonar el repo y saber exactamente dónde va cada tipo de archivo, para no tener que inventar la estructura en cada feature.
- Como IA de desarrollo, quiero un `design.md` con el stack exacto y las convenciones, para no introducir dependencias o patrones inconsistentes.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Estructura de carpetas del monorepo (`frontend/`, `skills/`, `specs/` ya existen; `backend/`, `vision/`, `database/` se crean cuando se llegue a esa fase, ver `README.md` §9).
- RF2 **[MVP]** `README.md` raíz (único, ya existe en la raíz del repo) que explica el proyecto, el stack, MVP vs. fase futura y cómo continuar con Spec-Driven Development.
- RF3 **[MVP]** `frontend/` inicializado con Vite + React, corriendo con `npm run dev` antes de tocar cualquier otra spec.
- RF4 **[MVP]** Convención de mocks: cada `services/*.js` de dominio resuelve con datos mock por defecto (sin backend), listo para que `002-dashboard` en adelante los consuma.

### Fase futura
- RF5 **[Fase futura]** ORM/driver de PostgreSQL (SQLAlchemy + Alembic) — se define/instala solo cuando se llegue a `008-postgresql-data-model` en el orden de implementación.
- RF6 **[Fase futura]** `.env.example` por servicio backend/vision — se crea junto con esos servicios, no antes.

## Requisitos no funcionales
- RNF1: La estructura debe permitir levantar frontend y backend de forma independiente (sin Docker) durante el desarrollo del hackathon.
- RNF2: Las convenciones deben ser lo suficientemente simples para no frenar el ritmo de un hackathon de horas, no días.

## Criterios de aceptación
- La estructura de carpetas existe y coincide con `skills/architecture/skill.md`.
- El `README.md` raíz permite a alguien nuevo entender qué es VIGÍA, cómo correr el frontend y cómo seguir el flujo de Spec-Driven Development.
- Todas las specs posteriores pueden referenciar esta spec para el stack y las convenciones sin tener que redefinirlas.

## Casos límite
- Un desarrollador quiere agregar una carpeta nueva top-level: debe justificarlo actualizando esta spec (`design.md`) antes de hacerlo.

## Restricciones
- No crear código de aplicación en esta spec (esta spec es fundacional/estructural, no una feature de usuario).
- No introducir TypeScript, Redux, ni frameworks CSS pesados salvo que una spec posterior lo justifique explícitamente.
