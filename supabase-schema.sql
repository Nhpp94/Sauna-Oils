-- ─── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- Auto-create profile row when a user signs up
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles(id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Creation tokens (gate who can create studios) ────────────────────────────
create table public.creation_tokens (
  token text primary key,
  used_at timestamptz,
  used_by uuid references public.profiles(id)
);

-- ─── Studios ─────────────────────────────────────────────────────────────────
create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  join_code text unique not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ─── Studio memberships ───────────────────────────────────────────────────────
create table public.studio_members (
  studio_id uuid references public.studios(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamptz default now(),
  primary key (studio_id, user_id)
);

-- ─── Studio oil catalog ───────────────────────────────────────────────────────
create table public.studio_oils (
  studio_id uuid references public.studios(id) on delete cascade,
  oil_id text not null,
  primary key (studio_id, oil_id)
);

-- ─── Studio pre-built sessions ────────────────────────────────────────────────
create table public.studio_sessions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  rounds jsonb not null,
  vibe text,
  time_of_day text,
  created_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.studios enable row level security;
alter table public.studio_members enable row level security;
alter table public.studio_oils enable row level security;
alter table public.studio_sessions enable row level security;
alter table public.creation_tokens enable row level security;

-- Profiles: users can read and update their own
create policy "own profile" on public.profiles for all using (auth.uid() = id);

-- Studios: readable by members, insertable by anyone (token validation is in app)
create policy "studio members read" on public.studios for select
  using (exists (select 1 from public.studio_members where studio_id = id and user_id = auth.uid()));
create policy "studio create" on public.studios for insert with check (auth.uid() = created_by);

-- Members: members can see the roster, anyone can insert themselves, admins can remove
create policy "members read" on public.studio_members for select
  using (exists (select 1 from public.studio_members m where m.studio_id = studio_id and m.user_id = auth.uid()));
create policy "members insert self" on public.studio_members for insert with check (auth.uid() = user_id);
create policy "admin manage members" on public.studio_members for delete
  using (exists (select 1 from public.studio_members m where m.studio_id = studio_id and m.user_id = auth.uid() and m.role = 'admin'));

-- Studio oils: members read, admins write
create policy "studio oils read" on public.studio_oils for select
  using (exists (select 1 from public.studio_members where studio_id = studio_id and user_id = auth.uid()));
create policy "studio oils admin write" on public.studio_oils for all
  using (exists (select 1 from public.studio_members where studio_id = studio_id and user_id = auth.uid() and role = 'admin'));

-- Studio sessions: members read, admins write
create policy "studio sessions read" on public.studio_sessions for select
  using (exists (select 1 from public.studio_members where studio_id = studio_id and user_id = auth.uid()));
create policy "studio sessions admin write" on public.studio_sessions for all
  using (exists (select 1 from public.studio_members where studio_id = studio_id and user_id = auth.uid() and role = 'admin'));

-- Creation tokens: anyone authenticated can read (to verify), app handles the logic
create policy "tokens read" on public.creation_tokens for select using (true);
create policy "tokens update" on public.creation_tokens for update using (auth.uid() is not null);

-- ─── Issue your first creation token ─────────────────────────────────────────
-- Run this separately after the schema is created, replacing the token value:
-- insert into public.creation_tokens(token) values ('YOUR-SECRET-TOKEN');
