-- Europa 2027 - Fase 2
-- Banco Supabase: login, cofrinho, racha tipo Splitwise, alertas e guia da viagem
-- Cole este script no Supabase em: SQL Editor > New query > Run

create extension if not exists "pgcrypto";

-- =========================
-- 1. Perfis e participantes
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nickname text,
  email text,
  whatsapp text,
  avatar_url text,
  role text default 'traveler',
  receive_alerts boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  whatsapp text,
  color text,
  active boolean default true,
  created_at timestamptz default now()
);

insert into public.participants (name, color)
select 'Vanessa', '#38bdf8'
where not exists (select 1 from public.participants where name = 'Vanessa');

insert into public.participants (name, color)
select 'Camila', '#facc15'
where not exists (select 1 from public.participants where name = 'Camila');

insert into public.participants (name, color)
select 'Danielle', '#22c55e'
where not exists (select 1 from public.participants where name = 'Danielle');

-- =========================
-- 2. Cofrinho e metas
-- =========================

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  target_total_brl numeric(12,2) default 10220.00,
  monthly_target_brl numeric(12,2) default 600.00,
  scenario text default 'seguro',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.savings_entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  entry_date date not null default current_date,
  amount_brl numeric(12,2) not null,
  category text default 'cofrinho mensal',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- metas iniciais para as tres
insert into public.savings_goals (participant_id)
select id from public.participants p
where not exists (select 1 from public.savings_goals g where g.participant_id = p.id);

-- =========================
-- 3. Racha da viagem tipo Splitwise
-- =========================

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  expense_date date not null default current_date,
  total_amount numeric(12,2) not null,
  currency text not null default 'EUR',
  exchange_rate_brl numeric(12,4),
  paid_by uuid references public.participants(id) on delete set null,
  split_type text default 'equal', -- equal, manual, percent
  status text default 'open', -- open, partial, settled
  category text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references public.expenses(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  share_amount numeric(12,2),
  share_percent numeric(8,4),
  paid_back boolean default false,
  paid_back_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  from_participant_id uuid references public.participants(id) on delete cascade,
  to_participant_id uuid references public.participants(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  status text default 'pending', -- pending, paid, cancelled
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- View de saldo simples por participante/moeda
create or replace view public.v_expense_balances as
with paid as (
  select paid_by as participant_id, currency, sum(total_amount) as total_paid
  from public.expenses
  where paid_by is not null
  group by paid_by, currency
), consumed as (
  select s.participant_id, e.currency, sum(coalesce(s.share_amount,0)) as total_consumed
  from public.expense_shares s
  join public.expenses e on e.id = s.expense_id
  group by s.participant_id, e.currency
)
select
  p.id as participant_id,
  p.name,
  coalesce(pa.currency, co.currency, 'EUR') as currency,
  coalesce(pa.total_paid,0) as total_paid,
  coalesce(co.total_consumed,0) as total_consumed,
  coalesce(pa.total_paid,0) - coalesce(co.total_consumed,0) as balance
from public.participants p
left join paid pa on pa.participant_id = p.id
left join consumed co on co.participant_id = p.id and (pa.currency = co.currency or pa.currency is null);

-- =========================
-- 4. Passagens e hospedagens
-- =========================

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'train', -- flight, train, bus, eurostar
  origin text,
  destination text,
  departure_at timestamptz,
  arrival_at timestamptz,
  provider text,
  booking_code text,
  purchase_link text,
  document_link text,
  estimated_cost numeric(12,2),
  actual_cost numeric(12,2),
  currency text default 'EUR',
  status text default 'pending', -- pending, monitoring, purchased, cancelled
  critical boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text,
  checkin_date date,
  checkout_date date,
  address text,
  map_link text,
  booking_link text,
  estimated_cost numeric(12,2),
  actual_cost numeric(12,2),
  currency text default 'EUR',
  cancellation_free boolean default true,
  status text default 'pending', -- pending, reserved, paid, cancelled
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- 5. Alertas e checklist
-- =========================

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alert_type text not null, -- flight, train, currency, hotel, checklist, savings, splitwise
  target_date timestamptz,
  frequency text default 'once', -- once, monthly, biweekly, weekly, daily
  channel text default 'site', -- site, whatsapp, email
  message text,
  assigned_to uuid references public.participants(id) on delete set null,
  status text default 'pending', -- pending, sent, done, cancelled
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  due_date date,
  assigned_to uuid references public.participants(id) on delete set null,
  completed boolean default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- =========================
-- 6. Moedas e radar de cambio
-- =========================

create table if not exists public.currency_targets (
  id uuid primary key default gen_random_uuid(),
  currency text not null unique, -- EUR, CHF, GBP
  usage_notes text,
  planning_rate_brl numeric(12,4),
  buy_some_below_brl numeric(12,4),
  buy_strong_below_brl numeric(12,4),
  planned_amount_per_person numeric(12,2),
  already_bought_amount numeric(12,2) default 0,
  last_rate_brl numeric(12,4),
  last_checked_at timestamptz,
  status text default 'monitorar',
  updated_at timestamptz default now()
);

insert into public.currency_targets (currency, usage_notes, planning_rate_brl, buy_some_below_brl, buy_strong_below_brl)
values
('EUR', 'Italia, Holanda e Belgica', 6.50, 6.20, 6.00),
('CHF', 'Suica', 7.00, 6.70, 6.50),
('GBP', 'Reino Unido', 7.50, 7.20, 7.00)
on conflict (currency) do nothing;

-- =========================
-- 7. RLS - seguranca basica
-- =========================

alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_entries enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;
alter table public.settlements enable row level security;
alter table public.tickets enable row level security;
alter table public.accommodations enable row level security;
alter table public.alerts enable row level security;
alter table public.checklist_items enable row level security;
alter table public.currency_targets enable row level security;

-- Politica simples para fase inicial: usuarios logados podem ler e editar dados da viagem.
-- Depois refinamos por perfil/participante.

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and policyname='authenticated can read participants') then
    create policy "authenticated can read participants" on public.participants for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and policyname='authenticated can manage participants') then
    create policy "authenticated can manage participants" on public.participants for all to authenticated using (true) with check (true);
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array['savings_goals','savings_entries','expenses','expense_shares','settlements','tickets','accommodations','alerts','checklist_items','currency_targets'] loop
    execute format('drop policy if exists "authenticated can read %I" on public.%I', t, t);
    execute format('drop policy if exists "authenticated can manage %I" on public.%I', t, t);
    execute format('create policy "authenticated can read %I" on public.%I for select to authenticated using (true)', t, t);
    execute format('create policy "authenticated can manage %I" on public.%I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- Profiles: cada usuario ve e edita o proprio perfil.
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- =========================
-- 8. Dados iniciais de alertas
-- =========================

insert into public.alerts (title, alert_type, target_date, frequency, channel, message)
values
('Comecar a monitorar voos', 'flight', '2026-12-08 09:00:00-03', 'weekly', 'site', 'Checar Google Flights, Skyscanner, Kayak e Momondo.'),
('Comprar Eurostar quando abrir', 'train', '2027-04-14 09:00:00-03', 'weekly', 'site', 'Prioridade maxima: Bruxelas para Londres.'),
('Reservar hospedagens com cancelamento gratis', 'hotel', '2027-05-01 09:00:00-03', 'weekly', 'site', 'Reservar Milao, St. Moritz, Basel, Amsterdam, Londres e Liverpool.'),
('Comprar Londres para Liverpool', 'train', '2027-07-15 09:00:00-03', 'weekly', 'site', 'Comprar trem Londres para Liverpool.'),
('Comprar trechos do Bernina', 'train', '2027-08-10 09:00:00-03', 'weekly', 'site', 'Conferir Milao para Tirano e Tirano para St. Moritz.')
on conflict do nothing;

insert into public.checklist_items (title, category, due_date)
values
('Confirmar passaporte valido', 'documentos', '2027-05-01'),
('Contratar seguro viagem', 'documentos', '2027-07-01'),
('Criar conta Wise/Nomad', 'dinheiro', '2027-05-01'),
('Baixar Google Maps offline', 'apps', '2027-09-15'),
('Salvar tickets offline', 'documentos', '2027-09-25'),
('Separar adaptador europeu', 'mala', '2027-09-25'),
('Conferir clima das cidades', 'mala', '2027-09-25')
on conflict do nothing;

-- Fim do script
