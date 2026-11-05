-- SARA INTARCH independent backend (Supabase)
-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in (
    'Project','Service','SiteContent','SiteDraft','ContactMessage',
    'MediaAsset','StudioProfile','WatermarkAsset','WatermarkSettings'
  )),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_records_entity_idx on public.app_records(entity);
create index if not exists app_records_updated_idx on public.app_records(updated_at desc);

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.app_records enable row level security;
drop policy if exists "Public can read published site data" on public.app_records;
create policy "Public can read published site data" on public.app_records
for select to anon, authenticated
using (
  entity in ('Project','Service','SiteContent')
  and coalesce((data ->> 'published')::boolean, false) = true
  or public.is_site_admin()
);
drop policy if exists "Admins manage site records" on public.app_records;
create policy "Admins manage site records" on public.app_records
for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
drop policy if exists "Visitors can send contact messages" on public.app_records;
create policy "Visitors can send contact messages" on public.app_records
for insert to anon, authenticated
with check (entity = 'ContactMessage');

insert into storage.buckets (id, name, public, file_size_limit)
values ('site-media', 'site-media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-media');
drop policy if exists "Admins upload site media" on storage.objects;
create policy "Admins upload site media" on storage.objects
for insert to authenticated with check (bucket_id = 'site-media' and public.is_site_admin());
drop policy if exists "Admins update site media" on storage.objects;
create policy "Admins update site media" on storage.objects
for update to authenticated using (bucket_id = 'site-media' and public.is_site_admin())
with check (bucket_id = 'site-media' and public.is_site_admin());
drop policy if exists "Admins delete site media" on storage.objects;
create policy "Admins delete site media" on storage.objects
for delete to authenticated using (bucket_id = 'site-media' and public.is_site_admin());

-- After creating the owner's account in Authentication > Users, promote it:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where email = 'OWNER_EMAIL_HERE';


insert into storage.buckets (id, name, public, file_size_limit)
values ('site-private', 'site-private', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;
drop policy if exists "Admins manage private originals" on storage.objects;
create policy "Admins manage private originals" on storage.objects
for all to authenticated using (bucket_id = 'site-private' and public.is_site_admin())
with check (bucket_id = 'site-private' and public.is_site_admin());
