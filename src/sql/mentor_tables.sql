-- Create mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    specialization TEXT,
    bio TEXT,
    subjects TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    availability TEXT,
    sessions_completed INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor education table
CREATE TABLE IF NOT EXISTS public.mentor_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor experience table
CREATE TABLE IF NOT EXISTS public.mentor_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    organization TEXT NOT NULL,
    period TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor resources table
CREATE TABLE IF NOT EXISTS public.mentor_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('video', 'pdf', 'practice', 'book')),
    url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor bookings table
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor feedback table
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to calculate mentor's average rating
CREATE OR REPLACE FUNCTION calculate_mentor_rating(mentor_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM public.mentor_feedback
    WHERE mentor_id = mentor_id_param;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for mentors table
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors are viewable by everyone" 
ON public.mentors FOR SELECT 
USING (true);

CREATE POLICY "Mentors can only be inserted by admins" 
ON public.mentors FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentors can only be updated by admins" 
ON public.mentors FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentors can only be deleted by admins" 
ON public.mentors FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create RLS policies for mentor_education table
ALTER TABLE public.mentor_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor education is viewable by everyone" 
ON public.mentor_education FOR SELECT 
USING (true);

CREATE POLICY "Mentor education can only be inserted by admins" 
ON public.mentor_education FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor education can only be updated by admins" 
ON public.mentor_education FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor education can only be deleted by admins" 
ON public.mentor_education FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create RLS policies for mentor_experience table
ALTER TABLE public.mentor_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor experience is viewable by everyone" 
ON public.mentor_experience FOR SELECT 
USING (true);

CREATE POLICY "Mentor experience can only be inserted by admins" 
ON public.mentor_experience FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor experience can only be updated by admins" 
ON public.mentor_experience FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor experience can only be deleted by admins" 
ON public.mentor_experience FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create RLS policies for mentor_resources table
ALTER TABLE public.mentor_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor resources are viewable by everyone" 
ON public.mentor_resources FOR SELECT 
USING (true);

CREATE POLICY "Mentor resources can only be inserted by admins" 
ON public.mentor_resources FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor resources can only be updated by admins" 
ON public.mentor_resources FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Mentor resources can only be deleted by admins" 
ON public.mentor_resources FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create RLS policies for mentor_bookings table
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
ON public.mentor_bookings FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view bookings for their sessions" 
ON public.mentor_bookings FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mentors
    WHERE mentors.id = mentor_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'mentor'
    )
  )
);

CREATE POLICY "Admins can view all bookings" 
ON public.mentor_bookings FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can create bookings" 
ON public.mentor_bookings FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.mentor_bookings FOR UPDATE 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mentor_feedback table
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor feedback is viewable by everyone" 
ON public.mentor_feedback FOR SELECT 
USING (true);

CREATE POLICY "Users can create feedback for sessions they attended" 
ON public.mentor_feedback FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.mentor_bookings
    WHERE mentor_bookings.user_id = auth.uid() 
    AND mentor_bookings.mentor_id = mentor_id
    AND mentor_bookings.status = 'completed'
  )
);

CREATE POLICY "Users can update their own feedback" 
ON public.mentor_feedback FOR UPDATE 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Insert sample data for mentors
INSERT INTO public.mentors (name, avatar_url, specialization, bio, subjects, hourly_rate, currency, availability)
VALUES
  ('Dr. Sarah Johnson', 'https://i.pravatar.cc/150?u=mentor1', 'Mathematics', 
   'Dr. Sarah Johnson holds a PhD in Mathematics with over 10 years of teaching experience. She specializes in calculus, algebra, and mathematical problem-solving.',
   ARRAY['Calculus', 'Algebra', 'Trigonometry', 'Statistics', 'Geometry'], 25, 'USD', 'Weekdays evenings, Weekends'),
  
  ('Prof. David Mukasa', 'https://i.pravatar.cc/150?u=mentor2', 'Physics',
   'Professor David Mukasa is a distinguished physicist with extensive teaching experience at both secondary and university levels.',
   ARRAY['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Modern Physics'], 30, 'USD', 'Flexible schedule'),
  
  ('Ms. Esther Banda', 'https://i.pravatar.cc/150?u=mentor3', 'Chemistry',
   'Esther Banda is a passionate chemistry educator with a remarkable ability to make complex chemical concepts accessible to students of all levels.',
   ARRAY['Organic Chemistry', 'Inorganic Chemistry', 'Biochemistry', 'Analytical Chemistry'], 20, 'USD', 'Weekdays and Saturday mornings');

-- Insert sample education data
INSERT INTO public.mentor_education (mentor_id, degree, institution, year)
SELECT 
  id, 'PhD in Mathematics', 'University of Zambia', '2012'
FROM public.mentors 
WHERE name = 'Dr. Sarah Johnson';

INSERT INTO public.mentor_education (mentor_id, degree, institution, year)
SELECT 
  id, 'MSc in Applied Mathematics', 'University of Cape Town', '2008'
FROM public.mentors 
WHERE name = 'Dr. Sarah Johnson';

INSERT INTO public.mentor_education (mentor_id, degree, institution, year)
SELECT 
  id, 'PhD in Theoretical Physics', 'University of Witwatersrand', '2010'
FROM public.mentors 
WHERE name = 'Prof. David Mukasa';

INSERT INTO public.mentor_education (mentor_id, degree, institution, year)
SELECT 
  id, 'MSc in Chemistry', 'University of Botswana', '2013'
FROM public.mentors 
WHERE name = 'Ms. Esther Banda';

-- Insert sample experience data
INSERT INTO public.mentor_experience (mentor_id, position, organization, period)
SELECT 
  id, 'Senior Mathematics Lecturer', 'Copperbelt University', '2014 - Present'
FROM public.mentors 
WHERE name = 'Dr. Sarah Johnson';

INSERT INTO public.mentor_experience (mentor_id, position, organization, period)
SELECT 
  id, 'Physics Professor', 'University of Zambia', '2015 - Present'
FROM public.mentors 
WHERE name = 'Prof. David Mukasa';

INSERT INTO public.mentor_experience (mentor_id, position, organization, period)
SELECT 
  id, 'Chemistry Lecturer', 'Evelyn Hone College', '2014 - Present'
FROM public.mentors 
WHERE name = 'Ms. Esther Banda';

-- Insert sample resources
INSERT INTO public.mentor_resources (mentor_id, title, description, type, url, is_premium)
SELECT 
  id, 'Introduction to Calculus', 'A comprehensive video introduction to calculus concepts', 'video', 'https://example.com/videos/calculus-intro', true
FROM public.mentors 
WHERE name = 'Dr. Sarah Johnson';

INSERT INTO public.mentor_resources (mentor_id, title, description, type, url, is_premium)
SELECT 
  id, 'Calculus Study Notes', 'Comprehensive notes on key calculus topics', 'pdf', 'https://example.com/pdfs/calculus-notes', false
FROM public.mentors 
WHERE name = 'Dr. Sarah Johnson';

INSERT INTO public.mentor_resources (mentor_id, title, description, type, url, is_premium)
SELECT 
  id, 'Physics Problem Set', 'Practice problems for mechanics and electromagnetism', 'practice', 'https://example.com/practice/physics', true
FROM public.mentors 
WHERE name = 'Prof. David Mukasa';

INSERT INTO public.mentor_resources (mentor_id, title, description, type, url, is_premium)
SELECT 
  id, 'Chemistry Fundamentals', 'Video series on basic chemistry concepts', 'video', 'https://example.com/videos/chemistry', false
FROM public.mentors 
WHERE name = 'Ms. Esther Banda';
