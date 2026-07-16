# Panel de Reservas — Dashboard multi-negocio

Dashboard genérico para que cada cliente (restaurante, peluquería, veterinario,
dentista...) gestione sus reservas. Se adapta por negocio vía la tabla
`usuarios_negocio` y RLS de Supabase — mismo código para todos los clientes.

## 1. Preparar Supabase

En el SQL Editor de tu proyecto (`baanxijaacgppbxdpgro`), ejecuta el archivo
`supabase/001_dashboard_auth.sql`. Esto crea:

- La tabla `usuarios_negocio` (qué login pertenece a qué negocio y con qué rol)
- Las políticas RLS sobre `citas` para que cada negocio solo vea sus propias reservas
- Columnas `tipo_negocio` y `config_capacidad` en `negocios` si no existían

Para dar de alta un cliente nuevo:

1. Ve a **Authentication → Users** en Supabase y crea el usuario con su email/contraseña.
2. Copia su UUID y ejecuta:

```sql
insert into usuarios_negocio (user_id, negocio_id, rol)
values ('uuid-del-usuario', 1, 'encargado');
```

Usa `rol = 'admin'` para tu propio usuario (837) si quieres ver todos los negocios.

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena con los datos de tu
proyecto Supabase (**Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://baanxijaacgppbxdpgro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — te redirige a `/login`.

## 4. Deploy en Vercel

1. Sube esta carpeta a un repo de GitHub.
2. Entra en [vercel.com](https://vercel.com), **Add New → Project**, importa el repo.
3. En **Environment Variables**, añade las dos mismas variables del paso 2.
4. Deploy. Vercel te da una URL tipo `panel-reservas.vercel.app` (luego puedes
   apuntarle un dominio propio, ej. `panel.837comunicacion.com`).

Cada vez que hagas `git push`, Vercel redespliega solo.

## Qué incluye esta Fase 1

- Login con Supabase Auth (`/login`)
- Middleware que protege `/dashboard/*` y redirige según sesión
- Sidebar con nombre e icono del negocio (según `tipo_negocio`)
- Vista de reservas próximas, agrupadas por día, estilo "libro de registro"
  con sellos de estado (Confirmada / Pendiente / Cancelada)
- Página de Ajustes (placeholder para la Fase 4)

## Próximas fases

- **Fase 2**: vista adaptada por tipo de negocio (turno vs. slot con recursos)
- **Fase 3**: crear/editar/cancelar reservas manualmente desde el dashboard
- **Fase 4**: editor de horarios, capacidad y servicios (`config_capacidad`)
- **Fase 5**: pulido de deploy (dominio propio, roles admin/encargado en UI)
