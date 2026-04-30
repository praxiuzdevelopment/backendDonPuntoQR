# Autenticación y Arquitectura Multi-Tenant

El backend de MenuQR (DonPunto) está construido bajo una arquitectura **SaaS Multi-Tenant de base de datos única**. Esto significa que todos los restaurantes comparten las mismas tablas, pero sus datos están rigurosamente aislados a nivel de código.

## El Aislamiento: `tenant_id`

La regla de oro de la arquitectura es: **El `tenant_id` JAMÁS se recibe en el cuerpo (`req.body`) de una petición protegida.**

1. Al iniciar sesión, el usuario recibe un JSON Web Token (JWT).
2. Dicho JWT contiene en su payload el `user_id`, `role` y el `tenant_id` al que pertenece el usuario.
3. El middleware `auth.js` intercepta cada petición protegida, decodifica el token e inyecta estos datos en `req.user`.
4. Los controladores siempre filtran por `req.user.tenant_id`.

```javascript
// Ejemplo correcto en un Controlador/Servicio
const products = await Product.findAll({
  where: { tenant_id: req.user.tenant_id }
});
```
*Si un usuario malicioso intenta consultar el ID de un producto de otro restaurante, el ORM no lo encontrará (404), evitando un ataque IDOR (Insecure Direct Object Reference).*

## Control de Acceso Basado en Roles (RBAC)

Se maneja una jerarquía numérica donde un número menor indica mayor nivel de privilegio:

- **`super_admin` (1)**: Equipo de DonPunto. Su `tenant_id` es `null`. Tienen acceso a la gestión global de clientes y licencias.
- **`admin` (2)**: Dueño/Administrador de un restaurante. Limitado a interactuar exclusivamente con los datos de su `tenant_id`.
- **`viewer` (3)**: Empleado con permisos de solo lectura (Fase futura).

El middleware `requireRole(roleName)` permite proteger rutas fácilmente:

```javascript
// Solo usuarios con rol 'admin' o superior (super_admin) pueden crear productos.
router.post('/products', authenticate, requireRole('admin'), createProduct);
```
