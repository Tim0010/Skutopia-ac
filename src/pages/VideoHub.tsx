import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, BookMarked, TrendingUp, Award, 
  BookOpen, Bookmark, Play, Search, Filter, Clock, Star,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import VideoCard from "@/components/VideoCard";
import VideoDetails from "@/components/VideoDetails";
import { fetchVideos, Video } from "@/data/videoService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define category interface
interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function VideoHub() {
  // State
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Categories
  const categories: Category[] = [
    {
      id: "all",
      name: "All Videos",
      description: "Browse all educational videos",
      icon: <Play className="h-5 w-5" />
    },
    {
      id: "trending",
      name: "Trending",
      description: "Most popular videos this week",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "mathematics",
      name: "Mathematics",
      description: "Algebra, Calculus, Geometry and more",
      icon: <BookMarked className="h-5 w-5" />
    },
    {
      id: "science",
      name: "Science",
      description: "Physics, Chemistry, Biology and more",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: "featured",
      name: "Featured",
      description: "Handpicked by our educators",
      icon: <Award className="h-5 w-5" />
    }
  ];
  
  // Fetch videos on mount
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all videos initially. Filtering will happen client-side for now.
        // Later, filters could be passed to fetchVideos if performance requires it.
        const fetchedVideos = await fetchVideos(); 
        setAllVideos(fetchedVideos);
        setFilteredVideos(fetchedVideos); // Initialize filtered list
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []); // Empty dependency array means run once on mount

  // Filter videos whenever search, category, or subject changes
  useEffect(() => {
    let currentVideos = [...allVideos];

    // Filter by search query
    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      currentVideos = currentVideos.filter(video => 
        video.title.toLowerCase().includes(lowerSearchQuery) ||
        (video.subject && video.subject.toLowerCase().includes(lowerSearchQuery)) ||
        (video.topic && video.topic.toLowerCase().includes(lowerSearchQuery))
        // Add video.description if it exists in the type and you want to search it
      );
    }

    // Filter by selected subject
    if (selectedSubject && selectedSubject !== "all") {
      currentVideos = currentVideos.filter(video => 
        video.subject?.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Filter by active category button
    // Note: This logic might need refinement depending on how categories map to data
    if (activeCategory && activeCategory !== "all") {
      if (activeCategory === "mathematics") {
        currentVideos = currentVideos.filter(video => video.subject?.toLowerCase() === "mathematics");
      } else if (activeCategory === "science") {
        const scienceSubjects = ["physics", "chemistry", "biology"];
        currentVideos = currentVideos.filter(video => 
          scienceSubjects.includes(video.subject?.toLowerCase() ?? "")
        );
      } else if (activeCategory === "trending") {
        // Placeholder: Implement actual trending logic (e.g., sort by views/date)
        // For now, just show all matching other filters
      } else if (activeCategory === "featured") {
        // Placeholder: Implement actual featured logic (needs a flag in DB/data)
        // For now, just show all matching other filters
      }
       // Add more category filters if needed
    }

    setFilteredVideos(currentVideos);

  }, [searchQuery, activeCategory, selectedSubject, allVideos]);
  
  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    console.log("Video selected:", video.title);
    setSelectedVideo(video);
    
    // Find related videos
    const related = allVideos.filter(v => 
      v.id !== video.id && 
      (v.subject === video.subject || v.grade === video.grade)
    ).slice(0, 3);
    
    setRelatedVideos(related);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedVideo ? (
          /* Video Details View */
          <div>
            <Button
              variant="ghost"
              className="mb-4 text-skutopia-600"
              onClick={() => setSelectedVideo(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Videos
            </Button>
            
            <VideoDetails 
              video={selectedVideo} 
              relatedVideos={relatedVideos} 
              onBack={() => setSelectedVideo(null)}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        ) : (
          /* Video Library View */
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Video Lessons
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                Browse our collection of high-quality educational videos covering various subjects and topics.
                Each video is designed to help you understand complex concepts in a simple and engaging way.
              </p>
            </div>
            
            {/* Search and Categories */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="relative flex-grow w-full md:w-auto md:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
                
                {/* Subject Filter Dropdown */}
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Populate dynamically using fetchDistinctSubjects */}
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category Buttons (Scrollable) */}
              <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {categories.map(category => (
                    <Button
                        key={category.id}
                        variant="ghost"
                        size="sm"
                        className={`flex-shrink-0 items-center px-4 py-2 rounded-md ${activeCategory === category.id || (activeCategory === null && category.id === 'all')
                            ? "bg-skutopia-100 text-skutopia-700 dark:bg-skutopia-900 dark:text-skutopia-300 font-medium"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        {category.icon} 
                        <span className="ml-2">{category.name}</span>
                    </Button>
                ))}
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-skutopia-600" />
                <p className="ml-2 text-gray-600 dark:text-gray-400">Loading videos...</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-12 text-red-600 dark:text-red-400">
                <p>{error}</p>
                {/* Optionally add a retry button */}
              </div>
            )}

            {/* Video Grid / No Results */}
            {!loading && !error && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredVideos.length} videos</p>
              </div>
            )}

            {!loading && !error && filteredVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map(video => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    onVideoSelect={handleVideoSelect}
                  />
                ))}
              </div>
            )}

            {!loading && !error && filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No videos found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
