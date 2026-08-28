# 013 — Authentication (Login)

> **Adición posterior a la auditoría de alcance:** las specs 001–012 fijaron la regla "solo 4 rutas, sin pantallas fuera del dashboard y sus 3 botones". Esta spec la amplía deliberadamente: se agrega `/login` como puerta de entrada antes del dashboard. No cambia nada del resto del alcance MVP — `/`, `/animales`, `/alertas`, `/eventos` siguen siendo exactamente lo definido en `002/003/006/012`.

## Problema
Sin una pantalla de entrada, cualquiera que abra la URL cae directo en datos operativos del productor. Una pantalla de login — aunque simulada en el MVP — hace que la plataforma se sienta como un producto real desde el primer segundo de la demo, y deja preparado el camino a autenticación real.

## Objetivo
Construir `/login`: formulario funcional (email + contraseña) con la misma identidad visual de VIGÍA (fondo oscuro, acento verde/teal), con una ilustración 2D simulando un dron grabando vacas integrada **dentro del mismo panel/div del formulario**, y con la posibilidad de **registrarse** (crear una cuenta nueva) desde esa misma pantalla — sin agregar una ruta adicional.

## Usuario
Productor ganadero / administrador de finca — el mismo usuario de todas las demás specs. Puede ser alguien que ya tiene cuenta (inicia sesión) o alguien que entra por primera vez (se registra).

## User stories
- Como operador, quiero iniciar sesión antes de ver el dashboard, para que la plataforma se sienta segura y real.
- Como operador nuevo, quiero poder crear una cuenta desde la misma pantalla de login, sin que alguien más me la cree.
- Como operador, quiero ver un error claro si escribo mal mis credenciales o si mi registro tiene un problema (contraseñas que no coinciden, correo ya usado), sin perder lo que ya escribí.
- Como operador, quiero que si ya inicié sesión, refrescar la página no me regrese al login.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Ruta `/login`, pública. Todas las demás rutas (`/`, `/animales`, `/alertas`, `/eventos`) quedan protegidas por un guard simple: sin sesión activa → `redirect` a `/login`.
- RF2 **[MVP]** Formulario con dos campos (`email`, `password`) y botón "Iniciar sesión". Validación de cliente: ningún campo vacío, `email` con formato válido.
- RF3 **[MVP]** Autenticación **simulada**: `authService.login(email, password)` valida contra una credencial demo fija y documentada en pantalla (ej. `demo@vigia.co` / `vigia2026`, visible como texto de ayuda bajo el formulario: "Credenciales de demo: ..."). Si coincide, guarda una bandera de sesión y navega a `/`.
- RF4 **[MVP]** Credenciales inválidas → mensaje de error visible junto al formulario ("Correo o contraseña incorrectos"), sin borrar lo ya escrito, sin bloquear reintentos.
- RF5 **[MVP]** Sesión persistida en `localStorage` (`vigia_auth`) para que un refresh de página no expulse al usuario ya autenticado durante la demo.
- RF6 **[MVP]** Ilustración 2D (SVG inline, sin imágenes externas) de un dron sobrevolando y "grabando" vacas en un potrero, ubicada dentro del mismo contenedor visual del formulario (ver `design.md` para el layout exacto). Debe usar la misma paleta que el resto de la app. Se muestra igual en modo login y en modo registro (no cambia entre ambos).
- RF7 **[MVP]** Botón "Cerrar sesión" accesible desde `AppShell` (sidebar/topbar), que limpia la sesión y regresa a `/login`.
- RF8 **[MVP] — registro:** `AuthCard` tiene dos modos, alternables con un link de texto ("¿No tienes cuenta? Regístrate" / "¿Ya tienes cuenta? Inicia sesión"), **sin cambiar de ruta**:
  - Modo **login**: el formulario ya descrito en RF2–RF4.
  - Modo **registro**: campos `nombre`, `email`, `contraseña`, `confirmar contraseña`. Validación de cliente: ningún campo vacío, email con formato válido, contraseña con al menos 6 caracteres, `contraseña === confirmar contraseña`.
- RF9 **[MVP]** `authService.register(name, email, password)` (mock): si el email ya existe en el listado de usuarios de la sesión de demo, responde error "Ese correo ya está registrado"; si no, agrega el usuario a un listado **en memoria** (no persistido en `localStorage`, ver Restricciones) y **inicia sesión automáticamente**, navegando a `/`.
- RF10 **[MVP]** Tras un registro exitoso, el mensaje de bienvenida/confirmación puede ser tan simple como el propio redirect al dashboard — no se agrega una pantalla de "registro exitoso" aparte (mantiene el conteo de pantallas al mínimo).

### Fase futura
- RF11 **[Fase futura]** Autenticación real contra `backend/`, tabla `users` (`008-postgresql-data-model`, ya documentada como fase futura), hashing de contraseña, sesión vía JWT o cookie — reemplaza `authService.login`/`authService.register` sin cambiar `LoginForm`/`RegisterForm` ni `LoginPage`.
- RF12 **[Fase futura]** Recuperación de contraseña, verificación de email, roles.

## Requisitos no funcionales
- RNF1 **[MVP]** El login funciona 100% sin backend (mock), igual que el resto del MVP.
- RNF2 **[MVP]** Accesible: labels asociados a los inputs, foco visible, mensaje de error anunciable (no solo color).
- RNF3 **[MVP]** Responsive: en mobile la ilustración no empuja el formulario fuera de la pantalla (se reduce o se apila arriba del formulario).

## Criterios de aceptación (Given/When/Then)

```
Dado que el usuario no tiene sesión activa,
cuando visita cualquier ruta protegida (ej. "/alertas"),
entonces es redirigido a "/login".

Dado que el usuario escribe las credenciales demo válidas,
cuando envía el formulario,
entonces es redirigido a "/" y su sesión persiste tras refrescar la página.

Dado que el usuario escribe credenciales inválidas,
cuando envía el formulario,
entonces ve un mensaje de error claro y el formulario conserva el texto ya escrito.

Dado que el usuario tiene sesión activa,
cuando hace click en "Cerrar sesión",
entonces vuelve a "/login" y las rutas protegidas dejan de ser accesibles.

Dado que el usuario está en "/login" y hace click en "¿No tienes cuenta? Regístrate",
cuando el formulario cambia a modo registro,
entonces ve los campos nombre/email/contraseña/confirmar contraseña, sin salir de "/login".

Dado que el usuario completa el registro con un email nuevo y contraseñas coincidentes,
cuando envía el formulario,
entonces la cuenta se crea, la sesión inicia automáticamente y es redirigido a "/".

Dado que el usuario intenta registrarse con un email ya usado en la sesión de demo,
cuando envía el formulario,
entonces ve el error "Ese correo ya está registrado" y permanece en modo registro con sus datos.
```

## Casos límite
- Campos vacíos → botón "Iniciar sesión"/"Crear cuenta" deshabilitado o error inline, sin llamar a `authService`.
- Usuario ya autenticado que visita `/login` directamente → redirige a `/` (no le vuelve a mostrar el formulario).
- `localStorage` bloqueado/no disponible (navegación privada) → el login/registro sigue funcionando dentro de la sesión de pestaña (degradación aceptable, documentar en `design.md`).
- Contraseñas que no coinciden en el registro → error inline junto al campo "confirmar contraseña", sin limpiar el formulario.
- Recargar la página tras un registro → el usuario registrado en memoria se pierde (no persiste, ver Restricciones); si la sesión (`vigia_auth`) sí persistió, el usuario sigue autenticado igual — solo no podría volver a iniciar sesión con ese email tras cerrar sesión y recargar. Se documenta como limitación aceptada del mock (RF11 la resuelve con backend real).

## Restricciones
- No se guarda ninguna contraseña en `localStorage` ni en ningún storage persistente — solo una bandera de sesión (`vigia_auth: true` + email, nunca el password), tanto para login como para registro.
- El listado de usuarios registrados por el mock vive **en memoria** (variable de módulo en `services/mocks/auth.mock.js`), no en `localStorage` — se reinicia con cada recarga completa de la página. Es una simplificación consciente del MVP, no un bug.
- No se implementa backend de autenticación real en el MVP.
- La ilustración es SVG inline propio, sin librerías ni imágenes externas (consistente con `skills/frontend`).
