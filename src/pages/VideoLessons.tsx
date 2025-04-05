import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, ChevronLeft, Search, 
  BookOpen, Clock, Filter, ChevronDown, 
  Star, BookMarked, TrendingUp, Award
} from "lucide-react";
import { Link } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

// Define video interface
interface Video {
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
}

// Define category interface
interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function VideoLessons() {
  // State
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Video[]>([]);
  
  // Categories
  const categories: Category[] = [
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
  
  // Sample video data
  const videos: Video[] = [
    {
      id: "1",
      title: "Introduction to Algebra",
      description: "Learn the basics of algebra including variables, expressions, and equations.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "15:30",
      subject: "Mathematics",
      grade: "Grade 10",
      views: 1250,
      rating: 4.8,
      uploadDate: "2025-01-15",
      instructor: "Mr. Mulenga",
      category: "mathematics"
    },
    {
      id: "2",
      title: "Cell Structure and Function",
      description: "Explore the structure of cells and understand their various functions.",
      thumbnail: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "18:45",
      subject: "Biology",
      grade: "Grade 11",
      views: 980,
      rating: 4.6,
      uploadDate: "2025-02-03",
      instructor: "Ms. Banda",
      category: "science"
    },
    {
      id: "3",
      title: "Chemical Bonding",
      description: "Learn about different types of chemical bonds and their properties.",
      thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "22:10",
      subject: "Chemistry",
      grade: "Grade 12",
      views: 1560,
      rating: 4.9,
      uploadDate: "2025-01-28",
      instructor: "Dr. Mutale",
      category: "science"
    },
    {
      id: "4",
      title: "Forces and Motion",
      description: "Understand Newton's laws of motion and how forces affect objects.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "19:15",
      subject: "Physics",
      grade: "Grade 11",
      views: 1120,
      rating: 4.7,
      uploadDate: "2025-02-10",
      instructor: "Mr. Chanda",
      category: "science"
    },
    {
      id: "5",
      title: "Essay Writing Techniques",
      description: "Master the art of essay writing with these proven techniques.",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "16:50",
      subject: "English",
      grade: "Grade 10",
      views: 890,
      rating: 4.5,
      uploadDate: "2025-01-20",
      instructor: "Mrs. Tembo",
      category: "featured"
    },
    {
      id: "6",
      title: "World War II: Causes and Effects",
      description: "Analyze the causes, events, and lasting impacts of World War II.",
      thumbnail: "https://images.unsplash.com/photo-1526817575615-7685a7295fc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "25:40",
      subject: "History",
      grade: "Grade 12",
      views: 1350,
      rating: 4.8,
      uploadDate: "2025-02-05",
      instructor: "Dr. Mumba",
      category: "featured"
    },
    {
      id: "7",
      title: "Quadratic Equations and Functions",
      description: "Learn how to solve quadratic equations and graph quadratic functions.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "23:15",
      subject: "Mathematics",
      grade: "Grade 11",
      views: 1680,
      rating: 4.9,
      uploadDate: "2025-02-15",
      instructor: "Mr. Mulenga",
      category: "mathematics"
    },
    {
      id: "8",
      title: "Introduction to Trigonometry",
      description: "Learn the basics of trigonometry including sine, cosine, and tangent.",
      thumbnail: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "20:45",
      subject: "Mathematics",
      grade: "Grade 12",
      views: 2150,
      rating: 4.7,
      uploadDate: "2025-01-25",
      instructor: "Ms. Phiri",
      category: "mathematics"
    },
    {
      id: "9",
      title: "Ecosystem Dynamics",
      description: "Understand the complex interactions within ecosystems and how they maintain balance.",
      thumbnail: "https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "24:30",
      subject: "Biology",
      grade: "Grade 12",
      views: 1420,
      rating: 4.8,
      uploadDate: "2025-02-08",
      instructor: "Dr. Banda",
      category: "science"
    },
    {
      id: "10",
      title: "Electricity and Magnetism",
      description: "Explore the relationship between electricity and magnetism and their applications.",
      thumbnail: "https://images.unsplash.com/photo-1567427017947-545c5f96d209?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      duration: "26:15",
      subject: "Physics",
      grade: "Grade 12",
      views: 1890,
      rating: 4.9,
      uploadDate: "2025-01-30",
      instructor: "Mr. Chanda",
      category: "trending"
    }
  ];
  
  // Filter videos based on search, category, subject, and grade
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || video.category === activeCategory;
    const matchesSubject = !subjectFilter || video.subject === subjectFilter;
    const matchesGrade = !gradeFilter || video.grade === gradeFilter;
    
    return matchesSearch && matchesCategory && matchesSubject && matchesGrade;
  });
  
  // Get trending videos (most views)
  const trendingVideos = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
  
  // Get featured videos
  const featuredVideos = videos.filter(video => video.category === "featured");
  
  // Get videos by subject
  const mathVideos = videos.filter(video => video.subject === "Mathematics");
  const scienceVideos = videos.filter(video => 
    video.subject === "Physics" || 
    video.subject === "Chemistry" || 
    video.subject === "Biology"
  );
  
  // Unique subjects and grades for filters
  const subjects = Array.from(new Set(videos.map(video => video.subject)));
  const grades = Array.from(new Set(videos.map(video => video.grade)));
  
  // Update related videos when a video is selected
  useEffect(() => {
    if (selectedVideo) {
      // Find videos with the same subject or grade
      const related = videos.filter(video => 
        video.id !== selectedVideo.id && 
        (video.subject === selectedVideo.subject || video.grade === selectedVideo.grade)
      ).slice(0, 3);
      
      setRelatedVideos(related);
      
      // Add to recently watched
      setRecentlyWatched(prev => {
        // Remove if already exists
        const filtered = prev.filter(v => v.id !== selectedVideo.id);
        // Add to beginning and limit to 4
        return [selectedVideo, ...filtered].slice(0, 4);
      });
    }
  }, [selectedVideo]);
  
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
          onClick={() => setSelectedVideo(video)}
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
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{video.rating}</span>
            </div>
            <span>{video.views.toLocaleString()} views</span>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Video section component
  const VideoSection = ({ 
    title, 
    description, 
    videos, 
    columns = 3 
  }: { 
    title: string; 
    description?: string; 
    videos: Video[]; 
    columns?: number;
  }) => {
    return (
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-skutopia-600 hover:text-skutopia-700">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Video Lessons</h1>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedVideo ? (
          /* Video Player View */
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {/* Video Player */}
              <div className="bg-black rounded-xl overflow-hidden shadow-xl mb-6">
                <VideoPlayer 
                  videoUrl={selectedVideo.videoUrl}
                  thumbnailUrl={selectedVideo.thumbnail}
                  className="aspect-video"
                />
              </div>
              
              {/* Video Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedVideo.title}
                </h2>
                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-4 gap-4">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{selectedVideo.subject}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{selectedVideo.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium">{selectedVideo.grade}</span>
                  </div>
                  <div>
                    <span>{selectedVideo.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{selectedVideo.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {selectedVideo.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Instructor: <span className="font-medium">{selectedVideo.instructor}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedVideo(null)}
                    className="text-skutopia-600 hover:text-skutopia-700 dark:text-skutopia-400 dark:hover:text-skutopia-300 font-medium"
                  >
                    Back to Videos
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Related Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recently Watched */}
            {recentlyWatched.length > 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recently Watched
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {recentlyWatched.filter(v => v.id !== selectedVideo.id).map(video => (
                    <VideoCard key={video.id} video={video} size="small" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Video Library View */
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Video Lessons
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                Browse our collection of high-quality educational videos covering various subjects and topics. 
                Each video is designed to help you understand complex concepts in a simple and engaging way.
              </p>
            </motion.div>
            
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
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
                
                {/* Filters */}
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
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div className="mb-8">
              <div className="flex overflow-x-auto pb-2 space-x-4">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                    activeCategory === null
                      ? "bg-skutopia-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All Videos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                      activeCategory === category.id
                        ? "bg-skutopia-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Conditional Content Based on Category */}
            {activeCategory ? (
              // Show filtered videos for the selected category
              <VideoSection 
                title={categories.find(c => c.id === activeCategory)?.name || "Videos"} 
                description={categories.find(c => c.id === activeCategory)?.description}
                videos={filteredVideos} 
              />
            ) : (
              // Show all sections when no category is selected
              <>
                {/* Featured Videos */}
                {featuredVideos.length > 0 && (
                  <VideoSection 
                    title="Featured Videos" 
                    description="Handpicked by our educators"
                    videos={featuredVideos} 
                  />
                )}
                
                {/* Trending Videos */}
                <VideoSection 
                  title="Trending Videos" 
                  description="Most popular videos this week"
                  videos={trendingVideos} 
                />
                
                {/* Mathematics Videos */}
                {mathVideos.length > 0 && (
                  <VideoSection 
                    title="Mathematics" 
                    videos={mathVideos} 
                  />
                )}
                
                {/* Science Videos */}
                {scienceVideos.length > 0 && (
                  <VideoSection 
                    title="Science" 
                    videos={scienceVideos} 
                  />
                )}
                
                {/* Recently Watched */}
                {recentlyWatched.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Recently Watched
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {recentlyWatched.map(video => (
                        <VideoCard key={video.id} video={video} size="small" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* No Results */}
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No videos match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
