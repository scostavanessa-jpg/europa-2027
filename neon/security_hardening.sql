-- Europa até Liverpool 2027 — security hardening
-- Run AFTER neon/schema.sql, with Neon Auth + Data API enabled.

-- Nobody using the anonymous Data API role may access trip tables.
revoke all on all tables in schema public from anonymous;
revoke all on all sequences in schema public from anonymous;

-- The Data API authenticated role gets table privileges; RLS below decides rows.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.participants,
  public.savings_goals,
  public.savings_entries,
  public.personal_priorities,
  public.alert_preferences,
  public.checklist_items,
  public.checklist_status,
  public.expenses,
  public.expense_shares,
  public.route_items,
  public.accommodations,
  public.alerts,
  public.flight_price_history
  to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Membership means the authenticated Neon user has been explicitly linked to
-- Vanessa, Camila or Danielle. A random signup is NOT a trip member.
create or replace function public.is_trip_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.participants p
    where p.user_id = auth.user_id()
      and p.active = true
  );
$$;

create or replace function public.is_organizer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.user_id()
      and r.role = 'organizadora'
  );
$$;

-- Public self-claim is intentionally disabled because Neon Auth currently lets
-- anyone on the web create an account. Only the organizer may approve/link users.
revoke execute on function public.claim_participant(text) from public;
revoke execute on function public.claim_participant(text) from authenticated;

create or replace function public.organizer_link_participant(target_user_id text, participant_name text)
returns void
language plpgsql
security definer
set search_path = public, neon_auth
as $$
begin
  if not public.is_organizer() then
    raise exception 'organizer only';
  end if;

  if not exists(select 1 from neon_auth.user where id = target_user_id) then
    raise exception 'user not found';
  end if;

  if exists(select 1 from public.participants where user_id = target_user_id) then
    raise exception 'user already linked';
  end if;

  update public.participants
     set user_id = target_user_id,
         email = (select email from neon_auth.user where id = target_user_id)
   where name = participant_name
     and user_id is null;

  if not found then
    raise exception 'participant unavailable';
  end if;
end;
$$;

revoke execute on function public.organizer_link_participant(text,text) from public;
grant execute on function public.organizer_link_participant(text,text) to authenticated;
grant execute on function public.bootstrap_current_user() to authenticated;
grant execute on function public.is_trip_member() to authenticated;
grant execute on function public.is_organizer() to authenticated;

-- Replace permissive policies created by the initial schema.
drop policy if exists participants_group_read on public.participants;
drop policy if exists participants_own_update on public.participants;
drop policy if exists checklist_items_group on public.checklist_items;
drop policy if exists expenses_group on public.expenses;
drop policy if exists expense_shares_group on public.expense_shares;
drop policy if exists route_group on public.route_items;
drop policy if exists accommodations_group on public.accommodations;
drop policy if exists alerts_group on public.alerts;
drop policy if exists flight_history_group on public.flight_price_history;

create policy participants_members_read
on public.participants for select to authenticated
using (public.is_trip_member() or public.is_organizer());

create policy participants_organizer_update
on public.participants for update to authenticated
using (public.is_organizer())
with check (public.is_organizer());

create policy checklist_items_members_read
on public.checklist_items for select to authenticated
using (public.is_trip_member() or public.is_organizer());

create policy expenses_members
on public.expenses for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

create policy expense_shares_members
on public.expense_shares for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

create policy route_members
on public.route_items for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

create policy accommodations_members
on public.accommodations for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

create policy alerts_members
on public.alerts for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

create policy flight_history_members
on public.flight_price_history for all to authenticated
using (public.is_trip_member() or public.is_organizer())
with check (public.is_trip_member() or public.is_organizer());

-- Personal tables also require trip membership, so an arbitrary account cannot
-- use the app merely because it authenticated successfully.
drop policy if exists priorities_own on public.personal_priorities;
drop policy if exists alert_preferences_own on public.alert_preferences;
drop policy if exists checklist_status_own on public.checklist_status;

create policy priorities_member_own
on public.personal_priorities for all to authenticated
using (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()))
with check (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()));

create policy alert_preferences_member_own
on public.alert_preferences for all to authenticated
using (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()))
with check (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()));

create policy checklist_status_member_own
on public.checklist_status for all to authenticated
using (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()))
with check (auth.user_id() = user_id and (public.is_trip_member() or public.is_organizer()));

-- Organizers may inspect profiles to approve Camila/Danielle after they sign up.
drop policy if exists profiles_own on public.profiles;
create policy profiles_own_or_organizer
on public.profiles for select to authenticated
using (auth.user_id() = id or public.is_organizer());
create policy profiles_own_insert
on public.profiles for insert to authenticated
with check (auth.user_id() = id);
create policy profiles_own_update
on public.profiles for update to authenticated
using (auth.user_id() = id)
with check (auth.user_id() = id);
