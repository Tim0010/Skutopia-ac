import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, BookMarked, TrendingUp, Award, 
  BookOpen, Bookmark, Play, Search, Filter, Clock, Star
} from "lucide-react";
import { Link } from "react-router-dom";
import VideoLibrary, { Video } from "../components/VideoLibrary";
import VideoDetails from "../components/VideoDetails";
import SimpleVideoPlayer from "../components/SimpleVideoPlayer";
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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Video[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  
  // Sample video data
  const videos: Video[] = [
    {
      id: "1",
      title: "Introduction to Algebra",
      description: "Learn the basics of algebra including variables, expressions, and equations. This video covers fundamental concepts that will help you build a strong foundation in algebraic thinking and problem-solving.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "15:30",
      subject: "Mathematics",
      grade: "Grade 10",
      views: 1250,
      rating: 4.8,
      uploadDate: "2025-01-15",
      instructor: "Mr. Mulenga",
      category: "mathematics",
      tags: ["algebra", "equations", "variables"]
    },
    {
      id: "2",
      title: "Cell Structure and Function",
      description: "Explore the structure of cells and understand their various functions. Learn about cell organelles, membrane transport, and how cells work together in tissues and organs.",
      thumbnail: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "18:45",
      subject: "Biology",
      grade: "Grade 11",
      views: 980,
      rating: 4.6,
      uploadDate: "2025-02-03",
      instructor: "Ms. Banda",
      category: "science",
      tags: ["biology", "cells", "organelles"]
    },
    {
      id: "3",
      title: "Chemical Bonding",
      description: "Learn about different types of chemical bonds and their properties. This video covers ionic, covalent, and metallic bonds, as well as intermolecular forces and how they affect physical properties.",
      thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "22:10",
      subject: "Chemistry",
      grade: "Grade 12",
      views: 1560,
      rating: 4.9,
      uploadDate: "2025-01-28",
      instructor: "Dr. Mutale",
      category: "science",
      tags: ["chemistry", "bonding", "molecules"]
    },
    {
      id: "4",
      title: "Forces and Motion",
      description: "Understand Newton's laws of motion and how forces affect objects. Learn about acceleration, momentum, and the relationship between force, mass, and motion in everyday situations.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "19:15",
      subject: "Physics",
      grade: "Grade 11",
      views: 1120,
      rating: 4.7,
      uploadDate: "2025-02-10",
      instructor: "Mr. Chanda",
      category: "science",
      tags: ["physics", "motion", "newton"]
    },
    {
      id: "5",
      title: "Essay Writing Techniques",
      description: "Master the art of essay writing with these proven techniques. Learn how to structure your essays, develop strong arguments, and write compelling introductions and conclusions.",
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "16:50",
      subject: "English",
      grade: "Grade 10",
      views: 890,
      rating: 4.5,
      uploadDate: "2025-01-20",
      instructor: "Mrs. Tembo",
      category: "featured",
      tags: ["english", "writing", "essays"]
    },
    {
      id: "6",
      title: "World War II: Causes and Effects",
      description: "Analyze the causes, events, and lasting impacts of World War II. This comprehensive video covers the political climate before the war, major battles, and how the war shaped modern international relations.",
      thumbnail: "https://images.unsplash.com/photo-1526817575615-7685a7295fc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "25:40",
      subject: "History",
      grade: "Grade 12",
      views: 1350,
      rating: 4.8,
      uploadDate: "2025-02-05",
      instructor: "Dr. Mumba",
      category: "featured",
      tags: ["history", "world war", "20th century"]
    },
    {
      id: "7",
      title: "Quadratic Equations and Functions",
      description: "Learn how to solve quadratic equations and graph quadratic functions. This video covers factoring, completing the square, the quadratic formula, and interpreting parabolas.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      duration: "23:15",
      subject: "Mathematics",
      grade: "Grade 11",
      views: 1680,
      rating: 4.9,
      uploadDate: "2025-02-15",
      instructor: "Mr. Mulenga",
      category: "mathematics",
      tags: ["quadratics", "functions", "algebra"]
    },
    {
      id: "8",
      title: "Introduction to Trigonometry",
      description: "Learn the basics of trigonometry including sine, cosine, and tangent. This video introduces the unit circle, trigonometric ratios, and applications in solving real-world problems.",
      thumbnail: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "20:45",
      subject: "Mathematics",
      grade: "Grade 12",
      views: 2150,
      rating: 4.7,
      uploadDate: "2025-01-25",
      instructor: "Ms. Phiri",
      category: "mathematics",
      tags: ["trigonometry", "sine", "cosine"]
    },
    {
      id: "9",
      title: "Ecosystem Dynamics",
      description: "Understand the complex interactions within ecosystems and how they maintain balance. Learn about energy flow, nutrient cycling, succession, and how human activities affect ecosystems.",
      thumbnail: "https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      duration: "24:30",
      subject: "Biology",
      grade: "Grade 12",
      views: 1420,
      rating: 4.8,
      uploadDate: "2025-02-08",
      instructor: "Dr. Banda",
      category: "science",
      tags: ["ecosystems", "ecology", "biology"]
    },
    {
      id: "10",
      title: "Electricity and Magnetism",
      description: "Explore the relationship between electricity and magnetism and their applications. This video covers electric fields, magnetic fields, electromagnetic induction, and practical applications in technology.",
      thumbnail: "https://images.unsplash.com/photo-1567427017947-545c5f96d209?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "26:15",
      subject: "Physics",
      grade: "Grade 12",
      views: 1890,
      rating: 4.9,
      uploadDate: "2025-01-30",
      instructor: "Mr. Chanda",
      category: "trending",
      tags: ["physics", "electricity", "magnetism"]
    }
  ];
  
  // Filter videos based on search and category
  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === "" || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === null || 
      activeCategory === "all" || 
      video.category === activeCategory ||
      (activeCategory === "science" && 
        (video.subject === "Physics" || video.subject === "Chemistry" || video.subject === "Biology"));
    
    return matchesSearch && matchesCategory;
  });
  
  // Get trending videos (most views)
  const trendingVideos = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
  
  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    console.log("Video selected:", video.title);
    setSelectedVideo(video);
    
    // Find related videos
    const related = videos.filter(v => 
      v.id !== video.id && 
      (v.subject === video.subject || v.grade === video.grade)
    ).slice(0, 3);
    
    setRelatedVideos(related);
    
    // Add to recently watched
    setRecentlyWatched(prev => {
      // Remove if already exists
      const filtered = prev.filter(v => v.id !== video.id);
      // Add to beginning and limit to 4
      return [video, ...filtered].slice(0, 4);
    });
  };
  
  // Video card component
  const VideoCard = ({ video }: { video: Video }) => {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
        <div 
          className="relative aspect-video cursor-pointer" 
          onClick={() => handleVideoSelect(video)}
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
          {video.category === "featured" && (
            <Badge className="absolute top-2 left-2 bg-skutopia-600">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {video.title}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{video.rating}</span>
            </div>
          </div>
          <div className="text-sm text-skutopia-600 mb-2">
            {video.subject} • {video.grade}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
            {video.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-gray-100 text-gray-700">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{video.duration}</span>
            </div>
            <div className="flex items-center">
              <span>{video.views.toLocaleString()} views</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-skutopia-600 hover:bg-skutopia-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleVideoSelect(video);
            }}
          >
            Watch Video
          </Button>
        </div>
      </Card>
    );
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
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by title, description, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
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
              
              <div className="flex space-x-2 overflow-x-auto pb-1">
                <Button
                  variant="ghost"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeCategory === "all" || activeCategory === null
                      ? "text-skutopia-600 border-b-2 border-skutopia-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory("all")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  All Videos
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeCategory === "trending"
                      ? "text-skutopia-600 border-b-2 border-skutopia-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory("trending")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeCategory === "mathematics"
                      ? "text-skutopia-600 border-b-2 border-skutopia-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory("mathematics")}
                >
                  <BookMarked className="h-4 w-4 mr-2" />
                  Mathematics
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeCategory === "science"
                      ? "text-skutopia-600 border-b-2 border-skutopia-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory("science")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Science
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeCategory === "featured"
                      ? "text-skutopia-600 border-b-2 border-skutopia-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveCategory("featured")}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Featured
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Showing {filteredVideos.length} videos</p>
            </div>
            
            {/* Video Grid */}
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
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
