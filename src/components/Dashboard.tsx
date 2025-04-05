import { useEffect, useState } from 'react';
import { fetchDashboardData } from '../lib/api'; // Adjust path if needed

// Define interfaces for the data shapes
interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  overall_progress: number;
  created_at: string;
}

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
  mentor_id: string; // Assuming you have a mentors table
  session_time: string;
  session_type: 'mentorship' | 'live_class';
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

interface DashboardData {
  user: User | null;
  progress: Progress[];
  sessions: Session[];
}

interface DashboardProps {
  userId: string; // Pass the user ID as a prop
}

export default function Dashboard({ userId }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchDashboardData(userId)
      .then(data => {
        setDashboardData(data);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  if (!dashboardData || !dashboardData.user) return <p className="p-6 text-center">No dashboard data found.</p>;

  const { user, progress, sessions } = dashboardData;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="mb-8 p-4 bg-white shadow rounded-lg flex items-center space-x-4">
        <img
          src={user.avatar_url || '/default-avatar.png'} // Provide a fallback default avatar
          alt={`${user.name}'s Avatar`}
          className="w-16 h-16 rounded-full border-2 border-blue-500"
          onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} // Handle image load error
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">Let's continue your learning journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Progress & Goals) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Learning Progress</h2>
            <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Overall Progress:</p>
                 {/* Basic Progress Bar Example */}
                 <div className="w-2/3 bg-gray-200 rounded-full h-4">
                   <div
                     className="bg-blue-600 h-4 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
                     style={{ width: `${user.overall_progress}%` }}>
                       {user.overall_progress}%
                   </div>
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.length > 0 ? (
                progress.map((subject) => (
                  <div key={subject.id} className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-800">{subject.subject}</h3>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>Quizzes Completed: <span className="font-medium">{subject.quizzes_completed}</span></p>
                      <p>Videos Watched: <span className="font-medium">{subject.videos_watched}</span></p>
                      <p>Flashcards Used: <span className="font-medium">{subject.flashcards_used}</span></p>
                    </div>
                     {/* Subject Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${subject.progress_percent}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-green-600 mt-1">{subject.progress_percent}%</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 md:col-span-2">No progress data available yet.</p>
              )}
            </div>
          </div>

            {/* Daily Goals/Insights - Placeholder */}
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">💡 Daily Goals & Insights</h2>
              {/* Add content for goals/insights here */}
              <p className="text-sm text-gray-500">Study insights and daily goals coming soon!</p>
          </div>
        </div>

        {/* Right Column (Sessions & Quick Actions) */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📅 Upcoming Sessions</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="p-3 bg-gray-100 rounded-md shadow-sm border-l-4 border-purple-500">
                    <p className="font-semibold text-purple-800">{session.session_type === "mentorship" ? "Mentorship Session" : "Live Class"}</p>
                    <p className="text-sm text-gray-600">{new Date(session.session_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className={`text-sm font-medium ${session.status === 'scheduled' ? 'text-yellow-600' : session.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>Status: {session.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming sessions scheduled.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-white shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">🚀 Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition duration-200 flex items-center justify-center space-x-2">
                      <span role="img" aria-label="quiz">📖</span><span>Take Quiz</span>
                  </button>
                  <button className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition duration-200 flex items-center justify-center space-x-2">
                     <span role="img" aria-label="video">🎥</span><span>Watch Videos</span>
                  </button>
                  <button className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition duration-200 flex items-center justify-center space-x-2">
                     <span role="img" aria-label="flashcards">📚</span><span>Flashcards</span>
                  </button>
                  <button className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition duration-200 flex items-center justify-center space-x-2">
                      <span role="img" aria-label="mentor">🤝</span><span>Book Mentor</span>
                  </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
