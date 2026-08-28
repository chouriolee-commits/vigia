# 011 — Docker Environment

> **Fase futura completa** (ver `README.md` §4 y §9). Docker no es necesario para demostrar el MVP en 3h30 — `npm run dev` alcanza. Esta spec se implementa solo si sobra tiempo después de todo lo demás, o para la entrega final del repositorio (reproducibilidad post-hackathon).

## Problema
El proyecto necesita poder levantarse de forma reproducible (frontend + backend + PostgreSQL + vision) sin depender de la configuración local de cada máquina.

## Objetivo
Definir `docker-compose.yml` y los `Dockerfile` por servicio, permitiendo levantar el stack completo con un solo comando, sin bloquear el desarrollo local sin Docker durante el hackathon.

## Usuario
Desarrollador/IA (setup del entorno); indirectamente, quien evalúa el proyecto y necesita levantarlo rápido para la demo.

## User stories
- Como evaluador del hackathon, quiero correr `docker compose up` y ver la aplicación funcionando sin instalar nada más.
- Como desarrollador, quiero poder levantar solo `postgres` vía Docker y correr frontend/backend localmente durante el desarrollo activo.

## Requisitos funcionales (todos Fase futura)
- RF1 **[Fase futura]** `docker-compose.yml` en la raíz declara los servicios que realmente existan en ese momento (`frontend`, `backend`, `postgres`; `vision` solo si se implementó).
- RF2 **[Fase futura]** `postgres` con imagen oficial, volumen nombrado, variables de entorno básicas — sin healthcheck sofisticado si no da tiempo.
- RF3 **[Fase futura]** `backend` se conecta a `postgres` por nombre de servicio.
- RF4 **[Fase futura]** `frontend` apunta a `backend` vía `VITE_API_URL` configurable.
- RF5 **[Fase futura]** `.env.example` documenta las variables necesarias.

## Requisitos no funcionales
- RNF1: `docker compose up` debe levantar el stack en un tiempo razonable para una demo en vivo.
- RNF2: No exponer puertos ni credenciales innecesarias.

## Criterios de aceptación
- `docker compose up` levanta `postgres` y `backend` correctamente, con `backend` conectado a `postgres`.
- `frontend` (buildeado o en dev) puede alcanzar `backend`.
- La configuración de red y variables de entorno está documentada en el `README.md` raíz.

## Casos límite
- `vision` no completamente implementado aún → el resto del stack (`frontend`, `backend`, `postgres`) debe poder levantarse igual (RF5, no bloqueante).
- Puerto ya en uso en la máquina del desarrollador → documentar cómo cambiar el puerto vía `.env`.

## Restricciones
- Solo Docker y Docker Compose (sin Kubernetes ni orquestadores adicionales para el MVP).
- No se versionan credenciales reales en `docker-compose.yml` ni en `.env` (solo en `.env.example` con placeholders).
