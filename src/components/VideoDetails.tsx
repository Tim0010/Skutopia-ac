import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Star, ChevronLeft, 
  ThumbsUp, MessageSquare, Share2, Bookmark,
  Play
} from "lucide-react";
import SimpleVideoPlayer from "./SimpleVideoPlayer";
import { Video } from "./VideoLibrary";

interface VideoDetailsProps {
  video: Video;
  relatedVideos?: Video[];
  onBack?: () => void;
  onVideoSelect?: (video: Video) => void;
}

export default function VideoDetails({
  video,
  relatedVideos = [],
  onBack,
  onVideoSelect
}: VideoDetailsProps) {
  // State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(video.views * 0.08));
  const [hasLiked, setHasLiked] = useState(false);
  const [commentCount] = useState(Math.floor(video.views * 0.02));
  const [showNotes, setShowNotes] = useState(false);
  
  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };
  
  // Toggle like
  const toggleLike = () => {
    if (hasLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setHasLiked(!hasLiked);
  };
  
  // Share video
  const shareVideo = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.log('Error copying link:', error));
    }
  };
  
  // Sample video notes
  const videoNotes = [
    {
      timestamp: "00:45",
      note: "Introduction to the key concepts covered in this lesson."
    },
    {
      timestamp: "03:12",
      note: "Definition of important terms and their applications."
    },
    {
      timestamp: "07:30",
      note: "First example problem demonstrating the concept in action."
    },
    {
      timestamp: "12:15",
      note: "Common mistakes to avoid when solving these types of problems."
    },
    {
      timestamp: "15:45",
      note: "Second example with a more complex application."
    },
    {
      timestamp: "20:30",
      note: "Summary of key takeaways from the lesson."
    }
  ];
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Video Player */}
        <div className="bg-black rounded-xl overflow-hidden shadow-xl mb-6">
          <SimpleVideoPlayer 
            videoUrl={video.videoUrl}
            thumbnailUrl={video.thumbnail}
          />
        </div>
        
        {/* Video Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {video.title}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{video.subject}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{video.duration}</span>
                </div>
                <div>
                  <span className="font-medium">{video.grade}</span>
                </div>
                <div>
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>{video.rating}</span>
                </div>
              </div>
            </div>
            {onBack && (
              <button 
                onClick={onBack}
                className="text-skutopia-600 hover:text-skutopia-700 dark:text-skutopia-400 dark:hover:text-skutopia-300 font-medium flex items-center"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </button>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                hasLiked 
                  ? "bg-skutopia-100 text-skutopia-700 dark:bg-skutopia-900 dark:text-skutopia-300" 
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${hasLiked ? "fill-skutopia-500" : ""}`} />
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{commentCount.toLocaleString()}</span>
            </button>
            <button 
              onClick={shareVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
            <button 
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isBookmarked 
                  ? "bg-skutopia-100 text-skutopia-700 dark:bg-skutopia-900 dark:text-skutopia-300" 
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-skutopia-500" : ""}`} />
              <span>{isBookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {video.description}
            </p>
          </div>
          
          {/* Instructor Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instructor
            </h2>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg mr-4">
                {video.instructor.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {video.instructor}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {video.subject} Teacher
                </p>
              </div>
            </div>
          </div>
          
          {/* Video Notes */}
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              <span>Video Notes</span>
              <ChevronLeft className={`h-5 w-5 transform transition-transform ${showNotes ? 'rotate-90' : '-rotate-90'}`} />
            </button>
            {showNotes && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <ul className="space-y-3">
                  {videoNotes.map((note, index) => (
                    <li key={index} className="flex">
                      <span className="text-skutopia-600 dark:text-skutopia-400 font-mono w-16">
                        {note.timestamp}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {note.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Related Videos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedVideos.map((relatedVideo) => (
                <div
                  key={relatedVideo.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
                >
                  <div 
                    className="relative aspect-video cursor-pointer" 
                    onClick={() => onVideoSelect && onVideoSelect(relatedVideo)}
                  >
                    <img 
                      src={relatedVideo.thumbnail} 
                      alt={relatedVideo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-skutopia-600/80 rounded-full p-3">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {relatedVideo.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {relatedVideo.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="mr-2">{relatedVideo.subject}</span>
                      <span className="mr-2">•</span>
                      <span>{relatedVideo.grade}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{relatedVideo.rating}</span>
                      </div>
                      <span>{relatedVideo.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
