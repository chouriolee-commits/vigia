# 013 — Authentication — Tasks

## MVP
- [ ] Agregar tokens de color si faltan (`--danger` para el mensaje de error) en el archivo de variables ya usado por el resto del frontend.
- [ ] Crear `services/mocks/auth.mock.js` (array en memoria `registeredUsers`, seeded con la credencial demo fija).
- [ ] Crear `services/authService.js` (`login(email, password)`, `register(name, email, password)`, `logout()`).
- [ ] Crear hook `hooks/useAuth.js` (`isAuthenticated`, `login`, `register` (con auto-login), `logout`, lee/escribe `localStorage.vigia_auth`).
- [ ] Crear `components/DroneIllustration.jsx` (SVG inline: potrero, vacas, dron, cono de cámara, indicador "REC").
- [ ] Crear `components/LoginForm.jsx` (email, password, validación de cliente, estado de error).
- [ ] Crear `components/RegisterForm.jsx` (nombre, email, password, confirmar password, validación de cliente incl. coincidencia de contraseñas, estado de error).
- [ ] Crear `components/AuthModeToggle.jsx` (link "¿No tienes cuenta? Regístrate" / "¿Ya tienes cuenta? Inicia sesión").
- [ ] Crear `components/AuthCard.jsx` (contenedor único: `DroneIllustration` fija arriba + estado `mode` que alterna `LoginForm`/`RegisterForm` + `AuthModeToggle`).
- [ ] Crear `pages/LoginPage.jsx` (fondo `--bg` + `AuthCard` centrado).
- [ ] Crear componente `RequireAuth` (guard) e integrarlo en `router.jsx` envolviendo `/`, `/animales`, `/alertas`, `/eventos`.
- [ ] Agregar ruta pública `/login` en `router.jsx`.
- [ ] Agregar botón "Cerrar sesión" en `layouts/AppShell.jsx`.
- [ ] Probar manualmente: login correcto → dashboard; login incorrecto → error; registro con email nuevo → auto-login y dashboard; registro con email repetido → error; registro con contraseñas distintas → error; refresh tras login/registro → sigue autenticado; acceso directo a `/alertas` sin sesión → redirige a `/login`.

## Fase futura
- [ ] Endpoint `POST /api/auth/login` y `POST /api/auth/register` contra tabla `users` real (hashing de password, sesión/JWT).
- [ ] Recuperación de contraseña, verificación de email.
