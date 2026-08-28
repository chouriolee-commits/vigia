# 013 — Authentication — Tests

## Críticos (MVP)
- `authService.login()` resuelve `{ ok: true }` con la credencial demo y `{ ok: false }` con cualquier otra.
- `LoginForm` deshabilita el submit (o muestra error) si algún campo está vacío.
- `LoginForm` muestra el mensaje de error sin borrar el texto ya escrito cuando la credencial es inválida.
- `useAuth`: tras `login()` exitoso, `isAuthenticated` es `true` y persiste releyendo `localStorage` (simula un refresh).
- `RequireAuth`: sin sesión, renderizar una ruta protegida redirige a `/login`; con sesión, renderiza la ruta pedida.
- Click en "Cerrar sesión" limpia la sesión y una ruta protegida vuelve a redirigir a `/login`.
- `authService.register()` con un email nuevo agrega el usuario al mock y resuelve `{ ok: true }`.
- `authService.register()` con un email ya existente (incluida la credencial demo) resuelve `{ ok: false, error: "Ese correo ya está registrado" }`, sin duplicar el usuario.
- `RegisterForm` muestra error de validación cuando `contraseña !== confirmar contraseña`, sin llamar a `authService`.
- `AuthModeToggle` alterna `AuthCard` entre `LoginForm` y `RegisterForm` sin desmontar `DroneIllustration` ni cambiar de ruta.
- Tras un `register()` exitoso, `useAuth().isAuthenticated` pasa a `true` (auto-login) sin un segundo submit.
- Un usuario recién registrado puede iniciar sesión de nuevo con esas credenciales **dentro de la misma sesión de pestaña** (mientras el módulo del mock no se reinicia).

## Opcionales / fase futura
- Tests de integración contra `POST /api/auth/login` y `POST /api/auth/register` reales.
- Tests de expiración de sesión / refresh token.
- Persistencia de usuarios registrados entre recargas (requiere backend real, ver RF11).
