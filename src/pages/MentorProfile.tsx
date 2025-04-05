import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Star,
  MapPin,
  GraduationCap,
  BookOpen,
  FileText,
  Video,
  Clock,
  Calendar as CalendarIcon,
  BookText,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  fetchMentors, 
  generateAvailableSlots,
  bookSession as bookSessionService, 
  Mentor as MentorData, 
} from "@/data/mentorshipService"; 
import { toZonedTime } from 'date-fns-tz'; 

const MentorProfile = () => {
  const { id: mentorId } = useParams<{ id: string }>(); 
  const { user } = useAuth();
  
  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]); 
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null); 
  const [isBookingSession, setIsBookingSession] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const loadMentorData = async () => {
      if (!mentorId) return;
      setLoading(true);
      setError(null);
      try {
        const allMentors = await fetchMentors();
        const foundMentor = allMentors.find(m => m.id === mentorId);
        if (foundMentor) {
          setMentor(foundMentor);
        } else {
          setError("Mentor not found.");
        }
      } catch (err) {
        console.error("Failed to load mentor data:", err);
        setError("Failed to load mentor profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadMentorData();
  }, [mentorId]);

  const openBookingDialog = async () => {
    if (!mentorId) return;
    setIsBookingDialogOpen(true);
    setIsLoadingSlots(true);
    setAvailableSlots([]); 
    setSelectedSlot(null); 
    try {
      const slots = await generateAvailableSlots(mentorId);
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Failed to load available slots:", err);
      toast.error("Could not load available time slots. Please try again.");
      setIsBookingDialogOpen(false); 
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBookSession = async () => {
    if (!user || !mentor || !selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    setIsBookingSession(true);
    try {
      // Get user-friendly time for display
      const zonedTime = toZonedTime(selectedSlot, indianTimeZone);
      const formattedTime = format(zonedTime, 'eeee, MMM d, yyyy, hh:mm a');
      
      // Attempt to book the session
      await bookSessionService(mentor.id, user.id, selectedSlot);
      
      // Success message with time details
      toast.success(`Session booked successfully for ${formattedTime} IST!`);
      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
      
      // Remove the booked slot from available slots
      setAvailableSlots(prevSlots => prevSlots.filter(slot => slot.getTime() !== selectedSlot.getTime()));

    } catch (err: any) {
      console.error("Booking failed:", err);
      
      // Provide a user-friendly error message
      let errorMessage = 'Failed to book session. Please try again.';
      
      // Check for specific error messages
      if (err.message) {
        if (err.message.includes('already booked')) {
          errorMessage = 'This time slot is already booked. Please select another time.';
          // Refresh available slots
          try {
            const slots = await generateAvailableSlots(mentorId);
            setAvailableSlots(slots);
          } catch (refreshErr) {
            console.error("Failed to refresh slots:", refreshErr);
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsBookingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-skutopia-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="mt-2">{error}</p>
          <Button className="mt-4" asChild>
            <Link to="/mentors">Back to Mentors</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Mentor not found</h1>
          <p className="mt-2">The mentor you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link to="/mentors">Back to Mentors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const indianTimeZone = 'Asia/Kolkata'; 

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Mentor Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={mentor?.avatar_url ?? undefined} alt={mentor?.name ?? 'Mentor Avatar'} />
                  <AvatarFallback>{mentor?.name?.charAt(0).toUpperCase() ?? 'M'}</AvatarFallback>
                </Avatar>

                <CardTitle className="text-xl font-semibold">{mentor.name}</CardTitle>
                <CardDescription className="text-indigo-600 dark:text-indigo-400">
                  {mentor.occupation} in {mentor.field}
                </CardDescription>
              </div>
              <div className="space-y-4 mt-6">
                {(mentor.university || mentor.company) && (
                  <div className="flex items-center text-sm">
                    <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{mentor.university || mentor.company}</span>
                  </div>
                )}
                
                {mentor.linkedin && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mr-2 flex-shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path></svg>
                    <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button className="w-full mt-6 bg-skutopia-600 hover:bg-skutopia-700" onClick={openBookingDialog} disabled={!mentor.available}>
                    {mentor.available ? 'Book a Session' : 'Currently Unavailable'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: About */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About {mentor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{mentor.bio}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
            <DialogDescription>
              Select an available time slot (shown in {indianTimeZone.replace('_', ' ')} time).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Available Time Slots (IST)</Label>
              <div className="mt-2 max-h-60 overflow-y-auto space-y-2 pr-2"> 
                {isLoadingSlots ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-skutopia-600 border-t-transparent"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((slot) => {
                    const zonedTime = toZonedTime(slot, indianTimeZone); 
                    const isSelected = selectedSlot?.getTime() === slot.getTime();
                    return (
                      <Button
                        key={slot.getTime()}
                        variant={isSelected ? "default" : "outline"} 
                        className="w-full justify-start text-left h-auto py-2" 
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {format(zonedTime, 'eeee, MMM d, yyyy')} <br/> 
                        {format(zonedTime, 'hh:mm a')} IST
                      </Button>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No available slots found for this mentor.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isBookingSession}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleBookSession} disabled={isBookingSession || !selectedSlot || isLoadingSlots}>
                {isBookingSession ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorProfile;
