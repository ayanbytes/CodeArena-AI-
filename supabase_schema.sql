-- CodeArena AI Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (Extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null unique,
  full_name text,
  role text default 'intern' check (role in ('admin', 'intern')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assessments Table
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  duration_minutes integer not null default 60,
  created_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Questions Table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  title text not null,
  description text not null,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  question_type text default 'coding' check (question_type in ('coding', 'mcq', 'sql')),
  constraints text,
  input_format text,
  output_format text,
  starter_code jsonb, -- e.g., {"python": "def solve():\n  pass", "javascript": "function solve() {}"}
  test_cases jsonb, -- e.g., [{"input": "1 2", "expected_output": "3", "is_hidden": false}]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Submissions Table
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  question_id uuid references public.questions(id) not null,
  assessment_id uuid references public.assessments(id) not null,
  code text,
  language text,
  score numeric(5,2) default 0,
  ai_feedback text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  runtime_ms integer,
  memory_kb integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leaderboard Table
create table public.leaderboard (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  assessment_id uuid references public.assessments(id),
  total_score numeric(10,2) default 0,
  rank integer,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity Logs (Anti-cheating)
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  assessment_id uuid references public.assessments(id),
  action text not null, -- e.g., 'tab_switch', 'copy_paste', 'multiple_monitors'
  details jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) setup
alter table public.users enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.leaderboard enable row level security;
alter table public.activity_logs enable row level security;

-- Basic Policies (Can be refined later)
create policy "Public users are viewable by everyone." on public.users for select using (true);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

create policy "Assessments viewable by everyone." on public.assessments for select using (true);
create policy "Admins can insert assessments." on public.assessments for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "Questions viewable by everyone." on public.questions for select using (true);

create policy "Submissions viewable by owner and admin." on public.submissions for select using (
  auth.uid() = user_id or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Interns can insert submissions." on public.submissions for insert with check (auth.uid() = user_id);
