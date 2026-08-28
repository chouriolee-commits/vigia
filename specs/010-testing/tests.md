# 010 — Testing — Tests (meta)

Esta spec es sobre testing; su "tests.md" describe cómo se valida que la **estrategia misma** está bien aplicada, no features de usuario.

## Validaciones (MVP)
- El flujo E2E único (RF2 de `requirements.md`) pasa en verde.
- Cada spec de dominio tiene su sección "Críticos (MVP)" en `tests.md` cubierta.
- `npm run test` está documentado en el `README.md` raíz y funciona tal como se documenta.

## Casos negativos (de la estrategia)
- Un flujo E2E crítico que falla bloquea considerar el MVP demostrable — no se debe marcar `010-testing` como cerrada con un flujo crítico roto.

## Edge cases
- Ejecutar la suite completa en una máquina limpia (sin `node_modules`/`.venv` previos) para validar que la documentación de setup (`README.md`) es suficiente.
