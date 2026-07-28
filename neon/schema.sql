-- Europa até Liverpool 2027 — Neon production schema
-- Apply after enabling Neon Auth + Data API for the production branch.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key references neon_auth.user(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id text not null references neon_auth.user(id) on delete cascade,
  role text not null check (role in ('organizadora','editora','convidada')),
  primary key (user_id, role)
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  user_id text unique references neon_auth.user(id) on delete set null,
  name text not null unique,
  email text,
  whatsapp text,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.participants(name,color) values
 ('Vanessa','#7b8462'),('Camila','#c8a75d'),('Danielle','#9aa28a')
on conflict(name) do nothing;

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique references public.participants(id) on delete cascade,
  target_total_brl numeric(12,2) not null default 10220,
  monthly_target_brl numeric(12,2) not null default 600,
  notes text,
  updated_at timestamptz not null default now()
);

insert into public.savings_goals(participant_id)
select id from public.participants p
where not exists(select 1 from public.savings_goals g where g.participant_id=p.id);

create table if not exists public.savings_entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  entry_date date not null default current_date,
  amount_brl numeric(12,2) not null check(amount_brl>0),
  notes text,
  created_by text not null default auth.user_id(),
  created_at timestamptz not null default now()
);

create table if not exists public.personal_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.user_id(),
  title text not null,
  city text,
  priority text not null check(priority in ('Imperdível','Desejável','Opcional')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.alert_preferences (
  user_id text primary key default auth.user_id(),
  flights boolean not null default true,
  currency boolean not null default true,
  checklist boolean not null default true,
  lodging boolean not null default true,
  events boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  title text not null,
  category text,
  due_date date,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  unique(key,shared)
);

create table if not exists public.checklist_status (
  user_id text not null default auth.user_id(),
  item_id uuid not null references public.checklist_items(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key(user_id,item_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  expense_date date not null default current_date,
  total_amount numeric(12,2) not null check(total_amount>0),
  currency text not null default 'EUR',
  paid_by uuid references public.participants(id) on delete set null,
  status text not null default 'open',
  category text,
  notes text,
  created_by text not null default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  share_amount numeric(12,2) not null,
  paid_back boolean not null default false,
  paid_back_at timestamptz,
  unique(expense_id,participant_id)
);

create table if not exists public.route_items (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  priority text default 'desejável',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text,
  checkin_date date,
  checkout_date date,
  booking_link text,
  estimated_cost numeric(12,2),
  actual_cost numeric(12,2),
  currency text default 'EUR',
  status text default 'pending',
  notes text
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alert_type text not null,
  target_date timestamptz,
  frequency text default 'once',
  channel text default 'site',
  message text,
  status text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.flight_price_history (
  id uuid primary key default gen_random_uuid(),
  searched_at timestamptz not null default now(),
  origin text not null,
  destination text not null,
  departure_date date not null,
  adults integer not null default 3,
  price_per_person_brl numeric(12,2),
  total_price_brl numeric(12,2),
  airline text,
  stops integer,
  duration_minutes integer,
  source text,
  offer_url text
);

-- First-login bootstrap. It creates the profile safely and automatically gives
-- Vanessa the organizer role based on her email. No client can self-promote.
create or replace function public.bootstrap_current_user()
returns void
language plpgsql
security definer
set search_path = public, neon_auth
as $$
declare
  uid text := auth.user_id();
  uemail text;
  uname text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select email, name into uemail, uname from neon_auth.user where id=uid;
  insert into public.profiles(id,display_name,email)
  values(uid,coalesce(nullif(uname,''),split_part(uemail,'@',1)),uemail)
  on conflict(id) do update set email=excluded.email, display_name=coalesce(public.profiles.display_name,excluded.display_name), updated_at=now();

  if lower(uemail)='scosta.vanessa@gmail.com' then
    insert into public.user_roles(user_id,role) values(uid,'organizadora') on conflict do nothing;
    update public.participants set user_id=uid,email=uemail where name='Vanessa' and (user_id is null or user_id=uid);
  end if;
end;
$$;

-- Camila and Danielle can claim only an unclaimed participant row once.
create or replace function public.claim_participant(participant_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.user_id();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if exists(select 1 from public.participants where user_id=uid) then raise exception 'account already linked'; end if;
  update public.participants set user_id=uid where name=participant_name and user_id is null;
  if not found then raise exception 'participant unavailable'; end if;
end;
$$;

-- Data API requires RLS on every exposed table.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.participants enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_entries enable row level security;
alter table public.personal_priorities enable row level security;
alter table public.alert_preferences enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_status enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;
alter table public.route_items enable row level security;
alter table public.accommodations enable row level security;
alter table public.alerts enable row level security;
alter table public.flight_price_history enable row level security;

-- Own-account data.
create policy profiles_own on public.profiles for all to authenticated
using (auth.user_id()=id) with check (auth.user_id()=id);
create policy roles_own_read on public.user_roles for select to authenticated
using (auth.user_id()=user_id);
create policy priorities_own on public.personal_priorities for all to authenticated
using (auth.user_id()=user_id) with check (auth.user_id()=user_id);
create policy alert_preferences_own on public.alert_preferences for all to authenticated
using (auth.user_id()=user_id) with check (auth.user_id()=user_id);
create policy checklist_status_own on public.checklist_status for all to authenticated
using (auth.user_id()=user_id) with check (auth.user_id()=user_id);

-- Participant-linked savings: a traveler only manages their own; organizer can manage all.
create or replace function public.is_organizer() returns boolean language sql stable as $$
  select exists(select 1 from public.user_roles where user_id=auth.user_id() and role='organizadora');
$$;

create policy participants_group_read on public.participants for select to authenticated using (true);
create policy participants_own_update on public.participants for update to authenticated
using (user_id=auth.user_id() or public.is_organizer())
with check (user_id=auth.user_id() or public.is_organizer());

create policy savings_goals_read on public.savings_goals for select to authenticated
using (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())));
create policy savings_goals_write on public.savings_goals for all to authenticated
using (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))
with check (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())));
create policy savings_entries_own on public.savings_entries for all to authenticated
using (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))
with check (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())));

-- Shared trip data: authenticated travelers can collaborate.
create policy checklist_items_group on public.checklist_items for select to authenticated using (true);
create policy expenses_group on public.expenses for all to authenticated using (true) with check (true);
create policy expense_shares_group on public.expense_shares for all to authenticated using (true) with check (true);
create policy route_group on public.route_items for all to authenticated using (true) with check (true);
create policy accommodations_group on public.accommodations for all to authenticated using (true) with check (true);
create policy alerts_group on public.alerts for all to authenticated using (true) with check (true);
create policy flight_history_group on public.flight_price_history for all to authenticated using (true) with check (true);
