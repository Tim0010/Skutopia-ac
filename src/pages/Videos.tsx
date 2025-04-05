import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Star, BookOpen, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import SimpleVideoPlayer from "../components/SimpleVideoPlayer";
import VideoLibrary, { Video } from "../components/VideoLibrary";
import VideoDetails from "../components/VideoDetails";

export default function Videos() {
  // State for video player
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  
  // Refs
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Sample video data
  const videos: Video[] = [
    {
      id: "v1",
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
      id: "v2",
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
      id: "v3",
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
      id: "v4",
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
      id: "v5",
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
      id: "v6",
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
    }
  ];
  
  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    console.log("Video selected in Videos page:", video.title, video.videoUrl);
    setSelectedVideo(video);
    
    // Find related videos
    const related = videos.filter(v => 
      v.id !== video.id && 
      (v.subject === video.subject || v.grade === video.grade)
    ).slice(0, 3);
    
    setRelatedVideos(related);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          /* Video Details View */
          <div className="mb-12">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Video Library
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                Enhance your learning with our extensive collection of educational videos
              </p>
            </motion.div>
            
            <VideoLibrary 
              videos={videos}
              onVideoSelect={handleVideoSelect}
              showFilters={true}
              showSearch={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
