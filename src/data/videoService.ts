import { supabase } from '../lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// --- Type Definitions ---

export interface Video {
    id: string; // UUID
    title: string;
    grade: string;
    subject: string;
    topic: string;
    video_url: string;
    thumbnail_url?: string; // Add optional thumbnail URL field
    uploaded_by: string | null; // UUID of user or null
    created_at: string;
}

export interface VideoLike {
    id: string; // UUID
    user_id: string; // UUID
    video_id: string; // UUID
    created_at: string;
}

export interface VideoComment {
    id: string; // UUID
    user_id: string; // UUID - Consider joining to get user name/avatar later
    video_id: string; // UUID
    comment: string;
    created_at: string;
    // Add user details if joining
    users?: { name: string; avatar_url?: string } | null; 
}

export interface VideoProgress {
    id: string; // UUID
    user_id: string; // UUID
    video_id: string; // UUID
    watched_seconds: number;
    last_updated: string;
}

// --- API Functions ---

/**
 * Fetches videos based on optional filters.
 */
export async function fetchVideos(
    grade?: string | null,
    subject?: string | null,
    topic?: string | null
): Promise<Video[]> {
    let query = supabase.from('videos').select('*').order('created_at', { ascending: false });

    if (grade) {
        query = query.eq('grade', grade);
    }
    if (subject) {
        query = query.eq('subject', subject);
    }
    if (topic) {
        query = query.eq('topic', topic);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
    return data || [];
}

/**
 * Fetches the like count for a specific video.
 */
export async function fetchLikeCount(videoId: string): Promise<number> {
    const { count, error } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);

    if (error) {
        console.error('Error fetching like count:', error);
        // Return 0 on error, or handle differently if needed
        return 0; 
    }
    return count ?? 0;
}

/**
 * Checks if a specific user has liked a specific video.
 */
export async function fetchUserLikeStatus(userId: string, videoId: string): Promise<boolean> {
     if (!userId) return false; // Cannot check status if no user logged in
    const { data, error } = await supabase
        .from('video_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle(); // Check if a record exists

    if (error) {
        console.error('Error fetching user like status:', error);
        return false; // Assume not liked on error
    }
    return !!data; // Return true if a record exists, false otherwise
}


/**
 * Adds a like for a video by a user.
 */
export async function likeVideo(userId: string, videoId: string): Promise<void> {
    const { error } = await supabase
        .from('video_likes')
        .insert([{ user_id: userId, video_id: videoId }]);

    if (error) {
        // Don't throw error for unique constraint violation (already liked)
        if (error.code === '23505') { 
             console.log('User already liked this video.');
        } else {
            console.error('Error liking video:', error);
            throw error;
        }
    }
}

/**
 * Removes a like for a video by a user.
 */
export async function unlikeVideo(userId: string, videoId: string): Promise<void> {
    const { error } = await supabase
        .from('video_likes')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', videoId);

    if (error) {
        console.error('Error unliking video:', error);
        throw error;
    }
}


/**
 * Fetches comments for a specific video, potentially joining user info.
 */
export async function fetchComments(videoId: string): Promise<VideoComment[]> {
    // Adjust the select query if you have a 'profiles' or 'users' table with names/avatars
     const { data, error } = await supabase
        .from('video_comments')
        .select('*') // Fetch all columns for now
        // Example join (if you have a profiles table linked to auth.users):
        // .select('*, profiles(full_name, avatar_url)') 
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
    return data || [];
}

/**
 * Adds a comment to a video.
 */
export async function addComment(userId: string, videoId: string, comment: string): Promise<VideoComment> {
    const { data, error } = await supabase
        .from('video_comments')
        .insert([{ user_id: userId, video_id: videoId, comment: comment }])
        .select() // Select the newly inserted row
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
     if (!data) {
        throw new Error("Failed to add comment, no data returned.");
    }
    // Ideally, fetch user info here too if needed immediately
    return data;
}


/**
 * Fetches video progress for a user and video.
 */
export async function fetchVideoProgress(userId: string, videoId: string): Promise<VideoProgress | null> {
    if (!userId) return null; // No progress if no user
    
    const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle(); // Use maybeSingle as progress might not exist yet

    if (error) {
        console.error('Error fetching video progress:', error);
        // Decide how to handle: return null, throw error?
        return null; 
    }
    return data;
}


/**
 * Updates or inserts video progress for a user.
 */
export async function updateVideoProgress(userId: string, videoId: string, watchedSeconds: number): Promise<void> {
     if (!userId) return; // Don't update if no user

    const { error } = await supabase
        .from('video_progress')
        .upsert(
            { 
                user_id: userId, 
                video_id: videoId, 
                watched_seconds: Math.round(watchedSeconds), // Store as integer
                last_updated: new Date().toISOString() // Update timestamp
            },
            { onConflict: 'user_id, video_id' } // Specify conflict columns for upsert
        );

    if (error) {
        console.error('Error updating video progress:', error);
        // Don't throw, as this might happen frequently in background
    }
}

// --- Helper Functions ---

/**
 * Fetches distinct values for filter dropdowns.
 * Example for fetching distinct grades. Adapt for subjects, topics.
 */
export async function fetchDistinctGrades(): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_distinct_grades');

    if (error) {
        console.error('Error fetching distinct grades:', error);
        return [];
    }
    // Assuming the RPC returns an array of objects like [{grade: '10'}, {grade: '11'}]
    return data ? data.map((item: any) => item.grade) : []; 
}

/**
 * Fetches distinct subjects (optionally filtered by grade).
 */
export async function fetchDistinctSubjects(grade?: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_distinct_subjects', { p_grade: grade });

    if (error) {
        console.error('Error fetching distinct subjects:', error);
        return [];
    }
    // Assuming the RPC returns an array of objects like [{subject: 'Math'}, {subject: 'Science'}]
    return data ? data.map((item: any) => item.subject) : []; 
}

/**
 * Fetches distinct topics (optionally filtered by grade and subject).
 */
export async function fetchDistinctTopics(grade?: string, subject?: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_distinct_topics', { p_grade: grade, p_subject: subject });

    if (error) {
        console.error('Error fetching distinct topics:', error);
        return [];
    }
    // Assuming the RPC returns an array of objects like [{topic: 'Algebra'}, {topic: 'Biology'}]
    return data ? data.map((item: any) => item.topic) : []; 
}
