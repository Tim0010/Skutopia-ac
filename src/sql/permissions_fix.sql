-- Fix for Row Level Security policies
-- This updates the policies to ensure proper access to the mentor tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mentors are viewable by everyone" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can be inserted by authenticated users" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can be updated by their owners" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can be deleted by their owners" ON public.mentors;

-- Enable Row Level Security
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- First, ensure mentors table has a user_id column before creating policies that use it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mentors' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.mentors ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Create proper RLS policies
-- 1. Allow anyone to view mentors
CREATE POLICY "Mentors are viewable by everyone" 
ON public.mentors FOR SELECT 
USING (true);

-- 2. Allow authenticated users to create mentors
CREATE POLICY "Mentors can be inserted by authenticated users" 
ON public.mentors FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own mentors
CREATE POLICY "Mentors can be updated by their owners" 
ON public.mentors FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own mentors
CREATE POLICY "Mentors can be deleted by their owners" 
ON public.mentors FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for related tables
-- Education records
DROP POLICY IF EXISTS "Education records are viewable by everyone" ON public.mentor_education;
DROP POLICY IF EXISTS "Education records can be managed by mentor owners" ON public.mentor_education;

ALTER TABLE public.mentor_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Education records are viewable by everyone" 
ON public.mentor_education FOR SELECT 
USING (true);

CREATE POLICY "Education records can be managed by mentor owners" 
ON public.mentor_education 
USING (
  EXISTS (
    SELECT 1 FROM public.mentors
    WHERE mentors.id = mentor_education.mentor_id
    AND mentors.user_id = auth.uid()
  )
);

-- Experience records
DROP POLICY IF EXISTS "Experience records are viewable by everyone" ON public.mentor_experience;
DROP POLICY IF EXISTS "Experience records can be managed by mentor owners" ON public.mentor_experience;

ALTER TABLE public.mentor_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experience records are viewable by everyone" 
ON public.mentor_experience FOR SELECT 
USING (true);

CREATE POLICY "Experience records can be managed by mentor owners" 
ON public.mentor_experience 
USING (
  EXISTS (
    SELECT 1 FROM public.mentors
    WHERE mentors.id = mentor_experience.mentor_id
    AND mentors.user_id = auth.uid()
  )
);

-- Resource records
DROP POLICY IF EXISTS "Resource records are viewable by everyone" ON public.mentor_resources;
DROP POLICY IF EXISTS "Resource records can be managed by mentor owners" ON public.mentor_resources;

ALTER TABLE public.mentor_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resource records are viewable by everyone" 
ON public.mentor_resources FOR SELECT 
USING (true);

CREATE POLICY "Resource records can be managed by mentor owners" 
ON public.mentor_resources 
USING (
  EXISTS (
    SELECT 1 FROM public.mentors
    WHERE mentors.id = mentor_resources.mentor_id
    AND mentors.user_id = auth.uid()
  )
);
