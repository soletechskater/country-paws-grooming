-- Country Paws Supabase schema
create extension if not exists pgcrypto;
create table if not exists public.services (id text primary key, name text not null, description text, duration_minutes integer not null default 90, active boolean not null default true);
create table if not exists public.availability (id uuid primary key default gen_random_uuid(), date date not null, start_time time not null, end_time time not null, is_available boolean not null default true, unique(date,start_time));
create table if not exists public.appointments (id uuid primary key default gen_random_uuid(), service_id text references public.services(id), appointment_date date not null, start_time time not null, customer_name text not null, customer_email text not null, customer_phone text not null, dog_name text not null, notes text, status text not null default 'requested' check(status in ('requested','confirmed','cancelled','completed')), created_at timestamptz not null default now(), unique(appointment_date,start_time));
create table if not exists public.reviews (id uuid primary key default gen_random_uuid(), name text not null, body text not null, approved boolean not null default false, created_at timestamptz not null default now());
insert into public.services(id,name,description) values ('full-groom','Full Groom','Bath, cut, drying and styling tailored to their coat.'),('bath-brush','Bath & Brush','A refreshing wash, blow-dry and thorough brush-out.'),('nail-trim','Nail Trim','Quick, calm nail care for nervous paws too.'),('de-shedding','De-shedding','Extra coat care for seasonal undercoat buildup.'),('senior-care','Senior Dog Care','Patient sessions designed around older dogs.'),('gentle-handling','Gentle Handling','A calm approach for sensitive and first-time pups.') on conflict (id) do nothing;
alter table public.services enable row level security; alter table public.availability enable row level security; alter table public.appointments enable row level security; alter table public.reviews enable row level security;
create policy "public can view active services" on public.services for select using (active=true);
create policy "public can view available slots" on public.availability for select using (is_available=true and date >= current_date);
create policy "anyone can request appointment" on public.appointments for insert with check (status='requested');
create policy "anyone can submit review" on public.reviews for insert with check (approved=false);
create policy "public can view approved reviews" on public.reviews for select using (approved=true);
