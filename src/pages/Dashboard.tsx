import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { fetchDashboardData } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, SendHorizontal, Loader2, Activity, Award, Video, BookOpen, FileText, Pencil, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

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
  recentActivities: ActivityItem[]; // Add the new field for activities
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

      if (data) {
        const loadedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }));

        if (loadedMessages.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: "Hi there! I'm Muzanga, your friendly mentor. How can I help you today?",
              timestamp: new Date()
            }
          ]);
        } else {
          setMessages(loadedMessages);
        }
        console.log("Chat history loaded:", loadedMessages.length, "messages");
      }
    } catch (error: any) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history.");
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi there! I'm Muzanga, your friendly mentor. How can I help you today?",
            timestamp: new Date()
          }
        ]);
      }
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
    if (!input.trim() || loading) return;

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
        {
          body: { messages: historyToSend.map(({ role, content }) => ({ role, content })) },
        }
      );

      if (invokeError) {
        if (invokeError instanceof Error) {
          throw new Error(invokeError.message || 'Function invocation failed');
        } else {
          console.error("Non-Error invocation error:", invokeError);
          throw new Error('An unknown error occurred during function invocation.');
        }
      }
      if (responseData?.error) {
        throw new Error(responseData.error);
      }
      const reply = responseData?.reply;
      if (typeof reply !== 'string') {
        console.error('Invalid reply format received:', responseData);
        throw new Error("Received an invalid reply from Muzanga.");
      }

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
        content: "Sorry, I encountered an error connecting to my brain. Please try again later.",
        timestamp: new Date()
      };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="flex flex-col h-[500px] shadow-lg rounded-lg">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="flex items-center text-xl font-semibold text-gray-700 dark:text-white">
          <BrainCircuit className="h-6 w-6 mr-2 text-skutopia-600" /> Muzanga AI Assistant
        </CardTitle>
        <CardDescription>Your friendly mentor for education and guidance.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {historyLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <p className="ml-2 text-gray-500">Loading chat history...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.id || i}`}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                      ? "bg-skutopia-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"}`
                    }
                  >
                    {msg.content}
                    <span className="text-xs opacity-70 ml-2 pt-1 float-right clear-both">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-lg px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
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
          <Button onClick={sendMessage} disabled={loading || historyLoading || !input.trim()} size="icon">
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
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setFetchError(null);

    // Fetch real data from Supabase
    fetchDashboardData(user.id, {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl
    })
      .then(data => {
        setDashboardData(data);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        setFetchError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [user]);

  if (loadingData) return <p className="p-6 text-center">Loading dashboard data...</p>;
  if (fetchError) return <p className="p-6 text-center text-red-600">Error loading dashboard: {fetchError}</p>;
  if (!user) return <p className="p-6 text-center">User not found.</p>;

  // Helper to get icon based on activity type
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'quiz_start':
      case 'quiz_complete':
        return <Award size={18} className="mr-3 text-blue-500" />;
      case 'video_watch':
        return <Video size={18} className="mr-3 text-red-500" />;
      case 'flashcard_session':
        return <BookOpen size={18} className="mr-3 text-green-500" />;
      case 'material_view':
        return <FileText size={18} className="mr-3 text-purple-500" />;
      default:
        return <Activity size={18} className="mr-3 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
      {/* Header Section */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800/50 shadow rounded-lg flex items-center space-x-4 border dark:border-gray-700/50">
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt={`${user.name}'s Avatar`}
          className="w-16 h-16 rounded-full border-2 border-skutopia-500"
          onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">Let's continue your learning journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Chat & Goals) */}
        <div className="lg:col-span-2 space-y-6">
          <MuzangaChat />

          {/* Daily Goals/Insights - Placeholder */}
          <Card className="p-6 shadow-lg rounded-lg dark:bg-gray-800/50 border dark:border-gray-700/50">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-white">💡 Daily Goals & Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily learning goals and see personalized insights as you progress. (Feature coming soon!)</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sessions & Quick Actions) */}
        <div className="space-y-6">
          {/* --- Recent Activities Card (Corrected JSX Structure) --- */}
          <Card className="shadow-lg rounded-lg dark:bg-gray-800/50 border dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-white flex items-center">
                <Activity size={20} className="mr-2 text-skutopia-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-60 pr-2">
                <div className="space-y-3">
                  {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity) => (
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
              </ScrollArea>
            </CardContent>
          </Card>

          {/* --- Quick Actions Card (Improved Layout) --- */}
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
  );
};

export default Dashboard;