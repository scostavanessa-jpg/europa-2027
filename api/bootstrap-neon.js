import { neon } from "@neondatabase/serverless";

const VERSION = "2026-07-28-neon-v1";

const statements = [
  `create extension if not exists pgcrypto`,
  `create table if not exists public.app_migrations (version text primary key, applied_at timestamptz not null default now())`,
  `create table if not exists public.profiles (
    id text primary key,
    display_name text,
    email text,
    avatar_url text,
    whatsapp text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists public.user_roles (
    user_id text not null,
    role text not null check (role in ('organizadora','editora','convidada')),
    primary key (user_id, role)
  )`,
  `create table if not exists public.participants (
    id uuid primary key default gen_random_uuid(),
    user_id text unique,
    name text not null unique,
    email text,
    whatsapp text,
    color text,
    active boolean not null default true,
    created_at timestamptz not null default now()
  )`,
  `insert into public.participants(name,color) values
    ('Vanessa','#7b8462'),('Camila','#c8a75d'),('Danielle','#9aa28a')
    on conflict(name) do nothing`,
  `create table if not exists public.savings_goals (
    id uuid primary key default gen_random_uuid(),
    participant_id uuid not null unique references public.participants(id) on delete cascade,
    target_total_brl numeric(12,2) not null default 10220,
    monthly_target_brl numeric(12,2) not null default 600,
    notes text,
    updated_at timestamptz not null default now()
  )`,
  `insert into public.savings_goals(participant_id)
    select id from public.participants p
    where not exists(select 1 from public.savings_goals g where g.participant_id=p.id)`,
  `create table if not exists public.savings_entries (
    id uuid primary key default gen_random_uuid(),
    participant_id uuid not null references public.participants(id) on delete cascade,
    entry_date date not null default current_date,
    amount_brl numeric(12,2) not null check(amount_brl>0),
    notes text,
    created_by text not null default auth.user_id(),
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.personal_priorities (
    id uuid primary key default gen_random_uuid(),
    user_id text not null default auth.user_id(),
    title text not null,
    city text,
    priority text not null check(priority in ('Imperdível','Desejável','Opcional')),
    notes text,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.alert_preferences (
    user_id text primary key default auth.user_id(),
    flights boolean not null default true,
    currency boolean not null default true,
    checklist boolean not null default true,
    lodging boolean not null default true,
    events boolean not null default true,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists public.checklist_items (
    id uuid primary key default gen_random_uuid(),
    key text not null,
    title text not null,
    category text,
    due_date date,
    shared boolean not null default false,
    created_at timestamptz not null default now(),
    unique(key,shared)
  )`,
  `create table if not exists public.checklist_status (
    user_id text not null default auth.user_id(),
    item_id uuid not null references public.checklist_items(id) on delete cascade,
    completed boolean not null default false,
    completed_at timestamptz,
    primary key(user_id,item_id)
  )`,
  `create table if not exists public.expenses (
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
  )`,
  `create table if not exists public.expense_shares (
    id uuid primary key default gen_random_uuid(),
    expense_id uuid not null references public.expenses(id) on delete cascade,
    participant_id uuid not null references public.participants(id) on delete cascade,
    share_amount numeric(12,2) not null,
    paid_back boolean not null default false,
    paid_back_at timestamptz,
    unique(expense_id,participant_id)
  )`,
  `create table if not exists public.route_items (
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
  )`,
  `create table if not exists public.accommodations (
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
  )`,
  `create table if not exists public.alerts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    alert_type text not null,
    target_date timestamptz,
    frequency text default 'once',
    channel text default 'site',
    message text,
    status text default 'pending',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.flight_price_history (
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
  )`,
  `create or replace function public.is_trip_member() returns boolean
    language sql stable security definer set search_path=public as $$
      select exists(select 1 from public.participants p where p.user_id=auth.user_id() and p.active=true)
    $$`,
  `create or replace function public.is_organizer() returns boolean
    language sql stable security definer set search_path=public as $$
      select exists(select 1 from public.user_roles r where r.user_id=auth.user_id() and r.role='organizadora')
    $$`,
  `create or replace function public.bootstrap_current_user() returns void
    language plpgsql security definer set search_path=public,neon_auth as $$
    declare
      uid text := auth.user_id();
      uemail text;
      uname text;
    begin
      if uid is null then raise exception 'not authenticated'; end if;
      begin
        execute 'select email, name from neon_auth."user" where id=$1' into uemail, uname using uid;
      exception when undefined_table then
        select email, name into uemail, uname from neon_auth.users_sync where id=uid and deleted_at is null;
      end;
      if uemail is null then
        uemail := auth.session()->>'email';
        uname := auth.session()->>'name';
      end if;
      insert into public.profiles(id,display_name,email)
      values(uid,coalesce(nullif(uname,''),split_part(coalesce(uemail,''),'@',1)),uemail)
      on conflict(id) do update set email=excluded.email,
        display_name=coalesce(public.profiles.display_name,excluded.display_name), updated_at=now();
      if lower(coalesce(uemail,''))='scosta.vanessa@gmail.com' then
        insert into public.user_roles(user_id,role) values(uid,'organizadora') on conflict do nothing;
        update public.participants set user_id=uid,email=uemail
          where name='Vanessa' and (user_id is null or user_id=uid);
      end if;
    end $$`,
  `create or replace function public.organizer_link_participant(target_email text, participant_name text) returns void
    language plpgsql security definer set search_path=public,neon_auth as $$
    declare target_uid text;
    begin
      if not public.is_organizer() then raise exception 'organizer only'; end if;
      begin
        execute 'select id from neon_auth."user" where lower(email)=lower($1)' into target_uid using target_email;
      exception when undefined_table then
        select id into target_uid from neon_auth.users_sync where lower(email)=lower(target_email) and deleted_at is null;
      end;
      if target_uid is null then raise exception 'user not found'; end if;
      if exists(select 1 from public.participants where user_id=target_uid) then raise exception 'account already linked'; end if;
      update public.participants set user_id=target_uid,email=target_email
        where name=participant_name and user_id is null;
      if not found then raise exception 'participant unavailable'; end if;
    end $$`,
  `alter table public.profiles enable row level security`,
  `alter table public.user_roles enable row level security`,
  `alter table public.participants enable row level security`,
  `alter table public.savings_goals enable row level security`,
  `alter table public.savings_entries enable row level security`,
  `alter table public.personal_priorities enable row level security`,
  `alter table public.alert_preferences enable row level security`,
  `alter table public.checklist_items enable row level security`,
  `alter table public.checklist_status enable row level security`,
  `alter table public.expenses enable row level security`,
  `alter table public.expense_shares enable row level security`,
  `alter table public.route_items enable row level security`,
  `alter table public.accommodations enable row level security`,
  `alter table public.alerts enable row level security`,
  `alter table public.flight_price_history enable row level security`,
  `revoke all on all tables in schema public from anonymous`,
  `revoke all on all sequences in schema public from anonymous`,
  `grant usage on schema public to authenticated`,
  `grant select,insert,update,delete on public.profiles,public.participants,public.savings_goals,public.savings_entries,public.personal_priorities,public.alert_preferences,public.checklist_items,public.checklist_status,public.expenses,public.expense_shares,public.route_items,public.accommodations,public.alerts,public.flight_price_history to authenticated`,
  `grant select on public.user_roles to authenticated`,
  `grant usage,select on all sequences in schema public to authenticated`,
  `revoke execute on function public.bootstrap_current_user() from public`,
  `grant execute on function public.bootstrap_current_user() to authenticated`,
  `revoke execute on function public.organizer_link_participant(text,text) from public`,
  `grant execute on function public.organizer_link_participant(text,text) to authenticated`,
  `drop policy if exists profiles_own on public.profiles`,
  `create policy profiles_own on public.profiles for all to authenticated using (auth.user_id()=id) with check (auth.user_id()=id)`,
  `drop policy if exists roles_own_read on public.user_roles`,
  `create policy roles_own_read on public.user_roles for select to authenticated using (auth.user_id()=user_id)`,
  `drop policy if exists participants_member_read on public.participants`,
  `create policy participants_member_read on public.participants for select to authenticated using (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists participants_admin_write on public.participants`,
  `create policy participants_admin_write on public.participants for all to authenticated using (public.is_organizer()) with check (public.is_organizer())`,
  `drop policy if exists savings_goals_private on public.savings_goals`,
  `create policy savings_goals_private on public.savings_goals for all to authenticated
    using (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))
    with check (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))`,
  `drop policy if exists savings_entries_private on public.savings_entries`,
  `create policy savings_entries_private on public.savings_entries for all to authenticated
    using (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))
    with check (exists(select 1 from public.participants p where p.id=participant_id and (p.user_id=auth.user_id() or public.is_organizer())))`,
  `drop policy if exists priorities_own on public.personal_priorities`,
  `create policy priorities_own on public.personal_priorities for all to authenticated using (auth.user_id()=user_id) with check (auth.user_id()=user_id)`,
  `drop policy if exists alert_preferences_own on public.alert_preferences`,
  `create policy alert_preferences_own on public.alert_preferences for all to authenticated using (auth.user_id()=user_id) with check (auth.user_id()=user_id)`,
  `drop policy if exists checklist_items_member_read on public.checklist_items`,
  `create policy checklist_items_member_read on public.checklist_items for select to authenticated using (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists checklist_items_admin_write on public.checklist_items`,
  `create policy checklist_items_admin_write on public.checklist_items for all to authenticated using (public.is_organizer()) with check (public.is_organizer())`,
  `drop policy if exists checklist_status_own on public.checklist_status`,
  `create policy checklist_status_own on public.checklist_status for all to authenticated using (auth.user_id()=user_id and public.is_trip_member()) with check (auth.user_id()=user_id and public.is_trip_member())`,
  `drop policy if exists expenses_member on public.expenses`,
  `create policy expenses_member on public.expenses for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists expense_shares_member on public.expense_shares`,
  `create policy expense_shares_member on public.expense_shares for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists route_member on public.route_items`,
  `create policy route_member on public.route_items for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists accommodations_member on public.accommodations`,
  `create policy accommodations_member on public.accommodations for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists alerts_member on public.alerts`,
  `create policy alerts_member on public.alerts for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`,
  `drop policy if exists flight_history_member on public.flight_price_history`,
  `create policy flight_history_member on public.flight_price_history for all to authenticated using (public.is_trip_member() or public.is_organizer()) with check (public.is_trip_member() or public.is_organizer())`
];

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "no-store");

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ ok: false, error: "database_not_connected" });
  }

  const sql = neon(process.env.DATABASE_URL);
  let step = 0;
  try {
    await sql.query(statements[0], []);
    await sql.query(statements[1], []);
    const existing = await sql`select version from public.app_migrations where version=${VERSION}`;
    if (existing.length) return res.status(200).json({ ok: true, version: VERSION, status: "already_applied" });

    for (step = 2; step < statements.length; step++) {
      await sql.query(statements[step], []);
    }
    await sql`insert into public.app_migrations(version) values(${VERSION}) on conflict do nothing`;
    return res.status(200).json({ ok: true, version: VERSION, status: "applied" });
  } catch (error) {
    console.error("Neon bootstrap failed", { step, message: error?.message });
    return res.status(500).json({ ok: false, error: "migration_failed", step, message: String(error?.message || "unknown").slice(0, 240) });
  }
}
