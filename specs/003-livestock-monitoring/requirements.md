# 003 — Livestock Monitoring (Animales Monitoreados)

> Uno de los 3 botones del dashboard — MVP crítico. Ver `README.md` §4 y §9.

## Problema
Un ganadero necesita saber, por potrero, si todos los animales que deberían estar presentes realmente lo están. Hoy esa comparación se hace a ojo o no se hace. VIGÍA debe mostrarla de forma explícita: **animales detectados realmente** vs. **animales que deberían estar** en ese potrero.

## Objetivo
Construir la pantalla `/animales`, accesible desde la card "Animales Monitoreados" del dashboard, que muestra **2 tablas lado a lado**:
1. Animales que hay en el potrero (real, según las detecciones más recientes).
2. Animales que deberían haber en ese potrero (esperado, según la asignación en la base de datos).

## Usuario
Operador/ganadero que quiere auditar rápidamente si falta algún animal o si hay un animal detectado que no corresponde a ese potrero.

## User stories
- Como operador, quiero seleccionar un potrero y ver sus dos tablas (real vs. esperado) para detectar faltantes de un vistazo.
- Como operador, quiero que los animales faltantes (esperados pero no detectados recientemente) estén resaltados, para actuar rápido.
- Como operador, quiero que los animales detectados pero no reconocidos (o de otro potrero) estén marcados como "desconocido"/"fuera de su potrero".
- Como operador, quiero un botón "← Volver" para regresar al dashboard sin perder mi lugar.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Header con el nombre del potrero y `BackButton` ("← Volver" → `/`).
- RF2 **[Fase futura]** Selector de potrero (dropdown) si hay más de uno; el MVP de demo puede usar **un único potrero fijo** en el seed/mock, sin selector.
- RF3 **[MVP]** **Tabla "En el potrero (real)"**: `Animal` (tag/alias), `Última detección`, `Comportamiento`, `Confidence`. Animales sin match (`livestock_id = NULL`) → "Animal no identificado".
- RF4 **[MVP]** **Tabla "Deberían estar (esperado)"**: `Animal`, `Especie/Raza`, `Estado`, `¿Detectado recientemente?`.
- RF5 **[MVP]** Resaltado visual en esperados para animales **faltantes** (sin detección reciente).
- RF6 **[MVP]** Resaltado visual en reales para animales **no esperados en este potrero**.
- RF7 **[MVP]** Ambas tablas se alimentan de `useLivestockReconciliation(potreroId)`; la comparación ya viene resuelta (mock o backend), no se calcula en el componente.
- RF8 **[MVP]** Datos mockeados con la forma de `GET /api/potreros/{id}/reconciliacion` (fase futura para el backend real, `009-api-integration`).

## Requisitos no funcionales
- RNF1: Las tablas deben ser legibles en mobile (scroll horizontal si es necesario, apiladas verticalmente en vez de lado a lado en pantallas pequeñas).
- RNF2: La ventana de tiempo para considerar una detección "reciente" es configurable (constante documentada, ej. últimas 2 horas o última misión completada) — no hardcodeada sin nombre.

## Criterios de aceptación (Given/When/Then)

```
Dado el mock con 10 animales esperados en "Potrero Norte" y 8 detecciones recientes,
cuando se abre /animales,
entonces la tabla "Deberían estar" muestra los 10 animales,
la tabla "En el potrero" muestra los animales realmente detectados,
y los animales esperados sin detección reciente aparecen resaltados como faltantes.

Dado que una detección no tiene livestock_id asociado,
cuando se renderiza la tabla "En el potrero",
entonces esa fila se muestra como "Animal no identificado", resaltada como no esperada.

Dado que el usuario está en /animales,
cuando hace click en "← Volver",
entonces regresa a "/".
```

## Casos límite
- Potrero sin ningún animal esperado (tabla esperados vacía) pero con detecciones (todas marcadas como desconocidas/fuera de potrero).
- Potrero con animales esperados pero sin ninguna detección reciente (todos marcados como faltantes, tabla real vacía).
- Empate de nombres/alias entre animales (se distingue siempre por `tag_code`, nunca solo por alias).

## Restricciones
- La lógica de reconciliación (comparar esperado vs. real) vive en el backend (`backend/app/services/livestock_service.py`), el frontend solo renderiza el resultado ya resuelto.
- No se permite editar animales ni potreros desde esta pantalla en el MVP (solo lectura).
