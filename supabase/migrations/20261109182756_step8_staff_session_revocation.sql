-- Verified identity alone does not prove that a still-unexpired JWT session
-- survived logout. Called only by trusted server code after Auth verification.
begin;
create or replace function public.crm_session_is_active(p_session_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.sessions s
    join auth.users u on u.id = s.user_id
    where s.id = p_session_id and s.user_id = p_user_id
      and (s.not_after is null or s.not_after > now())
      and (u.banned_until is null or u.banned_until <= now())
      and u.deleted_at is null
  );
$$;
revoke all on function public.crm_session_is_active(uuid, uuid) from public, anon, authenticated;
grant execute on function public.crm_session_is_active(uuid, uuid) to service_role;
commit;
