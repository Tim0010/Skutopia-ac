import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  users: number;
  mentors: number;
  videos: number;
  flashcards: number;
  quizzes: number;
  pastPapers: number;
  scholarships: number;
  activity: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  user: string;
  timestamp: string;
}

/**
 * Fetches all statistics for the admin dashboard
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Get total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get mentors count
  const { count: mentorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mentor');

  // Get videos count
  const { count: videosCount } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true });

  // For tables that might not exist yet, we'll return placeholder values
  // In a real implementation, you would add queries for these tables once they exist
  
  return {
    users: totalUsers || 0,
    mentors: mentorsCount || 0,
    videos: videosCount || 0,
    flashcards: 0, // Placeholder - add real query when table exists
    quizzes: 0,    // Placeholder - add real query when table exists
    pastPapers: 0, // Placeholder - add real query when table exists
    scholarships: 0, // Placeholder - add real query when table exists
    activity: 0,   // This would be a count of recent activities
  };
};

/**
 * Fetches recent activity for the admin dashboard
 */
export const fetchRecentActivity = async (limit: number = 5): Promise<RecentActivity[]> => {
  // Get recent user registrations
  const { data: newUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Get recent video uploads
  const { data: newVideos, error: videosError } = await supabase
    .from('videos')
    .select('id, title, created_at, author')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Get recent video views/progress
  const { data: recentViews, error: viewsError } = await supabase
    .from('users_videos')
    .select(`
      id, 
      last_watched,
      progress,
      videos(title),
      profiles(name)
    `)
    .order('last_watched', { ascending: false })
    .limit(limit);

  if (usersError || videosError || viewsError) {
    console.error("Error fetching recent activity:", usersError || videosError || viewsError);
    return [];
  }

  // Combine and format the activities
  const activities: RecentActivity[] = [];

  // Add new user registrations
  newUsers?.forEach(user => {
    activities.push({
      id: `user-${user.id}`,
      type: 'user_registration',
      title: 'New user registered',
      user: user.name || 'Unknown user',
      timestamp: user.created_at || '',
    });
  });

  // Add new video uploads
  newVideos?.forEach(video => {
    activities.push({
      id: `video-${video.id}`,
      type: 'video_upload',
      title: `New video uploaded: ${video.title}`,
      user: video.author || 'Unknown author',
      timestamp: video.created_at || '',
    });
  });

  // Add recent video views
  recentViews?.forEach(view => {
    activities.push({
      id: `view-${view.id}`,
      type: 'video_progress',
      title: `Watched video: ${view.videos?.title || 'Unknown video'}`,
      user: view.profiles?.name || 'Unknown user',
      timestamp: view.last_watched || '',
    });
  });

  // Sort all activities by timestamp (newest first)
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

/**
 * Formats a timestamp into a human-readable relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      try {
        // Fetch recent video views
        const { data: recentViews, error: viewsError } = await supabase
          .from('users_videos')
          .select(`
            *,
            video:video_id(*),
            user:user_id(*)
          `)
          .order('last_watched', { ascending: false })
          .limit(5);
          
        if (viewsError) throw viewsError;
        
        // Map the data to a more usable format with proper null checking
        const formattedViews = recentViews.map(item => ({
          id: item.id,
          type: 'video_view',
          timestamp: item.last_watched,
          videoTitle: item.video?.title || 'Unknown video',
          userName: item.user?.name || 'Unknown user',
          progress: item.progress
        }));
        
        // Fetch other activity types and combine them
        const { data: newUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const { data: newVideos, error: videosError } = await supabase
          .from('videos')
          .select('id, title, created_at, author')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const { data: newQuizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (usersError || videosError || quizzesError) {
          console.error("Error fetching recent activity:", usersError || videosError || quizzesError);
          return [];
        }
        
        const activities: RecentActivity[] = [];
        
        // Add new user registrations
        newUsers?.forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user_registration',
            title: 'New user registered',
            user: user.name || 'Unknown user',
            timestamp: user.created_at || '',
          });
        });
        
        // Add new video uploads
        newVideos?.forEach(video => {
          activities.push({
            id: `video-${video.id}`,
            type: 'video_upload',
            title: `New video uploaded: ${video.title}`,
            user: video.author || 'Unknown author',
            timestamp: video.created_at || '',
          });
        });
        
        // Add new quizzes
        newQuizzes?.forEach(quiz => {
          activities.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz',
            title: `New quiz created: ${quiz.title}`,
            user: quiz.author || 'Unknown author',
            timestamp: quiz.created_at || '',
          });
        });
        
        // Sort all activities by timestamp (newest first)
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
