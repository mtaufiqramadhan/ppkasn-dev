-- Public read-only schedule projection. No borrower, phone, notes or roster data.
begin;
create or replace function public.get_public_booking_schedule(start_day date, end_day date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if start_day is null or end_day is null or end_day < start_day or end_day - start_day > 120 then
    raise exception 'Invalid schedule range';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id::text,
    'room_ids', b.room_ids,
    'created_at', b.created_at,
    'status', b.status,
    'booking_start', b.payload ->> 'bookingStart',
    'booking_end', b.payload ->> 'bookingEnd',
    'start_time', b.payload ->> 'startTime',
    'end_time', b.payload ->> 'endTime'
  )), '[]'::jsonb) into result
  from (
    select id, room_ids, created_at, status, payload
    from public.room_bookings
    where status = 'confirmed'
      and left(payload ->> 'bookingStart', 10) <= end_day::text
      and coalesce(nullif(left(payload ->> 'bookingEnd', 10), ''), left(payload ->> 'bookingStart', 10)) >= start_day::text
    order by id
    limit 5000
  ) b;
  if jsonb_array_length(result) >= 5000 then raise exception 'Schedule range too large'; end if;
  return result;
end;
$$;
revoke all on function public.get_public_booking_schedule(date, date) from public;
grant execute on function public.get_public_booking_schedule(date, date) to anon, authenticated;
commit;
