// Latencia simulada corta para que loading/error/empty se ejerciten de verdad con mocks
// (skills/frontend/skill.md, "Buenas prácticas": loading es obligatorio aunque el mock resuelva rápido).
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
