import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { addMinutes, format, getDay, nextSaturday, setHours, setMinutes, setSeconds, setMilliseconds, parseISO, isBefore, isEqual, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// --- Constants ---
const INDIA_TIME_ZONE = 'Asia/Kolkata';
const MENTORSHIP_DAY = 6; // Saturday (0=Sunday, 6=Saturday)
const MENTORSHIP_START_HOUR_IST = 15; // 3:00 PM IST
const MENTORSHIP_END_HOUR_IST = 18; // 6:00 PM IST
const SESSION_DURATION_MINUTES = 30;
const MAX_SESSIONS_PER_DAY = 6;
const WEEKS_TO_CHECK = 4; // Check availability for the next 4 Saturdays

// --- Type Definitions ---
export interface Mentor {
    id: string; // UUID
    name: string;
    bio: string;
    field: string;
    occupation: string;
    university?: string;
    company?: string;
    linkedin?: string;
    avatar_url?: string; // Ensure this exists for the type
    available: boolean;
    created_at: string;
}

export interface MentorshipSession {
    id: string; // UUID
    mentor_id: string;
    student_id: string;
    session_time: string; // ISO timestamp string
    status: 'booked' | 'completed' | 'cancelled';
    created_at: string;
}

export interface TimeSlot {
    startTime: Date; // Store as Date object for easier manipulation
    isAvailable: boolean;
}

// --- API Functions ---

/**
 * Fetches mentors, optionally filtering by field.
 */
export const fetchMentors = async (field?: string): Promise<Mentor[]> => {
    // Select all required fields, including avatar_url, directly from mentors
    let query = supabase
        .from('mentors')
        .select(`
            id,
            name,
            bio,
            field,
            occupation,
            university,
            company,
            linkedin,
            avatar_url,
            available,
            created_at
        `)
        .eq('available', true)
        .order('name');

    if (field) {
        query = query.eq('field', field);
    }

    // Execute the query - explicitly type the result
    // Expect data to be an array of objects potentially missing avatar_url initially
    const { data, error } = await query as { data: Omit<Mentor, 'avatar_url'>[] | (Mentor[]) | null; error: any };

    if (error) {
        console.error("Error fetching mentors:", error);
        // Check if the error is specifically about the avatar_url column not existing
        if (error.message.includes('column "avatar_url" does not exist')) {
             console.warn('The \'avatar_url\' column does not exist in the \'mentors\' table. Please add it via Supabase Studio.');
             // Return data without avatar_url if the column is missing
             // Map safely, ensuring 'm' is treated as an object
             return (data?.map(m => {
                 const { ...mentorData } = m; // Ensure m is treated as an object
                 return { ...mentorData, avatar_url: undefined };
             }) || []) as Mentor[]; // Asserting here is okay as we manually added avatar_url: undefined
        } 
        // Otherwise, re-throw the original error
        throw error;
    }

    // Return the data, ensuring the type matches
    // If data is not null, it should now conform to Mentor[] (or have been handled above)
    return (data || []) as Mentor[]; // Asserting here is safer now
};

/**
 * Fetches distinct fields available for mentors.
 */
export const fetchDistinctMentorFields = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('mentors')
        .select('field')
        .eq('available', true) as { data: { field: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct mentor fields:", error);
        throw error;
    }
    const fields = data ? [...new Set(data.map(item => item.field))].sort() : [];
    return fields;
};

/**
 * Fetches booked session times for a specific mentor within a given date range (UTC).
 */
const fetchBookedSlots = async (mentorId: string, startDateUTC: Date, endDateUTC: Date): Promise<Date[]> => {
    const { data, error } = await supabase
        .from('sessions')
        .select('session_time')
        .eq('mentor_id', mentorId)
        .in('status', ['scheduled', 'completed']) // 'scheduled' in sessions table = 'booked' in our interface
        .gte('session_time', startDateUTC.toISOString())
        .lt('session_time', endDateUTC.toISOString());

    if (error) {
        console.error("Error fetching booked slots:", error);
        throw error;
    }

    // Convert ISO strings back to Date objects (these will be in UTC)
    return data ? data.map(slot => parseISO(slot.session_time)) : [];
};

/**
 * Generates available mentorship slots for a given mentor for the next few Saturdays.
 */
export const generateAvailableSlots = async (mentorId: string): Promise<Date[]> => {
    const availableSlots: Date[] = [];
    let currentSaturday = nextSaturday(new Date()); // Start from the next Saturday

    for (let i = 0; i < WEEKS_TO_CHECK; i++) {
        const targetSaturdayDateString = format(currentSaturday, 'yyyy-MM-dd');

        // Construct ISO strings for the start/end of the day in IST
        const midnightISTString = `${targetSaturdayDateString}T00:00:00+05:30`;
        const nextMidnightISTString = `${format(addMinutes(currentSaturday, 24*60), 'yyyy-MM-dd')}T00:00:00+05:30`; // Use next day for end

        // Parse strings to get UTC Date objects for querying
        const queryStartUTC = parseISO(midnightISTString);
        const queryEndUTC = parseISO(nextMidnightISTString);

        const bookedSlotsUTC = await fetchBookedSlots(mentorId, queryStartUTC, queryEndUTC);

        let sessionsOnThisDay = 0;

        // Iterate through potential slots (3:00 PM to 5:30 PM IST start times)
        for (let hour = MENTORSHIP_START_HOUR_IST; hour < MENTORSHIP_END_HOUR_IST; hour++) {
            for (let minute = 0; minute < 60; minute += SESSION_DURATION_MINUTES) {
                if (sessionsOnThisDay >= MAX_SESSIONS_PER_DAY) break; // Stop if max slots for the day are generated

                // Create Date object representing the potential slot wall time in IST
                let potentialSlotStartIST = setMilliseconds(setSeconds(setMinutes(setHours(startOfDay(currentSaturday), hour), minute), 0), 0);

                // Format as ISO string with IST offset and parse to get the UTC equivalent
                // Correct approach: format parts and manually add offset string
                const datePart = format(potentialSlotStartIST, 'yyyy-MM-dd');
                const timePart = format(potentialSlotStartIST, 'HH:mm:ss');
                const potentialSlotISTString = `${datePart}T${timePart}+05:30`; 
                const potentialSlotUTC = parseISO(potentialSlotISTString); // This date object represents the UTC instant

                // Check if this UTC instant is already booked
                const isBooked = bookedSlotsUTC.some(bookedSlotUTC => isEqual(bookedSlotUTC, potentialSlotUTC));

                // Only add if it's not booked and is in the future
                if (!isBooked && isBefore(new Date(), potentialSlotUTC)) {
                    availableSlots.push(potentialSlotUTC); // Store the available slot time in UTC
                    sessionsOnThisDay++;
                }
            }
            if (sessionsOnThisDay >= MAX_SESSIONS_PER_DAY) break;
        }

        // Move to the next Saturday
        currentSaturday = nextSaturday(currentSaturday);
    }

    return availableSlots.sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
};

/**
 * Books a mentorship session.
 * 
 * This function attempts to store the session in the database first.
 * If that fails due to RLS policies, it falls back to localStorage for demonstration purposes.
 */
export const bookSession = async (mentorId: string, studentId: string, sessionTimeUTC: Date): Promise<MentorshipSession> => {
    try {
        const sessionTimeStr = sessionTimeUTC.toISOString();
        
        // First check if the slot is already booked to provide a better error message
        const { data: existingBookings } = await supabase
            .from('sessions')
            .select('id')
            .eq('mentor_id', mentorId)
            .eq('session_time', sessionTimeStr)
            .eq('status', 'booked');
            
        if (existingBookings && existingBookings.length > 0) {
            throw new Error("This time slot is already booked. Please select another time.");
        }
        
        // Create the session object
        const sessionData = {
            mentor_id: mentorId,
            user_id: studentId, // Note: sessions table uses user_id instead of student_id
            session_time: sessionTimeStr,
            session_type: 'mentorship',
            status: 'scheduled'
        };
        
        // Try to insert the session into the database
        const { data, error } = await supabase
            .from('sessions')
            .insert([sessionData])
            .select()
            .single();
        
        // If successful, return the database record
        if (data && !error) {
            console.log("Session booked successfully in database:", data);
            
            // Convert to MentorshipSession format
            const session: MentorshipSession = {
                id: data.id,
                mentor_id: data.mentor_id,
                student_id: data.user_id, // Map user_id to student_id
                session_time: data.session_time,
                status: data.status === 'scheduled' ? 'booked' : data.status,
                created_at: data.created_at
            };
            
            return session;
        }
        
        // If there was an error (likely due to RLS policies), log it and fall back to localStorage
        if (error) {
            console.warn("Could not store session in database due to RLS policies. Using localStorage fallback:", error.message);
            
            // Create a mock session as fallback
            const mockSession: MentorshipSession = {
                id: crypto.randomUUID(), // Generate a client-side UUID
                mentor_id: mentorId,
                student_id: studentId,
                session_time: sessionTimeStr,
                status: 'booked',
                created_at: new Date().toISOString()
            };
            
            // Store in localStorage as fallback
            const storageKey = `mentorship_booking_${mentorId}_${sessionTimeStr}`;
            localStorage.setItem(storageKey, JSON.stringify(mockSession));
            
            console.log("Booking created in localStorage (fallback):", mockSession);
            return mockSession;
        }
        
        throw new Error("Failed to book session. Please try again later.");
    } catch (error) {
        console.error("Error in bookSession:", error);
        throw error;
    }
};

/**
 * Retrieves all booked mentorship sessions for a user from localStorage.
 * This is a temporary solution until the database RLS policies are fixed.
 */
export const getLocalBookedSessions = (userId: string): MentorshipSession[] => {
    try {
        const sessions: MentorshipSession[] = [];
        
        // Iterate through localStorage to find all mentorship bookings
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Check if this is a mentorship booking key
            if (key && key.startsWith('mentorship_booking_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key) || '{}');
                    
                    // Only include sessions for this user
                    if (sessionData && sessionData.student_id === userId) {
                        sessions.push(sessionData);
                    }
                } catch (parseError) {
                    console.error('Error parsing session data:', parseError);
                }
            }
        }
        
        // Sort sessions by time (ascending)
        return sessions.sort((a, b) => {
            return new Date(a.session_time).getTime() - new Date(b.session_time).getTime();
        });
    } catch (error) {
        console.error('Error retrieving local booked sessions:', error);
        return [];
    }
};
