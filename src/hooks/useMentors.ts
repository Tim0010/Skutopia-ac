import { useState, useCallback, useRef } from 'react';
import { 
  Mentor as MentorType, 
  MentorBooking, 
  MentorFeedback, 
  MentorResource,
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  bookMentorSession,
  getUserBookings,
  submitMentorFeedback,
  getMentorFeedback,
  getMentorResources,
  addMentorResource
} from '@/services/mentorService';
import { useAuth } from '@/contexts/AuthContext';

// Re-export the Mentor type
export type Mentor = MentorType;

export const useMentors = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Cache for mentors data
  const mentorsCache = useRef<{
    data: Mentor[] | null;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  }>({
    data: null,
    timestamp: 0,
    ttl: 60000 // 1 minute cache
  });
  
  // Single mentor cache
  const mentorCache = useRef<{
    [id: string]: {
      data: Mentor;
      timestamp: number;
      ttl: number;
    }
  }>({});

  // Get all mentors with caching
  const fetchMentors = useCallback(async (forceRefresh = false): Promise<Mentor[]> => {
    // Return cached data if it's still valid
    const now = Date.now();
    if (
      !forceRefresh && 
      mentorsCache.current.data && 
      now - mentorsCache.current.timestamp < mentorsCache.current.ttl
    ) {
      return mentorsCache.current.data;
    }
    
    setLoading(true);
    try {
      const mentors = await getMentors();
      
      // Update cache
      mentorsCache.current = {
        data: mentors,
        timestamp: now,
        ttl: 60000
      };
      
      return mentors;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single mentor by ID with caching
  const fetchMentorById = useCallback(async (id: string, forceRefresh = false): Promise<Mentor | null> => {
    // Return cached data if it's still valid
    const now = Date.now();
    if (
      !forceRefresh && 
      mentorCache.current[id] && 
      now - mentorCache.current[id].timestamp < mentorCache.current[id].ttl
    ) {
      return mentorCache.current[id].data;
    }
    
    setLoading(true);
    try {
      const mentor = await getMentorById(id);
      
      // Update cache if mentor was found
      if (mentor) {
        mentorCache.current[id] = {
          data: mentor,
          timestamp: now,
          ttl: 60000
        };
      }
      
      return mentor;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new mentor
  const addMentor = useCallback(async (mentorData: Omit<Mentor, 'id' | 'created_at' | 'updated_at' | 'sessions_completed' | 'rating'>): Promise<Mentor | null> => {
    setLoading(true);
    try {
      const mentor = await createMentor(mentorData);
      return mentor;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a mentor
  const editMentor = useCallback(async (id: string, updates: Partial<Mentor>): Promise<Mentor | null> => {
    setLoading(true);
    try {
      const mentor = await updateMentor(id, updates);
      return mentor;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a mentor
  const removeMentor = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await deleteMentor(id);
      return success;
    } finally {
      setLoading(false);
    }
  }, []);

  // Book a session with a mentor
  const bookSession = useCallback(async (mentorId: string, date: string, timeSlot: string, notes?: string): Promise<MentorBooking | null> => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const booking = await bookMentorSession({
        user_id: user.id,
        mentor_id: mentorId,
        date,
        time_slot: timeSlot,
        status: 'pending',
        notes
      });
      return booking;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get user's bookings
  const fetchUserBookings = useCallback(async (): Promise<MentorBooking[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const bookings = await getUserBookings(user.id);
      return bookings;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Submit feedback for a mentor
  const leaveFeedback = useCallback(async (mentorId: string, rating: number, comment: string): Promise<MentorFeedback | null> => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const feedback = await submitMentorFeedback({
        user_id: user.id,
        mentor_id: mentorId,
        rating,
        comment
      });
      return feedback;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get mentor's feedback
  const fetchMentorFeedback = useCallback(async (mentorId: string): Promise<MentorFeedback[]> => {
    setLoading(true);
    try {
      const feedback = await getMentorFeedback(mentorId);
      return feedback;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get mentor resources
  const fetchMentorResources = useCallback(async (mentorId: string): Promise<MentorResource[]> => {
    setLoading(true);
    try {
      const resources = await getMentorResources(mentorId);
      return resources;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a resource for a mentor
  const addResource = useCallback(async (resource: Omit<MentorResource, 'id'>): Promise<MentorResource | null> => {
    setLoading(true);
    try {
      const newResource = await addMentorResource(resource);
      return newResource;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchMentors,
    fetchMentorById,
    addMentor,
    editMentor,
    removeMentor,
    bookSession,
    fetchUserBookings,
    leaveFeedback,
    fetchMentorFeedback,
    fetchMentorResources,
    addResource
  };
};

export default useMentors;
