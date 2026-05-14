-- Studio Library + Kit apply script
-- Run this after supabase-fix-rls.sql has created:
-- public.get_my_studio_ids()
-- public.is_studio_admin(uuid)

create unique index if not exists one_paid_studio_per_creator
on public.studios(created_by)
where created_via = 'paid';

drop policy if exists "studio admins update studios" on public.studios;
create policy "studio admins update studios" on public.studios for update
  using (public.is_studio_admin(id))
  with check (public.is_studio_admin(id));

create or replace function public.promote_studio_member(target_studio_id uuid, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_studio_admin(target_studio_id) then
    raise exception 'Only studio admins can promote members';
  end if;

  update public.studio_members
  set role = 'admin'
  where studio_id = target_studio_id
    and user_id = target_user_id;

  if not found then
    raise exception 'Studio member not found';
  end if;
end;
$$;

create table if not exists public.studio_custom_oils (
  id text primary key,
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  latin_name text not null default '',
  category text not null,
  note text not null check (note in ('top', 'middle', 'base')),
  intensity integer not null check (intensity in (1, 2, 3)),
  vibes text[] not null default '{}',
  time_of_day text[] not null default '{}',
  body_impact text not null default '',
  sauna_note text not null default '',
  benefits text[] not null default '{}',
  pairs_with text[] not null default '{}',
  precautions text[] not null default '{}',
  color text not null,
  emoji text not null default '*',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.studio_incense (
  studio_id uuid not null references public.studios(id) on delete cascade,
  incense_id text not null,
  primary key (studio_id, incense_id)
);

create table if not exists public.studio_custom_incense (
  id text primary key,
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  latin_name text,
  origin text not null default '',
  form text not null check (form in ('wood', 'resin', 'herb', 'stick', 'cone')),
  vibes text[] not null default '{}',
  time_of_day text[] not null default '{}',
  description text not null default '',
  sauna_note text not null default '',
  benefits text[] not null default '{}',
  precautions text[] not null default '{}',
  color text not null,
  emoji text not null default '*',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.studio_custom_blends (
  id text primary key,
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  description text not null default '',
  sauna_note text not null default '',
  oils jsonb not null default '[]'::jsonb,
  vibes text[] not null default '{}',
  time_of_day text[] not null default '{}',
  benefits text[] not null default '{}',
  precautions text[] not null default '{}',
  color text not null,
  emoji text not null default '*',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.studio_blends (
  studio_id uuid not null references public.studios(id) on delete cascade,
  blend_id text not null,
  primary key (studio_id, blend_id)
);

alter table public.studio_custom_oils enable row level security;
alter table public.studio_incense enable row level security;
alter table public.studio_custom_incense enable row level security;
alter table public.studio_custom_blends enable row level security;
alter table public.studio_blends enable row level security;

drop policy if exists "studio custom oils read" on public.studio_custom_oils;
drop policy if exists "studio custom oils admin write" on public.studio_custom_oils;
drop policy if exists "studio incense read" on public.studio_incense;
drop policy if exists "studio incense admin write" on public.studio_incense;
drop policy if exists "studio custom incense read" on public.studio_custom_incense;
drop policy if exists "studio custom incense admin write" on public.studio_custom_incense;
drop policy if exists "studio custom blends read" on public.studio_custom_blends;
drop policy if exists "studio custom blends admin write" on public.studio_custom_blends;
drop policy if exists "studio blends read" on public.studio_blends;
drop policy if exists "studio blends admin write" on public.studio_blends;

create policy "studio custom oils read" on public.studio_custom_oils for select
  using (studio_id in (select * from public.get_my_studio_ids()));

create policy "studio custom oils admin write" on public.studio_custom_oils for all
  using (public.is_studio_admin(studio_id))
  with check (public.is_studio_admin(studio_id));

create policy "studio incense read" on public.studio_incense for select
  using (studio_id in (select * from public.get_my_studio_ids()));

create policy "studio incense admin write" on public.studio_incense for all
  using (public.is_studio_admin(studio_id))
  with check (public.is_studio_admin(studio_id));

create policy "studio custom incense read" on public.studio_custom_incense for select
  using (studio_id in (select * from public.get_my_studio_ids()));

create policy "studio custom incense admin write" on public.studio_custom_incense for all
  using (public.is_studio_admin(studio_id))
  with check (public.is_studio_admin(studio_id));

create policy "studio custom blends read" on public.studio_custom_blends for select
  using (studio_id in (select * from public.get_my_studio_ids()));

create policy "studio custom blends admin write" on public.studio_custom_blends for all
  using (public.is_studio_admin(studio_id))
  with check (public.is_studio_admin(studio_id));

create policy "studio blends read" on public.studio_blends for select
  using (studio_id in (select * from public.get_my_studio_ids()));

create policy "studio blends admin write" on public.studio_blends for all
  using (public.is_studio_admin(studio_id))
  with check (public.is_studio_admin(studio_id));

notify pgrst, 'reload schema';
