import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStudentUpcomingSessions } from '../services/mentorService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'; // Using shadcn/ui
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"; // Using shadcn/ui
import { format } from 'date-fns'; // For date formatting

// Define Session type locally (or import if types.ts is reliable)
// Adapt based on the actual structure returned by getStudentUpcomingSessions
interface Session {
  id: string;
  mentor_id: string;
  student_id: string;
  session_date: string;
  session_time: string;
  status: string;
  notes?: string;
  created_at: string;
  mentor: { // Assuming mentor details are included
    id: string;
    name: string;
    avatar_url?: string;
  };
}

function MySessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch only confirmed upcoming sessions
        const upcomingSessions = await getStudentUpcomingSessions(user.id);
        // Explicitly cast to Session[] due to service function returning any[]
        setSessions(upcomingSessions as Session[]); 
      } catch (err) {
        console.error("Error fetching upcoming sessions:", err);
        setError("Failed to load your sessions. Please try again later.");
        setSessions([]); // Clear sessions on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]); // Re-fetch if user changes

  const formatSessionTime = (timeString: string) => {
    // Assuming time is stored like "HH:MM:SS" or "HH:MM"
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return format(date, 'h:mm a'); // Format as "9:00 AM"
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString; // Fallback to original string
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Upcoming Confirmed Sessions</h1>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
           <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00573c] border-t-[#00573c]" />
          <p className="ml-4 text-lg">Loading sessions...</p>
        </div>
      )}

      {error && (
        <Card className="bg-red-100 border-red-400 text-red-700">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
             <p className="text-center text-muted-foreground">You have no upcoming confirmed sessions scheduled.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2 bg-secondary/30">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.mentor.avatar_url || undefined} alt={session.mentor.name} />
                  <AvatarFallback>{session.mentor.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                   <CardTitle className="text-lg">{session.mentor.name}</CardTitle>
                   <CardDescription>Mentor</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p><strong>Date:</strong> {format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}</p>
                  <p><strong>Time:</strong> {formatSessionTime(session.session_time)}</p>
                  {session.notes && <p><strong>Notes:</strong> {session.notes}</p>}
                  {/* Display status if needed, though it should always be 'confirmed' here */}
                  {/* <p><strong>Status:</strong> <span className="capitalize font-medium text-green-600">{session.status}</span></p> */}
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySessions;
