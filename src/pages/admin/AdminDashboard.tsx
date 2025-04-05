import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Video, BookOpen, FileQuestion, FileText, Award, Activity, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchDashboardStats, fetchRecentActivity, formatRelativeTime, DashboardStats, RecentActivity } from "@/services/adminDashboard";
import { getMentorsCount, getPendingSessions, updateSessionStatus } from '@/services/mentorService';

// Define a basic Session type locally for now
interface Session {
  id: string;
  student_id: string;
  mentor_id: string;
  session_date: string; // or Date
  session_time: string;
  status: string;
  created_at: string; // or Date
  // Add nested student/mentor types if needed based on getPendingSessions select
  student?: { id: string; name: string; avatar_url?: string };
  mentor?: { id: string; name: string; avatar_url?: string };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    mentors: 0,
    videos: 0,
    flashcards: 0,
    quizzes: 0,
    pastPapers: 0,
    scholarships: 0,
    activity: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMentors, setTotalMentors] = useState<number | null>(null);
  const [pendingSessions, setPendingSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const dashboardStats = await fetchDashboardStats();
        const activities = await fetchRecentActivity(5);
        const count = await getMentorsCount();
        const sessions = await getPendingSessions();
        setStats(dashboardStats);
        setRecentActivities(activities);
        setTotalMentors(count);
        setPendingSessions(sessions); // Directly set state, assuming service handles errors
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setPendingSessions([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statItems = [
    { 
      name: "Users",
      value: stats.users.toString(),
      icon: <Users className="h-6 w-6 text-blue-500" />,
      path: "/admin/users",
      color: "blue"
    },
    { 
      name: "Mentors", 
      value: totalMentors !== null ? totalMentors.toString() : 'N/A', 
      icon: <GraduationCap className="h-6 w-6 text-indigo-500" />,
      path: "/admin/mentors",
      color: "indigo"
    },
    { 
      name: "Videos", 
      value: stats.videos.toString(), 
      icon: <Video className="h-6 w-6 text-red-500" />,
      path: "/admin/videos",
      color: "red"
    },
    { 
      name: "Flashcards", 
      value: stats.flashcards.toString(), 
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      path: "/admin/flashcards",
      color: "green"
    },
    { 
      name: "Quizzes", 
      value: stats.quizzes.toString(), 
      icon: <FileQuestion className="h-6 w-6 text-yellow-500" />,
      path: "/admin/quizzes",
      color: "yellow"
    },
    { 
      name: "Past Papers", 
      value: stats.pastPapers.toString(), 
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      path: "/admin/pastpapers",
      color: "purple"
    },
    { 
      name: "Scholarships", 
      value: stats.scholarships.toString(), 
      icon: <Award className="h-6 w-6 text-pink-500" />,
      path: "/admin/scholarships",
      color: "pink"
    },
    { 
      name: "Activity", 
      value: stats.activity.toString(), 
      icon: <Activity className="h-6 w-6 text-orange-500" />,
      path: "/admin/activity",
      color: "orange"
    }
  ];

  // Function to get the appropriate icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users size={18} className="text-blue-700" />;
      case 'video_upload':
        return <Video size={18} className="text-green-700" />;
      case 'video_progress':
        return <Activity size={18} className="text-orange-700" />;
      default:
        return <FileQuestion size={18} className="text-yellow-700" />;
    }
  };

  // Function to get the appropriate background color for activity type
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100';
      case 'video_upload':
        return 'bg-green-100';
      case 'video_progress':
        return 'bg-orange-100';
      default:
        return 'bg-yellow-100';
    }
  };

  const handleConfirmSession = async (sessionId: string) => {
    setIsUpdatingSession(sessionId);
    try {
      await updateSessionStatus(sessionId, 'confirmed');
      setPendingSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error("Failed to confirm session:", error);
    } finally {
      setIsUpdatingSession(null);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00573c] border-t-[#00573c]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {statItems.map((stat) => (
              <Link to={stat.path} key={stat.name}>
                <Card className={`hover:shadow-md transition-all hover:border-${stat.color}-200`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {stat.name}
                      {stat.icon}
                    </CardTitle>
                    <CardDescription>Total {stat.name.toLowerCase()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent activity found</p>
                ) : (
                  <ul className="space-y-4">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex space-x-3">
                          <span className={`flex-shrink-0 h-9 w-9 rounded-full ${getActivityBgColor(activity.type)} flex items-center justify-center`}>
                            {getActivityIcon(activity.type)}
                          </span>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatRelativeTime(activity.timestamp)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Sessions</CardTitle>
                <CardDescription>Pending session requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00573c] border-t-[#00573c]" />
                  </div>
                ) : pendingSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No pending sessions found</p>
                ) : (
                  <ul className="space-y-4">
                    {pendingSessions.map((session) => (
                      <li key={session.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex space-x-3">
                          <div>
                            <p className="font-medium">Student: {session.student?.name || 'N/A'} ({session.student?.id})</p>
                            <p className="text-sm text-muted-foreground">Mentor: {session.mentor?.name || 'N/A'} ({session.mentor?.id})</p>
                            <p className="text-sm text-muted-foreground">Date: {new Date(session.session_date).toLocaleDateString()} Time: {session.session_time}</p>
                          </div>
                        </div>
                        <button 
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => handleConfirmSession(session.id)}
                          disabled={isUpdatingSession === session.id}
                        >
                          {isUpdatingSession === session.id ? 'Confirming...' : 'Confirm Session'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
