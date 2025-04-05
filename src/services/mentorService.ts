import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database.types";

export interface Mentor {
  id: string;
  name: string;
  avatar_url: string;
  specialization: string;
  bio: string;
  subjects: string[];
  hourly_rate: number;
  currency: string;
  availability: string;
  education: MentorEducation[];
  experience: MentorExperience[];
  resources: MentorResource[];
  sessions_completed: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MentorEducation {
  id?: string;
  mentor_id?: string;
  degree: string;
  institution: string;
  year: string;
}

export interface MentorExperience {
  id?: string;
  mentor_id?: string;
  position: string;
  organization: string;
  period: string;
}

export interface MentorResource {
  id?: string;
  mentor_id?: string;
  title: string;
  description: string;
  type?: string;
  url?: string;
  resource_type?: string; // For backward compatibility
  resource_url?: string;  // For backward compatibility
  is_premium?: boolean;
  created_at?: string;
}

export interface MentorBooking {
  id?: string;
  user_id: string;
  mentor_id: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

export interface MentorFeedback {
  id?: string;
  user_id: string;
  mentor_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

// Helper function to get the number of completed sessions for a mentor
const getMentorSessionsCompleted = async (mentorId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('mentor_bookings')
      .select('mentor_id')
      .eq('mentor_id', mentorId)
      .eq('status', 'completed');
    
    if (error) throw error;
    
    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    return 0;
  }
};

// Helper function to get the average rating for a mentor
const getMentorRating = async (mentorId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('rating')
      .eq('mentor_id', mentorId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, feedback) => acc + (feedback.rating || 0), 0);
    return parseFloat((sum / data.length).toFixed(1));
  } catch (error) {
    console.error('Error fetching mentor ratings:', error);
    return 0;
  }
};

// Get all mentors
export const getMentors = async (): Promise<Mentor[]> => {
  try {
    // Add a timeout to prevent excessive resource usage
    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const fetchPromise = supabase
      .from('mentors')
      .select('*');
    
    // Race between the fetch and the timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise
    ]) as any;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('No mentors found');
      return [];
    }
    
    // Transform the data to match our Mentor interface
    const mentors: Mentor[] = data.map(mentor => ({
      ...mentor,
      sessions_completed: 0,
      rating: 0,
      education: [],
      experience: [],
      resources: []
    }));
    
    return mentors;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    toast.error('Failed to load mentors. Please try again later.');
    return [];
  }
};

// Get a single mentor by ID
export const getMentorById = async (id: string): Promise<Mentor | null> => {
  try {
    // Add a timeout to prevent excessive resource usage
    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const fetchPromise = supabase
      .from('mentors')
      .select(`
        *,
        mentor_education(*),
        mentor_experience(*),
        mentor_resources(*)
      `)
      .eq('id', id)
      .single();
    
    // Race between the fetch and the timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error(`Error fetching mentor with ID ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      console.log(`No mentor found with ID ${id}`);
      return null;
    }
    
    // Transform the data to match our Mentor interface
    const mentor: Mentor = {
      ...data,
      sessions_completed: 0,
      rating: 0,
      education: data.mentor_education || [],
      experience: data.mentor_experience || [],
      resources: data.mentor_resources || []
    };
    
    // Fetch additional data
    const [sessionsCompleted, rating] = await Promise.all([
      getMentorSessionsCompleted(id),
      getMentorRating(id)
    ]);
    
    mentor.sessions_completed = sessionsCompleted;
    mentor.rating = rating;
    
    return mentor;
  } catch (error) {
    console.error(`Error fetching mentor with ID ${id}:`, error);
    toast.error('Failed to load mentor details. Please try again later.');
    return null;
  }
};

// Create a new mentor
export const createMentor = async (mentor: Omit<Mentor, 'id' | 'created_at' | 'updated_at' | 'sessions_completed' | 'rating'>): Promise<Mentor | null> => {
  try {
    let userId: string | null = null;

    // Always check for a real Supabase session now
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication required to create a mentor (no active session)');
      toast.error('Please log in to create a mentor');
      return null;
    }
    userId = sessionData.session.user.id;
    
    // If we still don't have a userId after checks, something is wrong
    if (!userId) {
      console.error('Could not determine user ID for mentor creation.');
      toast.error('User identification failed. Cannot create mentor.');
      return null;
    }

    // Extract mentor data for insert
    const mentorData = {
      name: mentor.name,
      avatar_url: mentor.avatar_url,
      specialization: mentor.specialization,
      bio: mentor.bio,
      subjects: mentor.subjects,
      hourly_rate: mentor.hourly_rate,
      currency: mentor.currency || 'USD',
      availability: mentor.availability,
      // Connect this mentor to the authenticated user
      user_id: userId 
    };

    // Create the mentor record
    const { data, error } = await supabase
      .from('mentors')
      .insert([mentorData])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting mentor:', error);
      
      // Handle specific error cases
      if (error.code === '42501' || error.code === '23505') {
        toast.error('You may not have permission to create a mentor or a mentor with this information already exists');
      } else {
        toast.error(`Failed to create mentor: ${error.message}`);
      }
      
      return null;
    }
    
    if (!data) {
      throw new Error('Failed to create mentor: No data returned');
    }
    
    // Add education records if provided
    if (mentor.education && mentor.education.length > 0) {
      for (const edu of mentor.education) {
        const { error: eduError } = await supabase
          .from('mentor_education')
          .insert({
            mentor_id: data.id,
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year
          });
          
        if (eduError) {
          console.error('Error adding education record:', eduError);
          // Continue anyway - we'll add as many records as we can
        }
      }
    }
    
    // Add experience records if provided
    if (mentor.experience && mentor.experience.length > 0) {
      for (const exp of mentor.experience) {
        const { error: expError } = await supabase
          .from('mentor_experience')
          .insert({
            mentor_id: data.id,
            position: exp.position,
            organization: exp.organization,
            period: exp.period
          });
          
        if (expError) {
          console.error('Error adding experience record:', expError);
          // Continue anyway - we'll add as many records as we can
        }
      }
    }
    
    // Add resource records if provided
    if (mentor.resources && mentor.resources.length > 0) {
      for (const res of mentor.resources) {
        const { error: resError } = await supabase
          .from('mentor_resources')
          .insert({
            mentor_id: data.id,
            title: res.title,
            description: res.description,
            type: res.type || res.resource_type, // Handle both property names
            url: res.url || res.resource_url, // Handle both property names
            is_premium: false // Default value
          });
          
        if (resError) {
          console.error('Error adding resource:', resError);
          // Continue anyway - we'll add as many records as we can
        }
      }
    }
    
    // Return the complete mentor data including relationships
    // This will show up as an empty array initially since we just created the mentor
    const result: Mentor = {
      ...data,
      education: mentor.education || [],
      experience: mentor.experience || [],
      resources: mentor.resources || [],
      sessions_completed: 0,
      rating: 0
    };
    
    toast.success('Mentor created successfully');
    return result;
  } catch (error) {
    console.error('Error creating mentor:', error);
    toast.error('Failed to create mentor');
    return null;
  }
};

// Update a mentor
export const updateMentor = async (id: string, updates: Partial<Mentor>): Promise<Mentor | null> => {
  try {
    // Get current mentor data
    const { data: currentMentor } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!currentMentor) {
      toast.error('Mentor not found');
      return null;
    }
    
    // Prepare update object
    const updateData: any = {};
    
    // Only include fields that are provided in updates
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.specialization !== undefined) updateData.specialization = updates.specialization;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.subjects !== undefined) updateData.subjects = updates.subjects;
    if (updates.hourly_rate !== undefined) updateData.hourly_rate = updates.hourly_rate;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.availability !== undefined) updateData.availability = updates.availability;
    if (updates.education !== undefined) updateData.education = updates.education;
    if (updates.experience !== undefined) updateData.experience = updates.experience;
    
    // Update the mentor record
    const { data, error } = await supabase
      .from('mentors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update resource records if provided
    if (updates.resources && updates.resources.length > 0) {
      // First, delete existing resources
      const { error: deleteError } = await supabase
        .from('mentor_resources')
        .delete()
        .eq('mentor_id', id);
      
      if (deleteError) {
        console.error('Error deleting existing resources:', deleteError);
      }
      
      // Then, add new resources
      for (const res of updates.resources) {
        const { error: resError } = await supabase
          .from('mentor_resources')
          .insert({
            mentor_id: id,
            title: res.title,
            description: res.description,
            type: res.type || res.resource_type, // Handle both property names
            url: res.url || res.resource_url, // Handle both property names
            is_premium: res.is_premium || false
          });
          
        if (resError) {
          console.error('Error adding updated resource:', resError);
        }
      }
    }
    
    toast.success('Mentor updated successfully');
    
    // Fetch the updated mentor with all related data
    return getMentorById(id);
  } catch (error) {
    console.error(`Error updating mentor with ID ${id}:`, error);
    toast.error('Failed to update mentor');
    return null;
  }
};

// Delete a mentor
export const deleteMentor = async (id: string): Promise<boolean> => {
  try {
    // Delete related records first
    await supabase.from('mentor_resources').delete().eq('mentor_id', id);
    
    // Then delete the mentor record
    const { error } = await supabase
      .from('mentors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Mentor deleted successfully');
    return true;
  } catch (error) {
    console.error(`Error deleting mentor with ID ${id}:`, error);
    toast.error('Failed to delete mentor');
    return false;
  }
};

// Book a session with a mentor
export const bookMentorSession = async (booking: Omit<MentorBooking, 'id' | 'created_at' | 'updated_at'>): Promise<MentorBooking | null> => {
  try {
    // Prepare booking data - only include fields that exist in the database schema
    const bookingData = {
      mentor_id: booking.mentor_id,
      user_id: booking.user_id,
      date: booking.date,
      time_slot: booking.time_slot,
      status: booking.status,
      notes: booking.notes
    };

    const { data, error } = await supabase
      .from('mentor_bookings')
      .insert([bookingData])
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Session booked successfully');
    
    if (!data) return null;
    
    // Cast the status to ensure it matches our type and add notes from the original booking
    const typedBooking: MentorBooking = {
      id: data.id,
      mentor_id: data.mentor_id,
      user_id: data.user_id,
      date: data.date,
      time_slot: data.time_slot,
      status: data.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      notes: booking.notes, // Use the notes from the original booking object
      created_at: data.created_at
    };
    
    return typedBooking;
  } catch (error) {
    console.error('Error booking session:', error);
    toast.error('Failed to book session');
    return null;
  }
};

// Update mentor's session count
export const updateMentorSessionCount = async (mentorId: string): Promise<void> => {
  try {
    // Get the count of completed sessions for this mentor
    const { data, error } = await supabase
      .from('mentor_bookings')
      .select('id')
      .eq('mentor_id', mentorId)
      .eq('status', 'completed');
    
    if (error) throw error;
    
    const count = data?.length || 0;
    
    // First get the current mentor data
    const { data: mentorData } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', mentorId)
      .single();
    
    if (!mentorData) return;
    
    // Store the sessions_completed in a custom field or metadata
    // Since the field doesn't exist in the database schema, we'll use a workaround
    // This could be storing it in a separate analytics table or using a different approach
    // For now, we'll just log it
    console.log(`Updated session count for mentor ${mentorId} to ${count}`);
    
    // In a real implementation, you might want to store this in a separate analytics table
    // or add a sessions_completed column to the mentors table
  } catch (error) {
    console.error(`Error updating session count for mentor ${mentorId}:`, error);
  }
};

// Get user's bookings
export const getUserBookings = async (userId: string): Promise<MentorBooking[]> => {
  try {
    // First get the bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('mentor_bookings')
      .select(`
        id,
        mentor_id,
        user_id,
        date,
        time_slot,
        status,
        notes,
        created_at
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (bookingsError) throw bookingsError;
    
    if (!bookingsData || bookingsData.length === 0) {
      return [];
    }
    
    // Then get the mentor data for these bookings
    const mentorIds = bookingsData.map(booking => booking.mentor_id);
    const { data: mentorsData, error: mentorsError } = await supabase
      .from('mentors')
      .select('id, name, avatar_url, specialization')
      .in('id', mentorIds);
    
    if (mentorsError) throw mentorsError;
    
    // Combine the data
    const bookings = bookingsData.map(booking => {
      const mentor = mentorsData?.find(m => m.id === booking.mentor_id);
      
      return {
        id: booking.id,
        mentor_id: booking.mentor_id,
        user_id: booking.user_id,
        date: booking.date,
        time_slot: booking.time_slot,
        status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        notes: booking.notes,
        created_at: booking.created_at,
        mentor: mentor ? {
          id: mentor.id,
          name: mentor.name,
          avatar_url: mentor.avatar_url,
          specialization: mentor.specialization
        } : null
      };
    });
    
    return bookings;
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    toast.error('Failed to load your bookings');
    return [];
  }
};

// Submit feedback for a mentor
export const submitMentorFeedback = async (feedback: Omit<MentorFeedback, 'id' | 'created_at'>): Promise<MentorFeedback | null> => {
  try {
    // Submit the feedback
    const { data, error } = await supabase
      .from('mentor_feedback')
      .insert({
        mentor_id: feedback.mentor_id,
        user_id: feedback.user_id,
        rating: feedback.rating,
        comment: feedback.comment
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the mentor's average rating
    await updateMentorRating(feedback.mentor_id);
    
    toast.success('Feedback submitted successfully');
    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    toast.error('Failed to submit feedback');
    return null;
  }
};

// Update mentor's average rating
export const updateMentorRating = async (mentorId: string): Promise<void> => {
  try {
    // Get all feedback for this mentor
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('rating')
      .eq('mentor_id', mentorId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return;
    
    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / data.length;
    
    // First get the current mentor data
    const { data: mentorData } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', mentorId)
      .single();
    
    if (!mentorData) return;
    
    // Store the rating in a custom field or metadata
    // Since the field doesn't exist in the database schema, we'll use a workaround
    // This could be calculating it on-the-fly when needed instead of storing it
    // For now, we'll just log it
    console.log(`Updated rating for mentor ${mentorId} to ${averageRating}`);
    
    // In a real implementation, you might want to store this in a separate analytics table
    // or add a rating column to the mentors table
  } catch (error) {
    console.error(`Error updating rating for mentor ${mentorId}:`, error);
  }
};

// Get mentor's feedback
export const getMentorFeedback = async (mentorId: string): Promise<MentorFeedback[]> => {
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
    const feedback = feedbackData.map(item => {
      const profile = profilesData?.find(p => p.id === item.user_id);
      
      return {
        id: item.id,
        mentor_id: mentorId,
        user_id: item.user_id,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at,
        user: profile ? {
          name: profile.name,
          avatar_url: profile.avatar_url
        } : {
          name: 'Anonymous',
          avatar_url: null
        }
      };
    });
    
    return feedback;
  } catch (error) {
    console.error(`Error fetching feedback for mentor ${mentorId}:`, error);
    toast.error('Failed to load feedback');
    return [];
  }
};

// Get mentor resources
export const getMentorResources = async (mentorId: string): Promise<MentorResource[]> => {
  try {
    const { data, error } = await supabase
      .from('mentor_resources')
      .select('*')
      .eq('mentor_id', mentorId);
    
    if (error) throw error;
    
    // Transform the data to match our MentorResource interface
    const resources: MentorResource[] = data?.map(resource => ({
      id: resource.id,
      mentor_id: resource.mentor_id,
      title: resource.title,
      description: resource.description || '',
      // Map database fields to both naming conventions for compatibility
      type: resource.type,
      url: resource.url,
      resource_type: resource.type, // For backward compatibility
      resource_url: resource.url,   // For backward compatibility
      is_premium: resource.is_premium,
      created_at: resource.created_at
    })) || [];
    
    return resources;
  } catch (error) {
    console.error('Error fetching mentor resources:', error);
    return [];
  }
};

// Create a new resource for a mentor
export const createMentorResource = async (
  mentorId: string,
  resource: Omit<MentorResource, 'id' | 'mentor_id' | 'created_at'>
): Promise<MentorResource | null> => {
  try {
    const resourceData = {
      mentor_id: mentorId,
      title: resource.title,
      description: resource.description,
      type: resource.type || resource.resource_type, // Handle both naming conventions
      url: resource.url || resource.resource_url,     // Handle both naming conventions
      is_premium: resource.is_premium || false
    };

    const { data, error } = await supabase
      .from('mentor_resources')
      .insert(resourceData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform the data to match our MentorResource interface
    return {
      id: data.id,
      mentor_id: data.mentor_id,
      title: data.title,
      description: data.description,
      type: data.type,
      url: data.url,
      resource_type: data.type, // For backward compatibility
      resource_url: data.url,   // For backward compatibility
      is_premium: data.is_premium,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error creating mentor resource:', error);
    toast.error('Failed to create resource');
    return null;
  }
};

// Add a resource for a mentor (deprecated, use createMentorResource instead)
export const addMentorResource = async (resource: Omit<MentorResource, 'id' | 'created_at'>): Promise<MentorResource | null> => {
  // This function is kept for backward compatibility
  // Just delegate to the new function
  return createMentorResource(resource.mentor_id!, resource);
};

// Get the total count of mentors
export const getMentorsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('mentors')
      .select('* ', { count: 'exact', head: true }); // Use head:true to only get the count

    if (error) {
      console.error("Error fetching mentors count:", error);
      toast.error(`Failed to fetch mentor count: ${error.message}`);
      return 0;
    }

    return count ?? 0;
  } catch (error: any) {
    console.error("Unexpected error fetching mentors count:", error);
    toast.error('An unexpected error occurred while fetching mentor count.');
    return 0;
  }
};

// Function to book a new session
export async function bookSession(bookingDetails: {
  mentor_id: string;
  student_id: string;
  session_date: string; 
  session_time: string;
  notes?: string;
  status: string; // e.g., 'pending', 'confirmed'
}) {

  // *** Add this check to ensure client is authenticated ***
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
      console.error('Auth check failed before insert:', authError);
      throw new Error(authError?.message || "User authentication check failed. Please log in again.");
  }
  // We don't strictly *need* user.id here for the insert itself,
  // as the RLS policy uses auth.uid(), but this confirms auth.
  console.log('Auth check successful, user ID:', user.id, 'Proceeding with insert...');

  // Perform the direct insert
  const { data, error } = await supabase
    .from('sessions' as any) // WORKAROUND: Use 'as any' to bypass type errors
    .insert([{
      mentor_id: bookingDetails.mentor_id,
      student_id: bookingDetails.student_id, // Use the ID passed from UI
      session_date: bookingDetails.session_date,
      session_time: bookingDetails.session_time,
      notes: bookingDetails.notes,
      status: bookingDetails.status,
    }] as any) // WORKAROUND: Use 'as any' to bypass type errors
    .select() // Select the inserted row
    .single();

  if (error) {
    console.error("Error booking session (direct insert):", error);
    // Provide specific feedback for RLS errors
    if (error.code === '42501') { 
        throw new Error(`Permission denied: RLS policy violation (${error.message})`);
    } else {
        throw new Error(error.message || "Failed to book session.");
    }
  }

  console.log("Direct insert successful:", data);
  return data;
}

// Function to get upcoming sessions for a student (Confirmed only)
export async function getStudentUpcomingSessions(studentId: string): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  // Fetch only CONFIRMED sessions for the student from today onwards
  const { data, error } = await supabase
    .from('sessions' as any) // WORKAROUND: Use 'as any' for type errors
    .select(`
      *,
      student:student_id ( id, name, avatar_url ),
      mentor:mentor_id ( id, name, avatar_url )
    `)
    .eq('student_id', studentId) // Filter by the logged-in student
    .eq('status', 'confirmed')   // Filter by confirmed status
    .gte('session_date', today) // Fetch sessions from today onwards
    .order('session_date', { ascending: true })
    .order('session_time', { ascending: true });

  if (error) {
    console.error("Error fetching upcoming confirmed sessions:", error);
    toast.error("Could not load your upcoming sessions.");
    throw error;
  }
  // Ensure the returned data conforms to Session[] or is an empty array
  // The 'as any' casts might interfere with type inference, so we cast the result.
  return (data as any[] | null) || []; 
}

// You might also want functions to fetch sessions for mentors, etc.

// Function to add new feedback/testimonial
export async function addTestimonial(testimonialData: {
  mentor_id: string;
  user_id: string;
  rating: number;
  comment: string;
}): Promise<{
  id: string; 
  created_at: string;
  mentor_id: string;
  user_id: string;
  rating: number;
  comment: string;
  user: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}> {
  // *** Add this check to ensure client is authenticated ***
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
      console.error('Auth check failed before testimonial insert:', authError);
      throw new Error(authError?.message || "User authentication check failed. Please log in again.");
  }
  // Verify the passed user_id matches the authenticated user's profile ID
  // This adds an extra layer of security check in the service
  if (user.id !== testimonialData.user_id) {
      console.error('Mismatch between authenticated user and provided user_id for testimonial.');
      throw new Error("Cannot submit feedback for another user.");
  }
  console.log('Auth check successful for testimonial, user ID:', user.id, 'Proceeding with insert...');

  // Perform the direct insert
  const { data, error } = await supabase
    .from('testimonials' as any) // WORKAROUND: Use 'as any' to bypass type errors
    .insert([testimonialData] as any) // WORKAROUND: Use 'as any' to bypass type errors
    .select('*') // Keep select simple for now, '*' might not include user details
    .single();

  if (error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }
  // Adding explicit type cast for the returned data
  return data as unknown as {
    id: string; 
    created_at: string;
    mentor_id: string;
    user_id: string;
    rating: number;
    comment: string;
    user: {
      name: string | null;
      avatar_url: string | null;
    } | null;
  };
}

// Function to get sessions needing admin confirmation
export async function getPendingSessions(): Promise<any[]> {
  try {
    // Fetch sessions with status 'pending', joining profile info for student and mentor
    const { data, error } = await supabase
      .from('sessions' as any) // WORKAROUND: Use 'as any' for type errors
      .select(`
        *,
        student:student_id ( id, name, avatar_url ),
        mentor:mentor_id ( id, name, avatar_url )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching pending sessions:", error);
      toast.error("Failed to load pending sessions.");
      return []; // Return empty array instead of throwing
    }
    return data || []; // Return empty array if no data
  } catch (error) {
    console.error("Unexpected error fetching pending sessions:", error);
    toast.error("Failed to load pending sessions.");
    return []; // Return empty array on unexpected errors
  }
}

// Function to update the status of a session
export async function updateSessionStatus(sessionId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') { // Add other statuses as needed
  // Check auth - important before any update
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
      console.error('Auth check failed before updating session status:', authError);
      throw new Error(authError?.message || "User authentication check failed. Please log in again.");
  }

  const { data, error } = await supabase
    .from('sessions' as any) // WORKAROUND: Use 'as any' for type errors
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating session ${sessionId} to ${newStatus}:`, error);
        // Provide specific feedback for RLS errors
    if (error.code === '42501') { 
        throw new Error(`Permission denied: Cannot update session status (${error.message})`);
    } else {
        throw new Error(error.message || "Failed to update session status.");
    }
  }
  console.log(`Session ${sessionId} status updated to ${newStatus}:`, data);
  return data;
}
