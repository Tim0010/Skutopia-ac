
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface SimpleVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ videoUrl, thumbnailUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log("SimpleVideoPlayer rendering with URL:", videoUrl);

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Log the video URL for debugging
      console.log("Attempting to play video URL:", videoUrl);
      
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video started playing successfully");
              setIsPlaying(true);
            })
            .catch(err => {
              console.error("Error playing video:", err);
              setError("Failed to play video. Try using the browser's native controls below.");
              setIsPlaying(false);
            });
        }
      } catch (err) {
        console.error("Exception during play:", err);
        setError("An error occurred while trying to play the video.");
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle video errors
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video error event triggered:", e);
    setError("Failed to load video. This may be due to CORS restrictions or the video source being unavailable.");
    setIsLoading(false);
  };
  
  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    console.log("Video metadata loaded successfully");
    setIsLoading(false);
  };
  
  // Handle canplay event
  const handleCanPlay = () => {
    console.log("Video can play now");
    setError(null);
    setIsLoading(false);
  };

  // Reset player state when videoUrl changes
  useEffect(() => {
    console.log("Video URL changed to:", videoUrl);
    setError(null);
    setIsPlaying(false);
    setIsLoading(true);
    
    // Ensure the video element loads the new source
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Video Element - Using controls and direct src for maximum compatibility */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={thumbnailUrl}
        controls={true}
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        muted={isMuted}
        playsInline
        src={videoUrl}
      >
        Your browser does not support HTML5 video playback.
      </video>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skutopia-600"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center">
          <p>{error}</p>
        </div>
      )}

      {/* Custom Controls - Only show when not using browser controls */}
      {!videoRef.current?.controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Volume Button */}
            <button 
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Large Play Button Overlay (when not playing and not controlled by browser) */}
      {!isPlaying && !error && !videoRef.current?.controls && !isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-blue-600/80 rounded-full p-6">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoPlayer;
