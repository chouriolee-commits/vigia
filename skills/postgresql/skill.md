# Skill: PostgreSQL (VIGÍA)

## Contexto
Modelo de datos **reducido a 6 tablas núcleo para el MVP** de 3h30: `potreros, livestock, drone_missions, media, detections, alerts` (`008-postgresql-data-model`). `users`, `events` (como tabla persistida) y `ai_conversations`/`ai_messages` son Fase futura — no se crean salvo que sobre tiempo. "Eventos Hoy" se resuelve con una query derivada de `alerts`+`detections`, no con una tabla nueva.

## Propósito
Guiar el diseño e implementación del modelo de datos de VIGÍA en PostgreSQL: entidades, relaciones, índices y migraciones, manteniendo el modelo simple pero correcto para soportar el MVP (incluyendo la reconciliación "animales esperados vs. animales detectados" por potrero).

## Cuándo utilizarla
- Al crear o modificar una tabla/modelo.
- Al escribir una migración.
- Al definir índices para queries frecuentes (dashboard, reconciliación por potrero, alertas activas, eventos de hoy).
- Al revisar si un nuevo campo/entidad realmente pertenece a la base de datos o es derivable (no persistir lo que se puede calcular).

## Tecnologías relacionadas
PostgreSQL, SQLAlchemy (u ORM equivalente definido en `001-project-foundation`), herramienta de migraciones (Alembic recomendado, a confirmar en esa misma spec).

## Reglas
1. Motor único: PostgreSQL. No MySQL ni MariaDB, ni SQLite en producción (SQLite solo se permite como acelerador de tests si así se define en `010-testing`).
2. Toda tabla tiene `id` (PK, tipo serial/uuid a definir en `008-postgresql-data-model`), `created_at` y, cuando aplique, `updated_at`.
3. Toda relación se declara con foreign key explícita, nunca como convención de nombre sin constraint.
4. Los estados (status de alerta, status de misión, status de animal) se modelan como `enum` de PostgreSQL o `varchar` con `CHECK constraint`, nunca como texto libre.
5. Los índices se crean solo sobre columnas usadas en filtros/joins frecuentes (documentados en el `design.md` de la spec que los necesita), no "por si acaso".
6. No modelar como tabla algo que es derivable en tiempo de consulta (ej. "animales esperados en un potrero" es una query sobre `livestock.potrero_id`, no una tabla nueva).
7. Los cambios de esquema van siempre acompañados de una migración versionada, nunca de un `ALTER TABLE` manual sin registro.

## Buenas prácticas
- Nombres de tabla en snake_case plural (`livestock`, `detections`, `alerts`, `events`, `potreros`, `drone_missions`, `media`).
- Nombres de FK como `<entidad>_id` (`potrero_id`, `livestock_id`).
- Usar `NOT NULL` por defecto; permitir `NULL` solo cuando el dominio lo exige (ej. `detections.livestock_id` puede ser `NULL` cuando la detección no se pudo asociar a un animal conocido).
- Timestamps siempre en UTC (`timestamptz`), formateo a hora local se hace en frontend.
- Documentar el modelo entidad-relación completo en `specs/008-postgresql-data-model/design.md` antes de crear migraciones.

## Restricciones
- No sobrecomplicar el modelo con herencia de tablas, particionado o sharding: no aplica a un MVP de hackathon.
- No duplicar datos entre tablas que puedan resolverse con un JOIN.
- No usar triggers/stored procedures para lógica de negocio: esa lógica vive en `backend/app/services/`.

## Estructura esperada
```
database/
├── migrations/         # scripts de migración versionados
├── seeds/               # datos de ejemplo para demo (potreros, livestock, detections, alerts, events)
└── schema.sql (o equivalente generado por el ORM)
```

## Testing requerido
- Tests de repositorio (`backend/tests/`) contra una base de datos real de test (Postgres vía Docker) validando constraints (FK, NOT NULL, unicidad).
- Verificación de que las migraciones aplican limpio sobre una base vacía (`up`) — no se exige `down` para el MVP salvo que se justifique.

## Criterios de aceptación
- El modelo entidad-relación de `008-postgresql-data-model/design.md` está reflejado 1:1 en las migraciones.
- Las queries de reconciliación (animales esperados vs. detectados por potrero) y de "eventos de hoy" corren en tiempo razonable con los índices definidos.
- No existen columnas ni tablas sin uso documentado en una spec.

## Errores que debe evitar la IA
- Crear tablas o columnas "por si se necesitan después" sin spec que las respalde.
- Omitir foreign keys o índices en columnas usadas para filtrar por potrero/fecha/estado.
- Guardar el estado "animal presente en potrero" como columna mutable en `livestock` en vez de derivarlo de `detections` (perdería el historial).
