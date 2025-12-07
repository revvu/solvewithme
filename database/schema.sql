-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Problem Nodes Table
create table if not exists problem_nodes (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references problem_nodes(id),
  content jsonb not null, -- Stores text and/or image_url
  hidden_solution text not null,
  hidden_answer text,
  target_insight text,
  generated_by text check (generated_by in ('user_upload', 'llm_subproblem')),
  status text check (status in ('active', 'solved', 'aborted')) default 'active',
  created_at timestamp with time zone default now()
);

-- Attempts Table
create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  problem_node_id uuid references problem_nodes(id) not null,
  user_work jsonb, -- Stores array of image URLs
  user_text text,
  timestamp timestamp with time zone default now()
);
