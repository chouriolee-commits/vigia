# 008 — PostgreSQL Data Model — Design

## Diagrama entidad-relación — MVP (6 tablas núcleo)

```
potreros
  │ 1
  ├──< livestock (potrero_id = esperado)
  │
  └──< drone_missions ──< media ──< detections >── livestock (livestock_id = real, nullable)
                                        │
                                        └──< alerts (detection_id, livestock_id, potrero_id — nullable)
```

`events` (Eventos Hoy) **no es tabla**: es una query que UNION-a `alerts` + `detections` anómalas + `drone_missions` completadas, todas del día actual, ordenadas por hora. Ver sección "Query de eventos de hoy" abajo.

## Tablas MVP

### `potreros`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| name | varchar(120) UNIQUE NOT NULL | |
| description | text NULL | |
| capacity_estimate | integer NULL | |
| latitude | numeric(9,6) NULL | |
| longitude | numeric(9,6) NULL | |
| created_at | timestamptz NOT NULL DEFAULT now() | |

### `livestock`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| tag_code | varchar(40) UNIQUE NOT NULL | |
| alias | varchar(80) NULL | |
| species | varchar(40) NOT NULL DEFAULT 'bovino' | |
| breed | varchar(80) NULL | |
| potrero_id | integer NULL REFERENCES potreros(id) | asignación esperada |
| status | varchar(20) NOT NULL DEFAULT 'activo' | CHECK IN ('activo','vendido','fallecido','perdido') |
| created_at | timestamptz NOT NULL DEFAULT now() | |

Índice: `idx_livestock_potrero_id (potrero_id)`.

### `drone_missions`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| potrero_id | integer NOT NULL REFERENCES potreros(id) | |
| drone_identifier | varchar(60) NOT NULL | |
| started_at | timestamptz NOT NULL | |
| ended_at | timestamptz NULL | |
| status | varchar(20) NOT NULL DEFAULT 'en_progreso' | CHECK IN ('en_progreso','completada','fallida') |

Índice: `idx_missions_potrero_id (potrero_id)`.

### `media`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| mission_id | integer NOT NULL REFERENCES drone_missions(id) | |
| type | varchar(10) NOT NULL | CHECK IN ('imagen','video') |
| url | varchar(500) NOT NULL | |
| captured_at | timestamptz NOT NULL | |

Índice: `idx_media_mission_id (mission_id)`.

### `detections`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| media_id | integer NOT NULL REFERENCES media(id) | |
| livestock_id | integer NULL REFERENCES livestock(id) | NULL si no matchea |
| potrero_id | integer NOT NULL REFERENCES potreros(id) | potrero real (denormalizado desde la misión, ver nota) |
| bbox_x, bbox_y, bbox_width, bbox_height | numeric NOT NULL | convención de `005-yolov8-detection` |
| confidence | numeric(4,3) NOT NULL | CHECK (0–1) |
| behavior | varchar(20) NULL | CHECK IN ('pastoreo','descanso','anomalo','desconocido') |
| model_version | varchar(40) NOT NULL | |
| detected_at | timestamptz NOT NULL | |

Índices: `idx_detections_potrero_detected (potrero_id, detected_at)`, `idx_detections_livestock_id (livestock_id)`.

> `potrero_id` denormalizado: evita 2 joins en la query de reconciliación, que se ejecuta cada vez que se abre "Animales Monitoreados". Se mantiene consistente desde `backend/app/services/` al insertar.

### `alerts`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| detection_id | integer NULL REFERENCES detections(id) | |
| livestock_id | integer NULL REFERENCES livestock(id) | |
| potrero_id | integer NULL REFERENCES potreros(id) | |
| type | varchar(30) NOT NULL | CHECK IN ('comportamiento_anomalo','animal_faltante','animal_desconocido','salud') |
| priority | varchar(10) NOT NULL | CHECK IN ('baja','media','alta','critica') |
| status | varchar(20) NOT NULL DEFAULT 'activa' | CHECK IN ('activa','en_revision','resuelta','descartada') |
| title | varchar(160) NOT NULL | |
| description | text NULL | |
| created_at | timestamptz NOT NULL DEFAULT now() | |
| resolved_at | timestamptz NULL | |

Índices: `idx_alerts_status_priority (status, priority)`, `idx_alerts_potrero_id (potrero_id)`, `idx_alerts_created_at (created_at)`.

> Nota: se eliminó el tipo `sistema` del MVP (no hay eventos de sistema sin `detection`/`mission` real en el alcance reducido); se puede re-agregar en fase futura si aplica.

## Query de reconciliación (animales esperados vs. reales)

```sql
-- Esperados en :potrero_id
SELECT id, tag_code, alias, status FROM livestock
WHERE potrero_id = :potrero_id AND status = 'activo';

-- Reales/presentes en :potrero_id (última detección por animal, ventana reciente)
SELECT DISTINCT ON (livestock_id) livestock_id, potrero_id, detected_at, confidence, behavior
FROM detections
WHERE potrero_id = :potrero_id AND detected_at >= :window_start
ORDER BY livestock_id, detected_at DESC;
```

## Query de "eventos hoy" (reemplaza la tabla `events` del diseño anterior)

```sql
SELECT 'alerta' AS type, a.title, a.description, a.created_at AS occurred_at,
       l.tag_code AS related_livestock_tag, p.name AS related_potrero_name, a.id AS related_alert_id
FROM alerts a
LEFT JOIN livestock l ON l.id = a.livestock_id
LEFT JOIN potreros p ON p.id = a.potrero_id
WHERE a.created_at::date = CURRENT_DATE

UNION ALL

SELECT 'deteccion' AS type, 'Comportamiento anómalo detectado' AS title,
       NULL AS description, d.detected_at AS occurred_at,
       l.tag_code, p.name, NULL
FROM detections d
LEFT JOIN livestock l ON l.id = d.livestock_id
JOIN potreros p ON p.id = d.potrero_id
WHERE d.behavior = 'anomalo' AND d.detected_at::date = CURRENT_DATE

ORDER BY occurred_at DESC;
```

Esta query vive en `backend/app/repositories/event_repository.py` (o directamente en `event_service.py` si el tiempo apremia — para el MVP no es obligatorio separar repository/service en esta única query de solo lectura, ver `skills/backend`).

## Decisión: por qué NO hay tabla `events` en el MVP
Una tabla `events` con triggers automáticos (como se diseñó originalmente) es trabajo de ingeniería extra — migraciones, triggers o hooks en cada servicio que la escribe — que no aporta nada visible a la demo frente a resolver "Eventos Hoy" con una query derivada. Se documenta como **Fase futura** (RF9 de `requirements.md`) para cuando el proyecto necesite auditoría histórica más allá del día actual.

## Fase futura (documentado, no implementado en el MVP)

### `users` (fase futura)
`id, name, email UNIQUE, password_hash, role CHECK IN ('admin','operador'), created_at`.

### `events` persistida (fase futura)
Mismo diseño que la versión anterior de esta spec: `id, type, title, description, related_livestock_id, related_potrero_id, related_alert_id, occurred_at, created_at`, poblada por triggers/hooks de servicio.

### `ai_conversations` / `ai_messages` (fase futura)
`ai_conversations(id, user_id NULL, started_at)`, `ai_messages(id, conversation_id, role CHECK IN ('user','assistant'), content, created_at)`.

## Orden de migraciones (solo MVP)
1. `potreros`
2. `livestock`
3. `drone_missions`
4. `media`
5. `detections`
6. `alerts`
