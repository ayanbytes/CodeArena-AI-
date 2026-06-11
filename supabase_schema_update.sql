-- Question Bank Table
create table public.question_bank (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  test_cases jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.question_bank enable row level security;
create policy "Question bank viewable by everyone." on public.question_bank for select using (true);

-- Seed Initial Questions
insert into public.question_bank (title, description, difficulty, test_cases) values
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
  'Easy',
  '[{"input": "2 7 11 15\n9", "expected_output": "0 1", "is_hidden": false}, {"input": "3 2 4\n6", "expected_output": "1 2", "is_hidden": true}]'::jsonb
),
(
  'Reverse Linked List',
  'Given the head of a singly linked list, reverse the list, and return the reversed list. (For this assessment, assume the input is an array of integers and you must return the reversed array).',
  'Medium',
  '[{"input": "1 2 3 4 5", "expected_output": "5 4 3 2 1", "is_hidden": false}, {"input": "1 2", "expected_output": "2 1", "is_hidden": false}]'::jsonb
),
(
  'Merge K Sorted Lists',
  'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. (For this assessment, input is k followed by k lines of sorted arrays, output should be single sorted array).',
  'Hard',
  '[{"input": "3\n1 4 5\n1 3 4\n2 6", "expected_output": "1 1 2 3 4 4 5 6", "is_hidden": false}]'::jsonb
);
