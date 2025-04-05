import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, Search, Filter, ChevronDown, 
  Star, BookOpen, Clock, BookMarked
} from "lucide-react";
import SimpleVideoPlayer from "./SimpleVideoPlayer";

// Define video interface
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  subject: string;
  grade: string;
  views: number;
  rating: number;
  uploadDate: string;
  instructor: string;
  category?: string;
  tags?: string[];
}

interface VideoLibraryProps {
  videos: Video[];
  title?: string;
  description?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  onVideoSelect?: (video: Video) => void;
  layout?: "grid" | "list" | "featured";
  columns?: 1 | 2 | 3 | 4;
}

export default function VideoLibrary({
  videos,
  title = "Video Library",
  description,
  showFilters = true,
  showSearch = true,
  onVideoSelect,
  layout = "grid",
  columns = 3
}: VideoLibraryProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">("popular");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  
  // Unique subjects and grades for filters
  const subjects = Array.from(new Set(videos.map(video => video.subject)));
  const grades = Array.from(new Set(videos.map(video => video.grade)));
  
  // Filter videos based on search, subject, and grade
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !subjectFilter || video.subject === subjectFilter;
    const matchesGrade = !gradeFilter || video.grade === gradeFilter;
    
    return matchesSearch && matchesSubject && matchesGrade;
  }).sort((a, b) => {
    if (sortBy === "popular") return b.views - a.views;
    if (sortBy === "newest") return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    return b.rating - a.rating;
  });
  
  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    console.log("Video selected in VideoLibrary:", video.title);
    console.log("Video URL being selected:", video.videoUrl);
    setSelectedVideo(video);
    
    if (onVideoSelect) {
      console.log("Calling parent onVideoSelect with video:", video.id);
      onVideoSelect(video);
    } else {
      console.warn("No onVideoSelect handler provided to VideoLibrary");
    }
    
    // Find related videos
    const related = videos.filter(v => 
      v.id !== video.id && 
      (v.subject === video.subject || v.grade === video.grade)
    ).slice(0, 3);
    
    setRelatedVideos(related);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSubjectFilter(null);
    setGradeFilter(null);
  };
  
  // Video card component
  const VideoCard = ({ video, size = "normal" }: { video: Video, size?: "small" | "normal" | "large" }) => {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 ${
          size === "large" ? "col-span-2 row-span-2" : ""
        }`}
      >
        <div 
          className="relative aspect-video cursor-pointer" 
          onClick={() => {
            console.log("Thumbnail clicked for video:", video.title);
            handleVideoSelect(video);
          }}
        >
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-skutopia-600/80 rounded-full p-3">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className={`font-bold text-gray-900 dark:text-white mb-1 ${
            size === "small" ? "text-sm line-clamp-1" : "line-clamp-2"
          }`}>
            {video.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="mr-2">{video.subject}</span>
            <span className="mr-2">•</span>
            <span>{video.grade}</span>
          </div>
          {size !== "small" && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {video.description}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{video.rating}</span>
            </div>
            <span>{video.views.toLocaleString()} views</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent double firing with parent click
              console.log("Watch Video button clicked for:", video.title);
              handleVideoSelect(video);
            }}
            className="w-full bg-skutopia-600 hover:bg-skutopia-700 text-white py-2 rounded-md flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Video
          </button>
        </div>
      </motion.div>
    );
  };
  
  // Video list item component
  const VideoListItem = ({ video }: { video: Video }) => {
    return (
      <motion.div
        whileHover={{ x: 5 }}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 p-4 flex gap-4"
      >
        <div 
          className="relative w-40 flex-shrink-0 cursor-pointer" 
          onClick={() => handleVideoSelect(video)}
        >
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
            <div className="bg-skutopia-600/80 rounded-full p-2">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {video.duration}
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {video.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="mr-2">{video.subject}</span>
            <span className="mr-2">•</span>
            <span className="mr-2">{video.grade}</span>
            <span className="mr-2">•</span>
            <span>{video.instructor}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {video.description}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3 mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span>{video.rating}</span>
              </div>
              <span>{video.views.toLocaleString()} views</span>
            </div>
            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => handleVideoSelect(video)}
            className="w-full bg-skutopia-600 hover:bg-skutopia-700 text-white py-2 rounded-md flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Video
          </button>
        </div>
      </motion.div>
    );
  };
  
  // Featured video layout
  const FeaturedLayout = () => {
    if (filteredVideos.length === 0) return null;
    
    const featuredVideo = filteredVideos[0];
    const otherVideos = filteredVideos.slice(1);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoCard video={featuredVideo} size="large" />
        </div>
        <div className="space-y-4">
          {otherVideos.slice(0, 3).map(video => (
            <VideoListItem key={video.id} video={video} />
          ))}
        </div>
      </div>
    );
  };
  
  // Grid layout
  const GridLayout = () => {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
        {filteredVideos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
  };
  
  // List layout
  const ListView = () => {
    return (
      <div className="space-y-4">
        {filteredVideos.map(video => (
          <VideoListItem key={video.id} video={video} />
        ))}
      </div>
    );
  };
  
  // Render selected layout
  const renderLayout = () => {
    switch (layout) {
      case "featured":
        return <FeaturedLayout />;
      case "list":
        return <ListView />;
      case "grid":
      default:
        return <GridLayout />;
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
            
            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {/* Subject Filter */}
                <div className="relative">
                  <select
                    value={subjectFilter || ""}
                    onChange={(e) => setSubjectFilter(e.target.value || null)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <BookMarked className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Grade Filter */}
                <div className="relative">
                  <select
                    value={gradeFilter || ""}
                    onChange={(e) => setGradeFilter(e.target.value || null)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="">All Grades</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "popular" | "newest" | "rating")}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Reset Filters */}
                {(searchQuery || subjectFilter || gradeFilter) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Videos */}
      {filteredVideos.length > 0 ? (
        renderLayout()
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No videos match your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
