-- Create quiz_attempts table to store user quiz results
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL, -- Link to the specific quiz if available
    grade TEXT, -- e.g., '8', 'university'
    subject TEXT, -- e.g., 'Mathematics'
    topic TEXT, -- e.g., 'Angles'
    score_percentage NUMERIC(5, 2), -- Score as a percentage (e.g., 53.00)
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Optional: Store detailed answers if needed for review later
    -- answers_data JSONB 
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- Enable Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Users can insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts" 
    ON public.quiz_attempts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own attempts
CREATE POLICY "Users can read their own quiz attempts" 
    ON public.quiz_attempts
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Optional: Allow users to delete their own attempts (if needed)
-- CREATE POLICY "Users can delete their own quiz attempts"
--     ON public.quiz_attempts
--     FOR DELETE
--     USING (auth.uid() = user_id);

-- Backend roles should bypass RLS (ensure your service_role key is used for admin actions)
-- GRANT ALL ON TABLE public.quiz_attempts TO service_role; 