import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  SkipBack, SkipForward, Settings, Loader
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

export default function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  autoPlay = false,
  onEnded,
  className = ""
}: VideoPlayerProps) {
  // Player state
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hide controls after inactivity
  const hideControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsTimeout();
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    try {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        // Log before attempting to play
        console.log("Attempting to play video:", videoUrl);
        
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playback started successfully");
              setPlaying(true);
              hideControlsTimeout();
            })
            .catch(error => {
              console.error("Play error:", error);
              // Try playing again with user interaction
              const userPrompt = confirm("Video playback failed. Try again?");
              if (userPrompt) {
                videoRef.current?.play()
                  .then(() => {
                    setPlaying(true);
                    hideControlsTimeout();
                  })
                  .catch(e => {
                    console.error("Second play attempt failed:", e);
                    setError("Failed to play video. Please try again later.");
                    setPlaying(false);
                  });
              } else {
                setError("Failed to play video. Please try again.");
                setPlaying(false);
              }
            });
        } else {
          // For browsers that don't return a promise
          setPlaying(true);
          hideControlsTimeout();
        }
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      setError("An error occurred while trying to play the video.");
      setPlaying(false);
    }
    
    setShowControls(true);
  };
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    setCurrentTime(videoRef.current.currentTime);
  };
  
  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    
    console.log("Video metadata loaded successfully");
    setDuration(videoRef.current.duration);
    setLoading(false);
    
    // If autoPlay is true, start playing once metadata is loaded
    if (autoPlay && videoRef.current) {
      console.log("Auto-playing video after metadata loaded");
      togglePlay();
    }
  };
  
  // Handle video end
  const handleEnded = () => {
    setPlaying(false);
    setShowControls(true);
    
    if (onEnded) {
      onEnded();
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (muted) {
      videoRef.current.volume = volume;
    } else {
      videoRef.current.volume = 0;
    }
    
    setMuted(!muted);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!fullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Set playback rate
  const setSpeed = (rate: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };
  
  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.min(Math.max(0, currentTime + seconds), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Reset player state when videoUrl changes
  useEffect(() => {
    console.log("Video URL changed:", videoUrl);
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setPlaying(autoPlay);
    
    // If video element exists, load the new source
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl, autoPlay]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div 
      ref={videoContainerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          console.error("Video error occurred");
          setError("Failed to load video. Please check your connection and try again.");
          setLoading(false);
        }}
        onClick={togglePlay}
        poster={thumbnailUrl}
        preload="auto"
        src={videoUrl}
        playsInline
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white flex flex-col items-center">
            <Loader className="h-10 w-10 animate-spin mb-2" />
            <span>Loading video...</span>
          </div>
        </div>
      )}
      
      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4 max-w-md">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-skutopia-600 hover:bg-skutopia-700 px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Play/Pause Overlay (shows when paused) */}
      {!playing && !loading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-skutopia-600/80 rounded-full p-4">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </div>
      )}
      
      {/* Controls */}
      {showControls && !loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-2 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-400 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-skutopia-600"
            />
          </div>
          
          {/* Controls Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button onClick={togglePlay} className="text-white">
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              {/* Skip Buttons */}
              <button onClick={() => skipTime(-10)} className="text-white">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={() => skipTime(10)} className="text-white">
                <SkipForward className="h-5 w-5" />
              </button>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white">
                  {muted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-400 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-skutopia-600"
                />
              </div>
              
              {/* Time Display */}
              <div className="text-white text-sm">
                <span>{formatTime(currentTime)}</span>
                <span> / </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Settings Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white"
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-md shadow-lg p-2 min-w-32">
                    <div className="text-white text-sm mb-1">Playback Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setSpeed(rate)}
                        className={`block w-full text-left px-3 py-1 text-sm rounded ${
                          playbackRate === rate
                            ? "bg-skutopia-600 text-white"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {rate === 1 ? "Normal" : `${rate}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="text-white">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
