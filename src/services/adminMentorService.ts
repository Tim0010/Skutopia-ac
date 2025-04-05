import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";

export interface MentorStats {
  totalMentors: number;
  activeMentors: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  topSubjects: { subject: string; count: number }[];
  recentBookings: {
    id: string;
    mentor_name: string;
    student_name: string;
    date: string;
    status: string;
  }[];
}

/**
 * Fetches statistics related to mentors for the admin dashboard
 */
export const fetchMentorStats = async (): Promise<MentorStats> => {
  try {
    // Get total mentors count
    const { count: totalMentors } = await supabase
      .from('mentors')
      .select('*', { count: 'exact', head: true });

    // Get active mentors (mentors with at least one booking in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activeMentorsData } = await supabase
      .from('mentor_bookings')
      .select('mentor_id')
      .gte('date', thirtyDaysAgo.toISOString())
      .eq('status', 'completed');
    
    // Get unique mentor IDs from active bookings
    const activeMentorIds = new Set(activeMentorsData?.map(booking => booking.mentor_id) || []);
    const activeMentors = activeMentorIds.size;

    // Get total bookings
    const { count: totalBookings } = await supabase
      .from('mentor_bookings')
      .select('*', { count: 'exact', head: true });

    // Calculate total revenue - since we don't have session_price in the schema anymore,
    // we'll calculate it based on mentor hourly rates
    const { data: completedBookings } = await supabase
      .from('mentor_bookings')
      .select(`
        mentor_id
      `)
      .eq('status', 'completed');
    
    // Get hourly rates for mentors with completed bookings
    let totalRevenue = 0;
    if (completedBookings && completedBookings.length > 0) {
      const mentorIds = completedBookings.map(booking => booking.mentor_id);
      const uniqueMentorIds = [...new Set(mentorIds)];
      
      const { data: mentorsData } = await supabase
        .from('mentors')
        .select('hourly_rate')
        .in('id', uniqueMentorIds);
      
      if (mentorsData) {
        // Calculate revenue based on hourly rates and number of sessions
        totalRevenue = mentorsData.reduce((sum, mentor) => sum + (mentor.hourly_rate || 0), 0);
      }
    }

    // Get average rating
    const { data: ratingsData } = await supabase
      .from('mentor_feedback')
      .select('rating');
    
    const totalRatings = ratingsData?.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) || 0;
    const averageRating = ratingsData && ratingsData.length > 0 
      ? totalRatings / ratingsData.length 
      : 0;

    // Get top subjects
    const { data: mentorsData } = await supabase
      .from('mentors')
      .select('subjects');
    
    // Count occurrences of each subject
    const subjectCounts: Record<string, number> = {};
    mentorsData?.forEach(mentor => {
      if (mentor.subjects && Array.isArray(mentor.subjects)) {
        mentor.subjects.forEach(subject => {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count
    const topSubjects = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5 subjects

    // Get recent bookings
    const { data: recentBookingsData } = await supabase
      .from('mentor_bookings')
      .select(`
        id,
        date,
        status,
        mentor_id,
        user_id
      `)
      .order('date', { ascending: false })
      .limit(5);
    
    // Get mentor and user names separately
    const recentBookings = [];
    
    if (recentBookingsData && recentBookingsData.length > 0) {
      // Get mentor names
      const mentorIds = recentBookingsData.map(booking => booking.mentor_id);
      const { data: mentorsData } = await supabase
        .from('mentors')
        .select('id, name')
        .in('id', mentorIds);
      
      // Get user names
      const userIds = recentBookingsData.map(booking => booking.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      // Combine the data
      for (const booking of recentBookingsData) {
        const mentor = mentorsData?.find(m => m.id === booking.mentor_id);
        const profile = profilesData?.find(p => p.id === booking.user_id);
        
        recentBookings.push({
          id: booking.id,
          mentor_name: mentor?.name || 'Unknown',
          student_name: profile?.name || 'Unknown',
          date: booking.date,
          status: booking.status
        });
      }
    }

    return {
      totalMentors: totalMentors || 0,
      activeMentors,
      totalBookings: totalBookings || 0,
      totalRevenue,
      averageRating,
      topSubjects,
      recentBookings
    };
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    // Return default values in case of error
    return {
      totalMentors: 0,
      activeMentors: 0,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      topSubjects: [],
      recentBookings: []
    };
  }
};

/**
 * Updates a mentor's hourly rate
 */
export const updateMentorRate = async (
  mentorId: string, 
  hourlyRate: number, 
  currency: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mentors')
      .update({ 
        hourly_rate: hourlyRate,
        currency: currency
      })
      .eq('id', mentorId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating mentor rate:', error);
    return false;
  }
};

/**
 * Calculates the total session price for a mentor
 * based on their hourly rate and session duration
 */
export const calculateSessionPrice = (hourlyRate: number, durationMinutes: number): number => {
  return (hourlyRate * durationMinutes) / 60;
};

/**
 * Fetches all bookings for a specific mentor
 */
export const fetchMentorBookings = async (mentorId: string) => {
  try {
    // First get the bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('mentor_bookings')
      .select(`
        id,
        date,
        time_slot,
        status,
        user_id
      `)
      .eq('mentor_id', mentorId)
      .order('date', { ascending: false });
    
    if (bookingsError) throw bookingsError;
    
    if (!bookingsData || bookingsData.length === 0) {
      return [];
    }
    
    // Then get the user profiles for these bookings
    const userIds = bookingsData.map(booking => booking.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Combine the data
    return bookingsData.map(booking => {
      const profile = profilesData?.find(p => p.id === booking.user_id);
      
      return {
        id: booking.id,
        date: booking.date,
        time_slot: booking.time_slot,
        status: booking.status,
        user: profile || { id: booking.user_id, name: 'Unknown', avatar_url: null }
      };
    });
  } catch (error) {
    console.error('Error fetching mentor bookings:', error);
    return [];
  }
};

/**
 * Fetches all feedback for a specific mentor
 */
export const fetchMentorFeedback = async (mentorId: string) => {
  try {
    // First get the feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('mentor_feedback')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
    
    if (feedbackError) throw feedbackError;
    
    if (!feedbackData || feedbackData.length === 0) {
      return [];
    }
    
    // Then get the user profiles for this feedback
    const userIds = feedbackData.map(feedback => feedback.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Combine the data
    return feedbackData.map(feedback => {
      const profile = profilesData?.find(p => p.id === feedback.user_id);
      
      return {
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        created_at: feedback.created_at,
        user: profile || { id: feedback.user_id, name: 'Anonymous', avatar_url: null }
      };
    });
  } catch (error) {
    console.error('Error fetching mentor feedback:', error);
    return [];
  }
};

/**
 * Fetches all resources for a specific mentor
 */
export const fetchMentorResources = async (mentorId: string) => {
  try {
    const { data, error } = await supabase
      .from('mentor_resources')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching mentor resources:', error);
    return [];
  }
};

/**
 * Adds a new resource for a mentor
 */
export const addMentorResource = async (
  mentorId: string,
  title: string,
  description: string,
  type: string,
  url: string,
  isPremium: boolean = false
) => {
  try {
    const { data, error } = await supabase
      .from('mentor_resources')
      .insert({
        mentor_id: mentorId,
        title,
        description,
        type,
        url,
        is_premium: isPremium
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding mentor resource:', error);
    return null;
  }
};

/**
 * Removes a resource
 */
export const removeMentorResource = async (resourceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mentor_resources')
      .delete()
      .eq('id', resourceId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing mentor resource:', error);
    return false;
  }
};
