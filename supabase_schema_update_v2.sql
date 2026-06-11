-- Add candidate_emails to assessments
ALTER TABLE public.assessments ADD COLUMN candidate_emails text;

-- Make user_id nullable in submissions to allow guest taking
ALTER TABLE public.submissions ALTER COLUMN user_id DROP NOT NULL;

-- Add candidate_email to submissions to track who submitted it if user_id is null
ALTER TABLE public.submissions ADD COLUMN candidate_email text;

-- Update RLS to allow anyone to insert submissions (for guests)
DROP POLICY IF EXISTS "Interns can insert submissions." ON public.submissions;
CREATE POLICY "Anyone can insert submissions." ON public.submissions FOR INSERT WITH CHECK (true);
