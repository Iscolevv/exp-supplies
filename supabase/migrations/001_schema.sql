-- ============================================================
-- SupplyPortal Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- FORMS table
-- Stores form definitions created by the agency
-- ============================================================
create table if not exists forms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  category    text not null default 'General',
  fields      jsonb not null default '[]',   -- array of field definitions
  is_active   boolean not null default true,
  slug        text unique not null,          -- used in the public URL: /f/{slug}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- SUBMISSIONS table
-- Every supplier form response lands here
-- ============================================================
create table if not exists submissions (
  id          uuid primary key default uuid_generate_v4(),
  form_id     uuid not null references forms(id) on delete cascade,
  data        jsonb not null default '{}',   -- key/value of all field responses
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  notes       text,                          -- internal agency notes
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists submissions_form_id_idx on submissions(form_id);
create index if not exists submissions_status_idx  on submissions(status);
create index if not exists forms_slug_idx           on forms(slug);
create index if not exists forms_category_idx       on forms(category);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger forms_updated_at
  before update on forms
  for each row execute function update_updated_at();

create trigger submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- Forms are publicly readable (needed for the supplier form page)
-- Submissions: anyone can INSERT, only authenticated users can SELECT/UPDATE/DELETE
-- ============================================================
alter table forms       enable row level security;
alter table submissions enable row level security;

-- Forms: public read (so /f/[slug] works), authenticated write
create policy "Public can read active forms"
  on forms for select using (is_active = true);

create policy "Authenticated users manage forms"
  on forms for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Submissions: public insert (supplier fills form), authenticated read/update/delete
create policy "Anyone can submit"
  on submissions for insert with check (true);

create policy "Authenticated users read submissions"
  on submissions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users update submissions"
  on submissions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users delete submissions"
  on submissions for delete
  using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — sample forms so the admin portal has content
-- ============================================================
insert into forms (name, description, category, slug, fields) values
(
  'General Supplier Registration',
  'Register your business as an approved supplier. Fill in your company details and the products or services you offer.',
  'General',
  'general-registration',
  '[
    {"id":"f1","label":"Company name","type":"text","required":true,"placeholder":"e.g. Acme Supplies Ltd"},
    {"id":"f2","label":"Contact person","type":"text","required":true,"placeholder":"Full name"},
    {"id":"f3","label":"Email address","type":"email","required":true,"placeholder":"you@company.com"},
    {"id":"f4","label":"Phone number","type":"tel","required":true,"placeholder":"+254 7XX XXX XXX"},
    {"id":"f5","label":"Business registration no.","type":"text","required":false,"placeholder":"Optional"},
    {"id":"f6","label":"Supply category","type":"select","required":true,"options":["Tents & Shelter","Electronics & AV","Food & Catering","Transport & Logistics","Furniture & Decor","Security","Printing","Other"]},
    {"id":"f7","label":"Products / services offered","type":"textarea","required":true,"placeholder":"Describe what you supply in detail..."},
    {"id":"f8","label":"County / location","type":"text","required":true,"placeholder":"e.g. Nairobi, Mombasa, Kisumu"}
  ]'
),
(
  'Tent & Shelter Suppliers',
  'For businesses that supply tents, marquees, canopies, and temporary shelters for events.',
  'Tents & Shelter',
  'tent-shelter-suppliers',
  '[
    {"id":"f1","label":"Company name","type":"text","required":true,"placeholder":"e.g. Acme Tents Ltd"},
    {"id":"f2","label":"Contact person","type":"text","required":true,"placeholder":"Full name"},
    {"id":"f3","label":"Email address","type":"email","required":true,"placeholder":"you@company.com"},
    {"id":"f4","label":"Phone number","type":"tel","required":true,"placeholder":"+254 7XX XXX XXX"},
    {"id":"f5","label":"Types of tents supplied","type":"select","required":true,"options":["Frame tents","Marquee","Stretch tents","Dome tents","Canvas tents","All types"]},
    {"id":"f6","label":"Maximum capacity (sqm or pax)","type":"text","required":true,"placeholder":"e.g. 500 sqm or 300 guests"},
    {"id":"f7","label":"Do you offer setup & takedown?","type":"select","required":true,"options":["Yes — included","Yes — at extra cost","No"]},
    {"id":"f8","label":"Counties you operate in","type":"text","required":true,"placeholder":"e.g. Nairobi, Machakos, Kajiado"},
    {"id":"f9","label":"Additional notes","type":"textarea","required":false,"placeholder":"Any other details..."}
  ]'
),
(
  'Electronics & AV Equipment',
  'For suppliers of projectors, PA systems, LED screens, generators, lighting rigs and AV equipment.',
  'Electronics & AV',
  'electronics-av',
  '[
    {"id":"f1","label":"Company name","type":"text","required":true,"placeholder":"e.g. Bright AV Kenya"},
    {"id":"f2","label":"Contact person","type":"text","required":true,"placeholder":"Full name"},
    {"id":"f3","label":"Email address","type":"email","required":true,"placeholder":"you@company.com"},
    {"id":"f4","label":"Phone number","type":"tel","required":true,"placeholder":"+254 7XX XXX XXX"},
    {"id":"f5","label":"Equipment categories","type":"select","required":true,"options":["PA & Sound systems","Projectors & Screens","LED walls","Generators","Stage lighting","All of the above","Other"]},
    {"id":"f6","label":"Do you offer technician support?","type":"select","required":true,"options":["Yes — on-site tech included","Yes — at extra cost","No"]},
    {"id":"f7","label":"Equipment list / catalogue","type":"textarea","required":true,"placeholder":"List your main equipment..."},
    {"id":"f8","label":"Counties you operate in","type":"text","required":true,"placeholder":"e.g. Nairobi, Mombasa"}
  ]'
);

-- Sample submissions
insert into submissions (form_id, data, status) 
select id, '{
  "Company name": "Mama Wanjiku Traders",
  "Contact person": "Grace Wanjiku",
  "Email address": "grace@mwtraders.co.ke",
  "Phone number": "+254 712 345 678",
  "Business registration no.": "BN/2021/45231",
  "Supply category": "Tents & Shelter",
  "Products / services offered": "Canvas tents, frame tents, marquee hire for events up to 500 guests",
  "County / location": "Nairobi"
}', 'pending' from forms where slug = 'general-registration';

insert into submissions (form_id, data, status)
select id, '{
  "Company name": "Nairobi Tech Hub",
  "Contact person": "Brian Ochieng",
  "Email address": "brian@nairobitehhub.co.ke",
  "Phone number": "+254 733 211 900",
  "Business registration no.": "BN/2019/12003",
  "Supply category": "Electronics & AV",
  "Products / services offered": "Projectors, PA systems, LED screens, laptops for hire",
  "County / location": "Nairobi"
}', 'approved' from forms where slug = 'general-registration';

insert into submissions (form_id, data, status)
select id, '{
  "Company name": "Savanna Logistics",
  "Contact person": "Fatuma Hassan",
  "Email address": "fatuma@savannalogi.co.ke",
  "Phone number": "+254 722 567 890",
  "Supply category": "Transport & Logistics",
  "Products / services offered": "Trucks, vans, cold chain transport across East Africa",
  "County / location": "Mombasa"
}', 'pending' from forms where slug = 'general-registration';

insert into submissions (form_id, data, status)
select id, '{
  "Company name": "Summit Tents Kenya",
  "Contact person": "Samuel Kariuki",
  "Email address": "samuel@summitkeny.co.ke",
  "Phone number": "+254 717 554 902",
  "Types of tents supplied": "All types",
  "Maximum capacity (sqm or pax)": "1000 sqm",
  "Do you offer setup & takedown?": "Yes — included",
  "Counties you operate in": "Nairobi, Thika, Machakos",
  "Additional notes": "Available 7 days a week"
}', 'approved' from forms where slug = 'tent-shelter-suppliers';
