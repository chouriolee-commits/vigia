# 003 — Livestock Monitoring — Tests

## Unit tests
- `LivestockTable` renderiza filas según las columnas y datos recibidos por props.
- `StatusBadge` renderiza la variante correcta (`ok`/`faltante`/`desconocido`) según prop.
- `livestockService.getReconciliation(potreroId)` devuelve el contrato esperado.

## Integration tests (React Testing Library)
- `LivestockMonitoringPage` renderiza ambas tablas con los datos del mock.
- Un animal con `detectado_recientemente: false` se muestra con badge "faltante" en la tabla de esperados.
- Un animal con `es_esperado_aqui: false` se muestra con badge "desconocido" en la tabla de reales.
- Click en "← Volver" navega a `/`.
- `PotreroSelector` no se renderiza si el mock solo tiene 1 potrero; se renderiza y cambia los datos si hay más de 1.

## API tests (backend, cuando exista)
- `GET /api/potreros/{id}/reconciliacion` — caso positivo (200 + contrato correcto), caso `potrero` inexistente (404).
- Test de `livestock_service.get_reconciliation` con datos de seed: valida que un animal esperado sin detección aparece como faltante, y que una detección sin `livestock_id` aparece como desconocida.

## Casos positivos
- Potrero con animales esperados y todos detectados recientemente → ninguna fila resaltada.

## Casos negativos
- `potreroId` inválido/inexistente → el hook expone `error`, la página muestra mensaje claro (no pantalla en blanco).

## Edge cases
- Tabla de esperados vacía (potrero sin animales asignados).
- Tabla de reales vacía (sin detecciones recientes).
- Todos los animales esperados faltantes a la vez (caso extremo de alerta masiva) — la UI no debe romperse con muchas filas resaltadas.
