-- Add new columns to existing user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS current_school TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;
END $$;

-- Create storage policies for avatars bucket if they don't exist
DO $$
BEGIN
    -- Check if the select policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'avatars');
    END IF;

    -- Check if the insert policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own avatar'
    ) THEN
        CREATE POLICY "Users can upload their own avatar"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'avatars' AND
                auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;

    -- Check if the update policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own avatar'
    ) THEN
        CREATE POLICY "Users can update their own avatar"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'avatars' AND
                auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;

    -- Check if the delete policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own avatar'
    ) THEN
        CREATE POLICY "Users can delete their own avatar"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'avatars' AND
                auth.uid()::text = (storage.foldername(name))[1]
            );
    END IF;
END $$; 