-- ============================================================================
-- No-Show Manager — schéma initial
-- Praticiens paramédicaux indépendants : patients, rendez-vous, score de risque
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Profil praticien (1-1 avec auth.users)
-- ----------------------------------------------------------------------------
create table if not exists practitioners (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table practitioners enable row level security;

create policy "practitioners_select_own"
  on practitioners for select
  using (auth.uid() = id);

create policy "practitioners_update_own"
  on practitioners for update
  using (auth.uid() = id);

create policy "practitioners_insert_own"
  on practitioners for insert
  with check (auth.uid() = id);

-- Crée automatiquement le profil praticien à l'inscription
create or replace function handle_new_practitioner()
returns trigger as $$
begin
  insert into public.practitioners (id, nom, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_practitioner();

-- ----------------------------------------------------------------------------
-- Patients
-- ----------------------------------------------------------------------------
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  nom text not null,
  telephone text,
  email text,
  total_rdv integer not null default 0,
  total_incidents integer not null default 0,
  risk_score numeric(5,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_practitioner on patients(practitioner_id);

alter table patients enable row level security;

create policy "patients_all_own"
  on patients for all
  using (auth.uid() = practitioner_id)
  with check (auth.uid() = practitioner_id);

-- ----------------------------------------------------------------------------
-- Rendez-vous
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'statut_rdv') then
    create type statut_rdv as enum ('confirme', 'en_attente', 'annule', 'honore', 'no_show');
  end if;
end $$;

create table if not exists rendez_vous (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  date_heure timestamptz not null,
  statut statut_rdv not null default 'en_attente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rdv_practitioner on rendez_vous(practitioner_id);
create index if not exists idx_rdv_patient on rendez_vous(patient_id);
create index if not exists idx_rdv_date on rendez_vous(date_heure);

alter table rendez_vous enable row level security;

create policy "rdv_all_own"
  on rendez_vous for all
  using (auth.uid() = practitioner_id)
  with check (auth.uid() = practitioner_id);

-- ----------------------------------------------------------------------------
-- Score de risque du patient : (annulations + no-shows) / total des rendez-vous
-- Recalculé automatiquement à chaque changement de statut d'un rendez-vous.
-- ----------------------------------------------------------------------------
create or replace function recompute_patient_risk_score()
returns trigger as $$
declare
  target_patient_id uuid;
  v_total int;
  v_incidents int;
begin
  target_patient_id := coalesce(new.patient_id, old.patient_id);

  select count(*), count(*) filter (where statut in ('annule', 'no_show'))
    into v_total, v_incidents
    from rendez_vous
    where patient_id = target_patient_id;

  update patients
    set total_rdv = v_total,
        total_incidents = v_incidents,
        risk_score = case when v_total > 0 then round(v_incidents::numeric / v_total, 4) else 0 end,
        updated_at = now()
    where id = target_patient_id;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_rdv_risk_score_insert on rendez_vous;
create trigger trg_rdv_risk_score_insert
  after insert on rendez_vous
  for each row execute function recompute_patient_risk_score();

drop trigger if exists trg_rdv_risk_score_update on rendez_vous;
create trigger trg_rdv_risk_score_update
  after update of statut, patient_id on rendez_vous
  for each row execute function recompute_patient_risk_score();

drop trigger if exists trg_rdv_risk_score_delete on rendez_vous;
create trigger trg_rdv_risk_score_delete
  after delete on rendez_vous
  for each row execute function recompute_patient_risk_score();

-- updated_at automatique
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_patients_updated_at on patients;
create trigger trg_patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

drop trigger if exists trg_rdv_updated_at on rendez_vous;
create trigger trg_rdv_updated_at
  before update on rendez_vous
  for each row execute function set_updated_at();
