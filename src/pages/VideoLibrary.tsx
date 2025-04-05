import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useVideos, { VideoType } from '@/hooks/useVideos';
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer';
import { useAuth } from '@/contexts/AuthContext';

const VideoLibrary = () => {
  const { fetchVideos, loading, searchVideos } = useVideos();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadVideos = async () => {
      const result = await fetchVideos();
      setVideos(result);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(result
        .filter(video => video.category)
        .map(video => video.category as string)
      )];
      setCategories(uniqueCategories);
    };

    loadVideos();
  }, [fetchVideos]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchVideos(searchQuery);
      setVideos(results);
    } else {
      const allVideos = await fetchVideos();
      setVideos(allVideos);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Video Library</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardContent>
                <SimpleVideoPlayer video={video} />
                <h2 className="text-lg font-semibold mt-2">{video.title}</h2>
                <p className="text-sm text-gray-500">Category: {video.category || 'Uncategorized'}</p>
                <p className="text-sm">Author: {video.author || 'Unknown'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
