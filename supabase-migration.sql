-- ============================================================
-- Lead → Launch  |  Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. LEADS
create table if not exists leads (
  id                  text primary key,
  name                text not null,
  category            text not null,
  address             text not null,
  city                text not null,
  phone               text,
  whatsapp            text,
  email               text,
  website             text,
  rating              numeric(3,1),
  reviews_count       integer,
  lat                 double precision not null,
  lng                 double precision not null,
  photos_count        integer,
  years_in_business   integer,
  created_at          timestamptz default now()
);

-- 2. AUDITS
create table if not exists audits (
  id                        bigint generated always as identity primary key,
  lead_id                   text not null references leads(id) on delete cascade,
  pagespeed_score           integer not null default 0,
  has_website               boolean not null default false,
  mobile_friendly           boolean not null default false,
  https                     boolean not null default false,
  has_schema                boolean not null default false,
  load_time_ms              integer not null default 0,
  gaps                      text[] not null default '{}',
  biggest_gap               text not null default '',
  est_lost_revenue_per_month integer not null default 0,
  created_at                timestamptz default now(),
  unique (lead_id)
);

-- 3. PROMPTS
create table if not exists prompts (
  id          bigint generated always as identity primary key,
  lead_id     text not null references leads(id) on delete cascade,
  platform    text not null,
  prompt      text not null,
  created_at  timestamptz default now(),
  unique (lead_id, platform)
);

-- 4. OUTREACH DRAFTS
create table if not exists outreach_drafts (
  id             bigint generated always as identity primary key,
  lead_id        text not null references leads(id) on delete cascade,
  channel        text not null,   -- whatsapp | email | instagram
  language       text not null,   -- hinglish | english
  first_message  text not null,
  follow_up      text not null,
  created_at     timestamptz default now(),
  unique (lead_id, channel, language)
);
