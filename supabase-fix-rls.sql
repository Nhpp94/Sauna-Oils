-- Fix infinite recursion in studio_members RLS policies.
-- The problem: policies that query studio_members to check membership
-- trigger those same policies, causing infinite recursion.
-- The fix: security definer functions bypass RLS when they run,
-- breaking the loop.

-- ─── Helper functions (bypass RLS via security definer) ───────────────────────

create or replace function public.get_my_studio_ids()
returns setof uuid
language sql security definer stable
as $$
  select studio_id from public.studio_members where user_id = auth.uid();
$$;

create or replace function public.is_studio_admin(studio_uuid uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.studio_members
    where studio_id = studio_uuid
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- ─── Drop the recursive policies ─────────────────────────────────────────────

drop policy if exists "studio members read" on public.studios;
drop policy if exists "members read" on public.studio_members;
drop policy if exists "admin manage members" on public.studio_members;
drop policy if exists "studio oils read" on public.studio_oils;
drop policy if exists "studio oils admin write" on public.studio_oils;
drop policy if exists "studio sessions read" on public.studio_sessions;
drop policy if exists "studio sessions admin write" on public.studio_sessions;

-- ─── Recreate policies using the helper functions ─────────────────────────────

create policy "studio members read" on public.studios for select
  using (id = any(select public.get_my_studio_ids()));

create policy "members read" on public.studio_members for select
  using (studio_id = any(select public.get_my_studio_ids()));

create policy "admin manage members" on public.studio_members for delete
  using (public.is_studio_admin(studio_id));

create policy "studio oils read" on public.studio_oils for select
  using (studio_id = any(select public.get_my_studio_ids()));

create policy "studio oils admin write" on public.studio_oils for all
  using (public.is_studio_admin(studio_id));

create policy "studio sessions read" on public.studio_sessions for select
  using (studio_id = any(select public.get_my_studio_ids()));

create policy "studio sessions admin write" on public.studio_sessions for all
  using (public.is_studio_admin(studio_id));
