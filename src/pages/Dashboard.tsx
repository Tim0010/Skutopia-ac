import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, SendHorizontal, Loader2, Activity, Award, Video, BookOpen, FileText, Pencil, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import UserProfileForm from "@/components/UserProfileForm";

// Types for the data
interface Progress {
  id: string;
  user_id: string;
  subject: string;
  quizzes_completed: number;
  videos_watched: number;
  flashcards_used: number;
  progress_percent: number;
  last_updated: string;
}

interface Session {
  id: string;
  user_id: string;
  mentor_id: string;
  session_time: string;
  session_type: 'mentorship' | 'live_class';
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

// --- Define structure for a Recent Activity Item ---
interface ActivityItem {
  id: string; // Unique ID for the key
  type: 'quiz_start' | 'quiz_complete' | 'video_watch' | 'flashcard_session' | 'material_view'; // Type of activity
  description: string; // Text description (e.g., "Completed 'Algebra Basics' Quiz")
  timestamp: string; // ISO timestamp string from DB
  link?: string; // Optional link to the relevant content (e.g., /quizzes/123)
}

interface DashboardData {
  user: any;
  progress: Progress[];
  sessions: Session[];
  recentActivities: ActivityItem[];
}

// --- Muzanga Chat Component (Integrated) ---
interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const MuzangaChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    console.log("Fetching chat history for user:", user.id);
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const loadedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(loadedMessages);
        console.log("Chat history loaded:", loadedMessages.length, "messages");
      } else {
        // Initialize with greeting if no history and no error
        setMessages([
          {
            role: "assistant",
            content: "Hi there! I'm Muzanga, your friendly mentor. How can I help you today?",
            timestamp: new Date()
          }
        ]);
        console.log("No chat history found, initialized with greeting.");
      }
    } catch (error: any) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history.");
      // Initialize with greeting even if fetch fails
      setMessages([
        {
          role: "assistant",
          content: "Hi there! I'm Muzanga, your friendly mentor. How can I help you today?",
          timestamp: new Date()
        }
      ]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages]);

  const saveMessageToDb = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
        });
      if (error) {
        console.error("Error saving message:", error);
      }
    } catch (err) {
      console.error("Exception saving message:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user?.id) return;
    const userMessageContent = input;
    const userMessageForState: ChatMessage = {
      role: "user",
      content: userMessageContent,
      timestamp: new Date()
    };
    const newMessages = [...messages, userMessageForState];
    setMessages(newMessages);
    setLoading(true);
    setInput("");
    saveMessageToDb({ role: 'user', content: userMessageContent });

    try {
      const historyToSend = newMessages.slice(-10);
      console.log(`Invoking edge function with ${historyToSend.length} messages...`);
      const { data: responseData, error: invokeError } = await supabase.functions.invoke(
        'ask-muzanga',
        { body: { messages: historyToSend.map(({ role, content }) => ({ role, content })) } }
      );

      if (invokeError) throw new Error(invokeError.message || 'Function invocation failed');
      if (responseData?.error) throw new Error(responseData.error);
      const reply = responseData?.reply;
      if (typeof reply !== 'string') throw new Error("Received an invalid reply from Muzanga.");

      const assistantMessageForState: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date()
      };
      setMessages(currentMessages => [...currentMessages, assistantMessageForState]);
      saveMessageToDb({ role: 'assistant', content: reply });

    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      toast.error(`Error: ${error.message || "Could not get reply from Muzanga."}`);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Card className="flex flex-col shadow-lg rounded-lg h-[600px]">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="flex items-center text-xl font-semibold text-gray-700 dark:text-white">
          <BrainCircuit className="h-6 w-6 mr-2 text-skutopia-600" /> Muzanga AI Assistant
        </CardTitle>
        <CardDescription>Your friendly mentor for education and guidance.</CardDescription>
      </CardHeader>
      <CardContent ref={scrollAreaRef} className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : messages.map((msg, i) => (
            <div
              key={`${msg.id || i}-chat`}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`relative max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                  ? "bg-skutopia-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
                  }`}
              >
                {msg.content}
                <span className="text-xs opacity-70 ml-2 pt-1 float-right clear-both">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {loading && !historyLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-lg px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t dark:border-gray-700 p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Ask Muzanga anything..."
            disabled={loading || historyLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || historyLoading || !input.trim()}
            size="icon"
            className="bg-skutopia-600 text-white hover:bg-skutopia-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
// --- End Muzanga Chat Component ---

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Effect to determine if the profile form should be shown
  // This now DIRECTLY uses the profileCompleted status from AuthContext
  useEffect(() => {
    if (user && !authLoading) { // Check user exists and auth loading is complete
      console.log("Dashboard: Checking profile completion status from context:", user.profileCompleted);
      setShowProfileForm(!user.profileCompleted);
    } else if (!user && !authLoading) {
      // Handle case where user is definitely not logged in (after loading)
      setShowProfileForm(false); // Don't show form if not logged in
    }
    // Don't run if auth is still loading
  }, [user, authLoading]);

  // Effect to fetch other dashboard data like recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) {
        setLoadingActivities(false);
        return;
      }
      setLoadingActivities(true);
      try {
        const { data, error } = await supabase
          .from('recent_activities' as any) // Use 'as any' for consistency
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (error) {
          // Gracefully handle if recent_activities doesn't exist yet
          if (error.code === '42P01') {
            console.warn("'recent_activities' table not found. Skipping fetch.");
            setRecentActivities([]);
          } else {
            throw error; // Throw other errors
          }
        } else {
          setRecentActivities(data || []);
        }
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        toast.error("Failed to load recent activities");
        setRecentActivities([]); // Set empty on error
      } finally {
        setLoadingActivities(false);
      }
    };

    // Only fetch if user exists
    if (user?.id) {
      fetchActivities();
    }
    // Re-fetch when user changes
  }, [user]);

  if (authLoading) return <p className="p-6 text-center">Loading user data...</p>;
  if (!user) return <p className="p-6 text-center">User not found. Please log in.</p>;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'quiz_start':
      case 'quiz_complete': return <Award size={18} className="mr-3 text-blue-500" />;
      case 'video_watch': return <Video size={18} className="mr-3 text-red-500" />;
      case 'flashcard_session': return <BookOpen size={18} className="mr-3 text-green-500" />;
      case 'material_view': return <FileText size={18} className="mr-3 text-purple-500" />;
      default: return <Activity size={18} className="mr-3 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileForm
        isOpen={showProfileForm}
        onClose={() => setShowProfileForm(false)}
        userId={user.id}
      />
      <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
        <div className="mb-8 p-4 bg-white dark:bg-gray-800/50 shadow rounded-lg flex items-center space-x-4 border dark:border-gray-700/50">
          <img
            src={user.avatarUrl || '/default-avatar.png'}
            alt={`${user.name}'s Avatar`}
            className="w-16 h-16 rounded-full border-2 border-blue-500"
            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name}! 👋</h1>
            <p className="text-gray-600">Let's continue your learning journey.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MuzangaChat />

            <Card className="p-6 shadow-lg rounded-lg dark:bg-gray-800/50 border dark:border-gray-700/50">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold text-gray-700 dark:text-white">💡 Daily Goals & Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily learning goals and see personalized insights as you progress. (Feature coming soon!)</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg rounded-lg dark:bg-gray-800/50 border dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700 dark:text-white flex items-center">
                  <Activity size={20} className="mr-2 text-skutopia-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {loadingActivities ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md shadow-sm border-l-4 border-gray-300 dark:border-gray-600">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                          {activity.link && (
                            <Link to={activity.link} className="text-xs text-skutopia-600 hover:underline dark:text-skutopia-400">
                              View Details
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <span className="text-3xl">📊</span>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Recent Activity Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                          Start learning by taking quizzes, watching videos, or using flashcards to see your activities here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg dark:bg-gray-800/50 border dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700 dark:text-white flex items-center">
                  <span role="img" aria-label="rocket" className="mr-2">🚀</span>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center space-y-1.5 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to="/quizzes">
                      <Pencil size={24} className="mb-1 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Take Quiz</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center space-y-1.5 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to="/videos">
                      <Video size={24} className="mb-1 text-red-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Watch Videos</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center space-y-1.5 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to="/flashcards">
                      <BookOpen size={24} className="mb-1 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flashcards</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center space-y-1.5 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to="/mentors">
                      <Users size={24} className="mb-1 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Book Mentor</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;