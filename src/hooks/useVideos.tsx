
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoType {
  id: string;
  title: string;
  description: string;
  category: string | null;
  duration: string | null;
  author: string | null;
  url: string;
  thumbnail_url: string | null;
  views: number | null;
  created_at?: string;
  updated_at?: string;
}

interface VideoFromDB {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  duration: string | null;
  category: string | null;
  author: string | null;
  views: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const useVideos = () => {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoType[]>([]);

  // Get all videos
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setVideos(data as VideoType[]);
      return data as VideoType[];
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single video by id
  const getVideo = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update view count
      incrementViewCount(id).catch(err => 
        console.error('Failed to increment view count:', err)
      );
      
      return data as VideoType;
    } catch (error: any) {
      console.error('Error fetching video:', error);
      toast.error('Failed to fetch video: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Increment view count
  const incrementViewCount = async (videoId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'increment_video_views',
        { video_id: videoId }
      );

      if (error) {
        throw error;
      }

      // Update local state with the new view count if needed
      setVideos((prevVideos) => 
        prevVideos.map((video) => 
          video.id === videoId 
            ? { ...video, views: (video.views || 0) + 1 } 
            : video
        )
      );

      return true;
    } catch (error) {
      console.error("Error incrementing view count:", error);
      return false;
    }
  };

  // Add new video
  const addVideo = useCallback(async (video: Omit<VideoType, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([video])
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success('Video added successfully');
      return data[0] as VideoType;
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update video
  const updateVideo = useCallback(async (id: string, updates: Partial<VideoType>) => {
    setLoading(true);
    try {
      // Convert the updates to match the database schema
      const dbUpdates = {
        ...updates
      };
      
      const { data, error } = await supabase
        .from('videos')
        .update(dbUpdates)
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success('Video updated successfully');
      return data[0] as VideoType;
    } catch (error: any) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete video
  const deleteVideo = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Video deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter videos by category
  const getVideosByCategory = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data as VideoType[];
    } catch (error: any) {
      console.error('Error fetching videos by category:', error);
      toast.error('Failed to fetch videos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search videos
  const searchVideos = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
        
      if (error) {
        throw error;
      }
      
      return data as VideoType[];
    } catch (error: any) {
      console.error('Error searching videos:', error);
      toast.error('Failed to search videos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    videos,
    fetchVideos,
    getVideo,
    addVideo,
    updateVideo,
    deleteVideo,
    incrementViewCount,
    getVideosByCategory,
    searchVideos
  };
};

export default useVideos;
