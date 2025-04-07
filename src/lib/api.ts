import { supabase } from './supabaseClient'; // Adjust path if needed
import { User } from '@supabase/supabase-js';

// Function to ensure a user exists in the users table
async function ensureUserExists(userId: string, userInfo?: { name?: string, email?: string, avatarUrl?: string }) {
  // First check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors

  if (checkError) {
    console.error("Error checking if user exists:", checkError.message);
    return null;
  }

  // If user doesn't exist, create them
  if (!existingUser) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name: userInfo?.name || 'New User',
          email: userInfo?.email || 'user@example.com',
          avatar_url: userInfo?.avatarUrl || 'default-avatar.png',
          overall_progress: 0
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user:", insertError.message);
      return null;
    }

    return newUser;
  }

  return existingUser;
}

import { getLocalBookedSessions } from '../data/mentorshipService';

export async function fetchDashboardData(userId: string, userInfo?: { name?: string, email?: string, avatarUrl?: string }) {
  if (!userId) {
    throw new Error("User ID is required to fetch dashboard data.");
  }

  // Ensure user exists before fetching data
  const user = await ensureUserExists(userId, userInfo);

  if (!user) {
    throw new Error("Failed to ensure user exists in database.");
  }

  // Fetch progress data
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId);

  // Fetch sessions data from database
  const { data: dbSessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_time", { ascending: true });

  // Fetch recent activities
  const { data: recentActivities, error: activitiesError } = await supabase
    .from("recent_activities")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(10);

  // Basic error handling
  if (progressError) console.error("Error fetching progress:", progressError.message);
  if (sessionsError) console.error("Error fetching sessions:", sessionsError.message);
  if (activitiesError) console.error("Error fetching recent activities:", activitiesError.message);

  // Get locally stored sessions (from our workaround)
  let localSessions = [];
  try {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      localSessions = getLocalBookedSessions(userId).map(session => ({
        id: session.id,
        user_id: session.student_id,
        mentor_id: session.mentor_id,
        session_time: session.session_time,
        session_type: 'mentorship',
        status: 'scheduled',
        created_at: session.created_at
      }));
    }
  } catch (error) {
    console.error('Error getting local sessions:', error);
  }

  // Combine database sessions with locally stored sessions
  const allSessions = [...(dbSessions || []), ...localSessions].sort((a, b) => {
    return new Date(a.session_time).getTime() - new Date(b.session_time).getTime();
  });

  // Return data
  return {
    user,
    progress: progress || [],
    sessions: allSessions,
    recentActivities: recentActivities || []
  };
}
