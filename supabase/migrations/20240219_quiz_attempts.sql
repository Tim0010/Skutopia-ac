
-- Create quiz_attempts table to track user quiz results
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  answers JSONB, -- Stores the selected answers by the user
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admin to view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Update the column definition in the questions table to match what we're using
ALTER TABLE public.questions RENAME COLUMN question_text TO text;

-- Add index for faster queries
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts (quiz_id);
