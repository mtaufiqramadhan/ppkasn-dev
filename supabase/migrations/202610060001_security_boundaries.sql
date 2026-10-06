-- Review and apply using the Supabase SQL editor / migration runner.
-- No user records or booking data are deleted. Existing permissive policies are
-- capped by restrictive policies, so they cannot bypass the new admin boundary.
begin;

create or replace function public.is_cms_admin()
returns boolean language sql stable security invoker set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'cms_role', '') = 'admin'
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;
revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to authenticated;

alter table public.assets enable row level security;
alter table public.room_bookings enable row level security;

-- Anonymous users can discover facility metadata, but cannot read inventory
-- notes, serial numbers, borrower history, or perform any writes.
revoke all privileges on table public.assets from public, anon;
grant select on public.assets to service_role;
grant select (id, name, floor, capacity, facilities, category, type, location) on public.assets to anon;
drop policy if exists security_public_facility_boundary on public.assets;
create policy security_public_facility_boundary on public.assets as restrictive for select to anon
using (type in ('ruang_rapat', 'ruangan', 'ruang', 'asrama') or category ilike '%ruang rapat%');
drop policy if exists security_public_facilities on public.assets;
create policy security_public_facilities on public.assets for select to anon
using (type in ('ruang_rapat', 'ruangan', 'ruang', 'asrama') or category ilike '%ruang rapat%');

grant select, insert, update, delete on public.assets to authenticated;
drop policy if exists security_assets_admin_boundary on public.assets;
create policy security_assets_admin_boundary on public.assets as restrictive for all to authenticated
using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));
drop policy if exists security_assets_admin on public.assets;
create policy security_assets_admin on public.assets for all to authenticated
using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));

-- Names, phone numbers, participant rosters and room assignments are private.
-- Public schedules and submissions go through the validated server gateway.
revoke all privileges on table public.room_bookings from public, anon;
grant select, insert on public.room_bookings to service_role;
grant select, insert, update, delete on public.room_bookings to authenticated;
drop policy if exists security_bookings_admin_boundary on public.room_bookings;
create policy security_bookings_admin_boundary on public.room_bookings as restrictive for all to authenticated
using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));
drop policy if exists security_bookings_admin on public.room_bookings;
create policy security_bookings_admin on public.room_bookings for all to authenticated
using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));

create or replace function public.create_validated_booking(input jsonb)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  selected_ids text[];
  details jsonb;
  first_day date;
  last_day date;
  first_time time;
  last_time time;
  result_id text;
begin
  if jsonb_typeof(input) <> 'object' or octet_length(input::text) > 262144
    or jsonb_typeof(input -> 'roomIds') <> 'array'
    or jsonb_array_length(input -> 'roomIds') not between 1 and 100 then
    raise exception 'Invalid booking';
  end if;
  select array_agg(value) into selected_ids from jsonb_array_elements_text(input -> 'roomIds');
  details := input -> 'payload';
  first_day := left(details ->> 'bookingStart', 10)::date;
  last_day := coalesce(nullif(left(details ->> 'bookingEnd', 10), ''), left(details ->> 'bookingStart', 10))::date;
  first_time := (details ->> 'startTime')::time;
  last_time := (details ->> 'endTime')::time;
  if first_day is null or last_day is null or first_time is null or last_time is null
    or last_day < first_day or last_day - first_day > 366 or last_time <= first_time
    or coalesce(length(details ->> 'name'), 0) not between 1 and 150
    or coalesce(length(details ->> 'institutionName'), 0) not between 1 and 250 then
    raise exception 'Invalid booking';
  end if;
  if (select count(*) from public.assets where id::text = any(selected_ids)
      and (type in ('ruang_rapat', 'ruangan', 'ruang', 'asrama') or category ilike '%ruang rapat%')) <> cardinality(selected_ids) then
    raise exception 'Invalid rooms';
  end if;

  -- Serialize submissions so concurrent availability checks cannot double book.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('ppkasn.booking.create', 0));
  if exists (
    select 1 from public.room_bookings b
    where b.status = 'confirmed' and b.room_ids && selected_ids
      and left(b.payload ->> 'bookingStart', 10) <= last_day::text
      and coalesce(nullif(left(b.payload ->> 'bookingEnd', 10), ''), left(b.payload ->> 'bookingStart', 10)) >= first_day::text
      and coalesce(nullif(b.payload ->> 'startTime', ''), '00:00') < last_time::text
      and coalesce(nullif(b.payload ->> 'endTime', ''), '23:59') > first_time::text
  ) then raise exception 'Booking conflict'; end if;

  insert into public.room_bookings (room_ids, payload, status, created_at)
  values (selected_ids, details - 'userId', 'confirmed', now()) returning id::text into result_id;
  return result_id;
end;
$$;
revoke all on function public.create_validated_booking(jsonb) from public, anon, authenticated;
grant execute on function public.create_validated_booking(jsonb) to service_role;

commit;

-- Set admin permissions separately, using the actual user's ID/email:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"cms_role":"admin"}'::jsonb
-- where id = '<verified-admin-user-id>'::uuid;
-- The user must sign in again to receive the updated JWT claim.
