-- ============================================================
-- Fase 2: soporte para negocios "slot" (recursos) y "turno"
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

create table if not exists recursos (
  id serial primary key,
  negocio_id int references negocios(id) on delete cascade,
  nombre text not null,
  activo boolean default true
);

alter table recursos enable row level security;

create policy "recursos: encargado ve su negocio"
  on recursos for select
  using (
    exists (
      select 1 from usuarios_negocio
      where usuarios_negocio.user_id = auth.uid()
        and usuarios_negocio.negocio_id = recursos.negocio_id
    )
  );

alter table citas add column if not exists recurso_id int references recursos(id);

update negocios
set nombre = coalesce(nombre, 'Gamon 14'),
    tipo_negocio = 'restaurante',
    config_capacidad = '{
      "modo": "turno",
      "turnos": [
        { "nombre": "Comida", "inicio": "12:30", "fin": "15:30" },
        { "nombre": "Cena", "inicio": "20:30", "fin": "23:00" }
      ]
    }'::jsonb
where id = 1;
