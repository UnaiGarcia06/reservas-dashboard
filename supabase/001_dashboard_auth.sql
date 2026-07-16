-- ============================================================
-- Setup de autenticación multi-tenant para el dashboard
-- Ejecutar en el SQL Editor de Supabase (proyecto baanxijaacgppbxdpgro)
-- ============================================================

-- 1. Asegurar columnas necesarias en "negocios" (ajusta si ya existen con otro nombre)
alter table negocios add column if not exists tipo_negocio text; -- 'restaurante' | 'peluqueria' | 'veterinario' | 'dentista'
alter table negocios add column if not exists config_capacidad jsonb default '{}'::jsonb;

-- 2. Tabla puente: qué usuario de Supabase Auth pertenece a qué negocio y con qué rol
create table if not exists usuarios_negocio (
  user_id uuid references auth.users(id) on delete cascade,
  negocio_id int references negocios(id) on delete cascade,
  rol text not null default 'encargado' check (rol in ('admin', 'encargado')),
  primary key (user_id, negocio_id)
);

alter table usuarios_negocio enable row level security;

-- Cada usuario solo puede ver su propia fila de vínculo
create policy "usuarios_negocio: ver la propia"
  on usuarios_negocio for select
  using (user_id = auth.uid());

-- ============================================================
-- 3. RLS sobre "citas" — el corazón del acceso multi-tenant
-- ============================================================

alter table citas enable row level security;

-- Los admins (837) ven y gestionan todas las reservas de todos los negocios
create policy "citas: admin acceso total"
  on citas for all
  using (
    exists (
      select 1 from usuarios_negocio
      where usuarios_negocio.user_id = auth.uid()
        and usuarios_negocio.rol = 'admin'
    )
  );

-- Los encargados solo ven las reservas de su propio negocio
create policy "citas: encargado ve su negocio"
  on citas for select
  using (
    exists (
      select 1 from usuarios_negocio
      where usuarios_negocio.user_id = auth.uid()
        and usuarios_negocio.negocio_id = citas.negocio_id
    )
  );

-- Los encargados pueden crear/editar reservas solo de su propio negocio
create policy "citas: encargado gestiona su negocio"
  on citas for insert
  with check (
    exists (
      select 1 from usuarios_negocio
      where usuarios_negocio.user_id = auth.uid()
        and usuarios_negocio.negocio_id = citas.negocio_id
    )
  );

create policy "citas: encargado actualiza su negocio"
  on citas for update
  using (
    exists (
      select 1 from usuarios_negocio
      where usuarios_negocio.user_id = auth.uid()
        and usuarios_negocio.negocio_id = citas.negocio_id
    )
  );

-- ============================================================
-- 4. Dar de alta un cliente nuevo (ejemplo, repetir por cada negocio)
-- ============================================================
-- Paso A: crea el usuario en Authentication > Users (Supabase Dashboard) con email/contraseña
-- Paso B: vincúlalo a su negocio con su rol:
--
-- insert into usuarios_negocio (user_id, negocio_id, rol)
-- values ('uuid-del-usuario-creado', 1, 'encargado');
