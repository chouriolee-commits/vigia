// Seed único del que derivan TODOS los mocks (dashboard, animales, alertas, eventos, feed).
// Objetivo: que el animal #024 que aparece en el dashboard sea el mismo #024 que aparece
// en /alertas y en /eventos — nunca datos inventados por separado en cada mock.
// Ver README.md §7 (contrato de navegación) y specs/008-postgresql-data-model (modelo real).

export const POTRERO = { id: 1, name: 'Potrero Norte' }

function minutesAgoIso(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

// Animales esperados en el potrero (livestock.potrero_id = esperado).
export const LIVESTOCK = [
  { livestock_id: 24, livestock_tag: '#024', species: 'bovino', breed: 'Holstein', potrero_id: 1, status: 'activo' },
  { livestock_id: 30, livestock_tag: '#030', species: 'bovino', breed: 'Angus', potrero_id: 1, status: 'activo' },
  { livestock_id: 55, livestock_tag: '#055', species: 'bovino', breed: 'Jersey', potrero_id: 1, status: 'activo' },
  { livestock_id: 101, livestock_tag: '#101', species: 'bovino', breed: 'Holstein', potrero_id: 1, status: 'activo' },
  { livestock_id: 12, livestock_tag: '#012', species: 'bovino', breed: 'Angus', potrero_id: 1, status: 'activo' },
  { livestock_id: 45, livestock_tag: '#045', species: 'bovino', breed: 'Jersey', potrero_id: 1, status: 'activo' },
  { livestock_id: 67, livestock_tag: '#067', species: 'bovino', breed: 'Holstein', potrero_id: 1, status: 'activo' },
  { livestock_id: 78, livestock_tag: '#078', species: 'bovino', breed: 'Angus', potrero_id: 1, status: 'activo' },
  { livestock_id: 89, livestock_tag: '#089', species: 'bovino', breed: 'Jersey', potrero_id: 1, status: 'activo' },
  { livestock_id: 99, livestock_tag: '#099', species: 'bovino', breed: 'Holstein', potrero_id: 1, status: 'activo' },
]

// #030 y #078 están en el listado esperado pero NO tienen detección reciente (faltantes).
// Detecciones reales (incluye 1 sin livestock_id: animal no identificado).
export const DETECTIONS = [
  { id: 1, livestock_id: 24, livestock_tag: '#024', potrero_id: 1, bbox: { x: 0.42, y: 0.3, width: 0.08, height: 0.1 }, confidence: 0.94, behavior: 'anomalo', detected_at: minutesAgoIso(2), model_version: 'yolov8n-coco-pretrained' },
  { id: 2, livestock_id: 55, livestock_tag: '#055', potrero_id: 1, bbox: { x: 0.2, y: 0.55, width: 0.09, height: 0.11 }, confidence: 0.88, behavior: 'descanso', detected_at: minutesAgoIso(5), model_version: 'yolov8n-coco-pretrained' },
  { id: 3, livestock_id: 101, livestock_tag: '#101', potrero_id: 1, bbox: { x: 0.58, y: 0.62, width: 0.07, height: 0.09 }, confidence: 0.91, behavior: 'pastoreo', detected_at: minutesAgoIso(6), model_version: 'yolov8n-coco-pretrained' },
  { id: 4, livestock_id: 12, livestock_tag: '#012', potrero_id: 1, bbox: { x: 0.72, y: 0.28, width: 0.08, height: 0.1 }, confidence: 0.85, behavior: 'pastoreo', detected_at: minutesAgoIso(8), model_version: 'yolov8n-coco-pretrained' },
  { id: 5, livestock_id: 45, livestock_tag: '#045', potrero_id: 1, bbox: { x: 0.1, y: 0.2, width: 0.07, height: 0.09 }, confidence: 0.79, behavior: 'pastoreo', detected_at: minutesAgoIso(9), model_version: 'yolov8n-coco-pretrained' },
  { id: 6, livestock_id: 67, livestock_tag: '#067', potrero_id: 1, bbox: { x: 0.85, y: 0.5, width: 0.07, height: 0.09 }, confidence: 0.9, behavior: 'descanso', detected_at: minutesAgoIso(11), model_version: 'yolov8n-coco-pretrained' },
  { id: 7, livestock_id: 89, livestock_tag: '#089', potrero_id: 1, bbox: { x: 0.33, y: 0.72, width: 0.08, height: 0.1 }, confidence: 0.82, behavior: 'pastoreo', detected_at: minutesAgoIso(12), model_version: 'yolov8n-coco-pretrained' },
  { id: 8, livestock_id: 99, livestock_tag: '#099', potrero_id: 1, bbox: { x: 0.63, y: 0.15, width: 0.07, height: 0.09 }, confidence: 0.87, behavior: 'pastoreo', detected_at: minutesAgoIso(14), model_version: 'yolov8n-coco-pretrained' },
  { id: 9, livestock_id: null, livestock_tag: null, potrero_id: 1, bbox: { x: 0.48, y: 0.8, width: 0.06, height: 0.08 }, confidence: 0.68, behavior: 'desconocido', detected_at: minutesAgoIso(15), model_version: 'yolov8n-coco-pretrained' },
]

export const MIN_DETECTION_CONFIDENCE = 0.5

export const ALERTS = [
  {
    id: 101,
    detection_id: 1,
    livestock_id: 24,
    livestock_tag: '#024',
    potrero_id: 1,
    potrero_name: POTRERO.name,
    type: 'comportamiento_anomalo',
    priority: 'alta',
    status: 'activa',
    title: 'Comportamiento inusual detectado',
    description: 'Patrón de movimiento errático y aislamiento del rebaño.',
    confidence: 0.94,
    created_at: minutesAgoIso(2),
    resolved_at: null,
  },
  {
    id: 102,
    detection_id: null,
    livestock_id: 30,
    livestock_tag: '#030',
    potrero_id: 1,
    potrero_name: POTRERO.name,
    type: 'animal_faltante',
    priority: 'media',
    status: 'activa',
    title: 'Animal sin detección reciente',
    description: '#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).',
    confidence: null,
    created_at: minutesAgoIso(20),
    resolved_at: null,
  },
  {
    id: 103,
    detection_id: 9,
    livestock_id: null,
    livestock_tag: null,
    potrero_id: 1,
    potrero_name: POTRERO.name,
    type: 'animal_desconocido',
    priority: 'baja',
    status: 'en_revision',
    title: 'Detección sin identificar',
    description: 'Se detectó un animal en Potrero Norte que no coincide con el listado registrado.',
    confidence: 0.68,
    created_at: minutesAgoIso(15),
    resolved_at: null,
  },
]

// Evento sin alerta ni detección asociada (misión completada) — enriquece "Eventos Hoy".
export const MISSION_EVENT = {
  id: 'mission-1',
  title: 'Misión de dron completada',
  description: 'Recorrido de Potrero Norte finalizado.',
  occurred_at: minutesAgoIso(18),
}

export function priorityWeight(priority) {
  return { critica: 4, alta: 3, media: 2, baja: 1 }[priority] ?? 0
}
