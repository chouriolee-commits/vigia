# 013 — Authentication — Design

## Componentes involucrados
```
pages/LoginPage.jsx
├── components/AuthCard.jsx          (el panel/div único: ilustración + formulario, con estado de modo)
│   ├── components/DroneIllustration.jsx   (SVG inline — dron + vacas en 2D, igual en ambos modos)
│   ├── components/LoginForm.jsx           (modo "login": email, password, submit, error)
│   ├── components/RegisterForm.jsx        (modo "register": nombre, email, password, confirmar, submit, error)
│   └── components/AuthModeToggle.jsx      (link de texto que alterna entre los 2 modos)
└── (layout mínimo, sin AppShell — el login no tiene sidebar/topbar)

layouts/AppShell.jsx  → agrega botón "Cerrar sesión" (usa useAuth().logout)
router.jsx            → agrega ruta pública "/login" + guard sobre las rutas existentes
```

`AuthCard` mantiene un único estado local `mode: 'login' | 'register'` (`useState`, default `'login'`) y renderiza `LoginForm` o `RegisterForm` según corresponda — **no hay dos páginas ni dos rutas**, es el mismo card con contenido intercambiable, la ilustración nunca se desmonta al alternar.

## Layout del `AuthCard` (un solo contenedor, tal como pidió el usuario)

```
┌─────────────────────────────────────┐
│  AuthCard (var(--surface), radius)   │
│  ┌─────────────────────────────────┐ │
│  │  DroneIllustration (SVG, ~40%)  │ │  ← "dentro del div de formulario"
│  │  dron + potrero + vacas en 2D   │ │
│  └─────────────────────────────────┘ │
│  VIGÍA — Monitoreo inteligente       │
│                                       │
│  ·· modo "login" ··                  │
│  [ email                          ]  │
│  [ contraseña                     ]  │
│  ( Iniciar sesión )                  │
│  Credenciales de demo: ...           │
│  ¿No tienes cuenta? Regístrate  →    │
│                                       │
│  ·· modo "register" (alterna) ··     │
│  [ nombre                         ]  │
│  [ email                          ]  │
│  [ contraseña                     ]  │
│  [ confirmar contraseña           ]  │
│  ( Crear cuenta )                    │
│  ¿Ya tienes cuenta? Inicia sesión →  │
└─────────────────────────────────────┘
```
Ambos bloques de campos no coexisten: `AuthCard` muestra uno u otro según `mode`, la ilustración y el título ("VIGÍA — Monitoreo inteligente") son fijos arriba en los dos casos.

En desktop, `AuthCard` se centra en la pantalla sobre el fondo oscuro de la app (mismo `--bg` que el dashboard). En mobile, la ilustración reduce su altura (`max-height` menor) pero permanece dentro del mismo card, arriba del formulario — nunca se separa a otro contenedor.

## Paleta (reutiliza los tokens ya definidos para el resto de la app, `skills/frontend`)

| Token | Uso |
|---|---|
| `--bg` (fondo oscuro) | Fondo de `LoginPage`, detrás del card |
| `--surface` (superficie) | Fondo de `AuthCard` |
| `--accent` (verde/teal VIGÍA) | Botón "Iniciar sesión", foco de inputs, acento del dron/rotor en la ilustración |
| `--text` / `--text-dim` | Labels, texto de ayuda |
| `--danger` (nuevo token, rojo/ámbar de alerta — mismo tono que las alertas de prioridad alta en `006-alert-system`) | Mensaje de error de credenciales |

No se introduce una paleta nueva: es la misma paleta oscura + acento verde/teal de `fotos-diseño/`, para que el login no se sienta como una pantalla de otra aplicación.

## `DroneIllustration` — qué dibuja (SVG inline, 2D, sin librerías)

Escena simple y plana, coherente con el tono "tecnología + ganadería + monitoreo" del resto de la app:
- Un plano de suelo/potrero (rectángulo o path con el verde de fondo, más oscuro que `--surface`).
- 3–4 siluetas de vaca muy simplificadas (óvalo del cuerpo + óvalo pequeño de cabeza + 4 líneas de patas), en `--text-dim` o un tono neutro — no reciben color de marca, son el "sujeto", no el acento.
- Un dron (cuerpo pequeño + 4 brazos con círculo de hélice) en `--accent`, posicionado arriba de las vacas.
- Un cono/rectángulo punteado desde el dron hacia una de las vacas, simulando el campo de visión de la cámara — mismo lenguaje visual que los bounding boxes de `005-yolov8-detection`.
- Un punto pequeño parpadeante (o simplemente sólido, sin animación si `prefers-reduced-motion`) tipo "● REC" en `--accent`, igual al badge "VIVO" del dashboard (`002-dashboard`) — refuerza que es la misma plataforma.

Esto reutiliza deliberadamente el mismo vocabulario visual que ya existe en el dashboard (bounding box punteado, badge de "en vivo"), en vez de inventar un estilo de ilustración nuevo.

## Flujo de datos

```
LoginForm
  → useAuth() [hook]
      → authService.login(email, password) [service]
          → MVP: valida contra credencial demo fija + usuarios registrados en memoria (services/mocks/auth.mock.js)
          → Fase futura: POST /api/auth/login (backend real, tabla `users`)
  ← { ok: true, user: { name, email } } | { ok: false, error: "..." }

RegisterForm
  → useAuth() [hook]
      → authService.register(name, email, password) [service]
          → MVP: valida que el email no exista ya en el listado en memoria; si es válido, lo agrega y devuelve éxito
          → Fase futura: POST /api/auth/register (backend real, tabla `users`, password hasheada)
  ← { ok: true, user: { name, email } } | { ok: false, error: "Ese correo ya está registrado" | "..." }

useAuth también expone:
  - isAuthenticated (leído de localStorage.vigia_auth al montar)
  - login(email, password) → si ok, set localStorage.vigia_auth
  - register(name, email, password) → si ok, registra Y llama login() internamente (auto-login tras registro)
  - logout() → clear localStorage.vigia_auth, navigate('/login')
```

`services/mocks/auth.mock.js` mantiene un array `let registeredUsers = [{ name: 'Demo', email: 'demo@vigia.co', password: 'vigia2026' }]` a nivel de módulo (en memoria, no en `localStorage` — ver restricción de `requirements.md`). `register()` hace `push` sobre ese array tras validar que el email no exista (`.some(u => u.email === email)`); `login()` busca coincidencia de `email` + `password` en el mismo array.

## Guard de rutas (router.jsx)

```
<Route path="/login" element={<LoginPage />} />
<Route element={<RequireAuth />}>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/animales" element={<LivestockMonitoringPage />} />
  <Route path="/alertas" element={<AlertsPage />} />
  <Route path="/eventos" element={<EventsLogPage />} />
</Route>
```
`RequireAuth` es un componente wrapper simple: si `useAuth().isAuthenticated` es falso, `<Navigate to="/login" />`; si es cierto, renderiza `<Outlet />`.

## Decisiones técnicas
- No se persiste el password en ningún storage — solo `{ authenticated: true, email }`.
- La credencial demo (`demo@vigia.co` / `vigia2026`) se muestra en pantalla a propósito: es una demo de hackathon, el jurado/evaluador debe poder entrar sin que alguien tenga que decírsela en vivo.
- El botón "Cerrar sesión" vive en `AppShell` (visible en las 4 pantallas protegidas), no se agrega una quinta pantalla para esto.
