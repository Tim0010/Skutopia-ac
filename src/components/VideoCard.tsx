import React from 'react';
import { Video } from '@/data/videoService'; // Import the Video type from service
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, ImageOff } from "lucide-react"; // Keep icons used in the reduced card and ImageOff for error state

// Define props based on videoService's Video type + necessary callback
interface VideoCardProps {
  video: Video;
  onVideoSelect: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoSelect }) => {
  const placeholderImageUrl = `/placeholder-video.png`; 
  const duration = "--:--"; // Duration is not in the Video type

  // State to track image loading error
  const [imgError, setImgError] = React.useState(false);

  // Use database thumbnail if available, otherwise placeholder
  const imageUrl = !imgError && video.thumbnail_url ? video.thumbnail_url : placeholderImageUrl;

  // Reset error state if video changes
  React.useEffect(() => {
    setImgError(false);
  }, [video.thumbnail_url]);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col border dark:border-gray-700">
      <div 
        className="relative aspect-video cursor-pointer bg-gray-200 dark:bg-gray-700" 
        onClick={() => onVideoSelect(video)}
      >
        {/* Conditionally render ImageOff icon on error */}
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <ImageOff className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        ) : (
          <img 
            src={imageUrl} // Use database URL or placeholder
            alt={video.title}
            className="w-full h-full object-cover"
            // Set error state if the image fails to load
            onError={() => setImgError(true)} 
            // It might be useful to reset error state on successful load if the src can change dynamically
            // onLoad={() => setImgError(false)} 
          />
        )}
        {/* Overlay Play Button */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-skutopia-600/80 rounded-full p-3">
            <Play className="h-6 w-6 text-white" />
          </div>
        </div>
        {/* Duration Placeholder */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <Clock className="h-3 w-3 mr-1" /> {duration}
        </div>
        {/* Grade Badge */}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {`Grade ${video.grade}`}
        </Badge>
      </div>
      {/* Card Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
          {video.title}
        </h3>
        {/* Subject & Topic */}
        <div className="text-sm text-skutopia-600 dark:text-skutopia-400 mb-3">
          {video.subject} {video.topic ? `• ${video.topic}` : ''}
        </div>
        
        {/* Created Date (using flex-grow to push button down) */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3 mb-3">
           Created: {new Date(video.created_at).toLocaleDateString()}
        </div>
        
        {/* Watch Button */}
        <Button 
          className="w-full bg-skutopia-600 hover:bg-skutopia-700 text-white mt-auto"
          onClick={(e) => {
            e.stopPropagation(); // Prevent Card click event
            onVideoSelect(video);
          }}
        >
          Watch Video
        </Button>
      </div>
    </Card>
  );
};

export default VideoCard;
