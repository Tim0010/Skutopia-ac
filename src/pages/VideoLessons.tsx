import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play, ChevronLeft, Search,
  BookOpen, Clock, Filter, ChevronDown,
  Star, BookMarked, TrendingUp, Award,
  Heart, MessageCircle, CornerUpRight, Send, Loader
} from "lucide-react";
import { Link } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

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

// --- Comment Structure --- 
interface Comment {
  id: string;
  created_at: string;
  comment: string;
  user_id: string;
  parent_comment_id: string | null;
  // Adjust profile type to handle potential array from join
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | { name: string | null; avatar_url: string | null; }[] | null; // Can be object, array, or null
  replies?: Comment[];
}

// Helper to get profile object reliably
const getProfileData = (profiles: Comment['profiles']) => {
  if (Array.isArray(profiles)) {
    return profiles[0] ?? null; // Take the first element if it's an array
  }
  return profiles; // Return the object or null
};

export default function VideoLessons() {
  const { user, isAuthenticated } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Video[]>([]);

  // --- State for Comments/Likes --- 
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [checkingLike, setCheckingLike] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  // State for Replies
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID of the comment being replied to
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  // -----------------------------

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

  // --- Fetch Comments --- 
  const fetchComments = useCallback(async (videoId: string) => {
    if (!videoId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .select(`id, created_at, comment, user_id, parent_comment_id, profiles ( name, avatar_url )`)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process comments (remains the same logic)
      const topLevelComments: Comment[] = [];
      const repliesMap: { [parentId: string]: Comment[] } = {};
      data.forEach(comment => {
        // Ensure comment fits the type, handle profiles correctly
        const typedComment: Comment = {
          ...comment,
          profiles: getProfileData(comment.profiles) // Use helper to get profile object
        };

        if (typedComment.parent_comment_id) {
          if (!repliesMap[typedComment.parent_comment_id]) {
            repliesMap[typedComment.parent_comment_id] = [];
          }
          repliesMap[typedComment.parent_comment_id].push(typedComment);
        } else {
          topLevelComments.push(typedComment);
        }
      });
      topLevelComments.forEach(comment => {
        comment.replies = (repliesMap[comment.id] || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Sort replies too
      });

      setComments(topLevelComments);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setCommentsError("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // --- Fetch Like Status --- 
  const fetchLikeStatus = useCallback(async (videoId: string, userId: string | undefined) => {
    if (!videoId) return;
    setCheckingLike(true);
    try {
      // Get like count
      const { count, error: countError } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);
      if (countError) throw countError;
      setLikeCount(count ?? 0);

      // Check if current user liked
      if (userId) {
        const { data: likeData, error: likeError } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', videoId)
          .eq('user_id', userId)
          .maybeSingle(); // Use maybeSingle to handle no like found
        if (likeError) throw likeError;
        setUserLiked(!!likeData);
      }
    } catch (err: any) {
      console.error("Error fetching like status:", err);
      toast.error("Could not load like status.");
    } finally {
      setCheckingLike(false);
    }
  }, []);

  // --- Effect to fetch data when a video is selected --- 
  useEffect(() => {
    if (selectedVideo) {
      fetchComments(selectedVideo.id);
      fetchLikeStatus(selectedVideo.id, user?.id);
      // TODO: Fetch related videos based on selectedVideo.subject/category
      // setRelatedVideos(videos.filter(v => v.id !== selectedVideo.id).slice(0, 5));
    } else {
      // Clear comments and like status when video is deselected
      setComments([]);
      setLikeCount(0);
      setUserLiked(false);
      setReplyingTo(null); // Reset reply state
    }
  }, [selectedVideo, user, fetchComments, fetchLikeStatus]);

  // --- Handle Submitting Top-Level Comment --- 
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !selectedVideo) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .insert({
          user_id: user.id,
          video_id: selectedVideo.id,
          comment: newComment,
          parent_comment_id: null // Explicitly null for top-level
        })
        .select(`id, created_at, comment, user_id, parent_comment_id, profiles!inner ( name, avatar_url )`) // Use !inner join
        .single();

      if (error) throw error;

      if (data) {
        // Ensure profiles is handled correctly if it comes back unexpectedly
        const newCommentData: Comment = { ...data, profiles: getProfileData(data.profiles) };
        setComments(prev => [...prev, newCommentData]);
        setNewComment(""); // Clear input
        toast.success("Comment added!");
      }
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      toast.error("Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // --- Handle Submitting a Reply --- 
  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyText.trim() || !user || !selectedVideo) return;

    setSubmittingReply(true);
    try {
      const { data: newReplyData, error } = await supabase
        .from('video_comments')
        .insert({
          user_id: user.id,
          video_id: selectedVideo.id,
          comment: replyText,
          parent_comment_id: parentCommentId
        })
        .select(`id, created_at, comment, user_id, parent_comment_id, profiles!inner ( name, avatar_url )`) // Use !inner join
        .single();

      if (error) throw error;

      if (newReplyData) {
        // Add the reply to the correct parent comment in the state
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), { ...newReplyData, profiles: getProfileData(newReplyData.profiles) }]
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              };
            }
            // Also check nested replies (potential for deep nesting)
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === parentCommentId) {
                    return {
                      ...reply,
                      replies: [...(reply.replies || []), { ...newReplyData, profiles: getProfileData(newReplyData.profiles) }]
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    };
                  }
                  // Add logic here to recurse deeper if needed
                  return reply;
                })
              };
            }
            return comment;
          });
        });
        setReplyText(""); // Clear reply input
        setReplyingTo(null); // Close reply input
        toast.success("Reply added!");
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      toast.error("Failed to add reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // --- Handle Toggling Like --- 
  const handleToggleLike = async () => {
    if (!user || !selectedVideo || togglingLike) return;
    setTogglingLike(true);
    try {
      if (userLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .match({ user_id: user.id, video_id: selectedVideo.id });
        if (error) throw error;
        setLikeCount(prev => prev - 1);
        setUserLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('video_likes')
          .insert({ user_id: user.id, video_id: selectedVideo.id });
        if (error) throw error;
        setLikeCount(prev => prev + 1);
        setUserLiked(true);
      }
    } catch (err: any) {
      console.error("Error toggling like:", err);
      toast.error("Could not update like status.");
    } finally {
      setTogglingLike(false);
    }
  };

  // --- Helper function to format date --- 
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Video card component
  const VideoCard = ({ video, size = "normal" }: { video: Video, size?: "small" | "normal" | "large" }) => {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 ${size === "large" ? "col-span-2 row-span-2" : ""
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
          <h3 className={`font-bold text-gray-900 dark:text-white mb-1 ${size === "small" ? "text-sm line-clamp-1" : "line-clamp-2"
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

  // --- Component for Rendering a Single Comment (and its replies) --- 
  const CommentItem = ({ comment }: { comment: Comment }) => {
    const isReplying = replyingTo === comment.id;
    const profile = getProfileData(comment.profiles); // Use helper to get profile

    return (
      <div className="flex items-start space-x-3 py-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url ?? '/default-avatar.png'} alt={profile?.name ?? 'User'} />
          <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {profile?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.created_at)}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {comment.comment}
          </p>
          {/* Reply Button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                setReplyingTo(isReplying ? null : comment.id);
                if (!isReplying) { setReplyText(""); } // Clear reply text when opening
              }}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
            >
              <CornerUpRight size={14} className="mr-1" />
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Reply Input Form */}
          {isReplying && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReplySubmit(comment.id);
              }}
              className="mt-3 flex items-center space-x-2"
            >
              <Textarea
                placeholder={`Replying to ${profile?.name || 'Anonymous'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
                className="flex-grow resize-none text-sm"
                autoFocus // Focus when it appears
              />
              <Button type="submit" size="sm" disabled={submittingReply || !replyText.trim()}>
                {submittingReply ? <Loader className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              </Button>
            </form>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main Return Logic --- 
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Placeholder for potential Sidebar component */}
      {/* <Sidebar /> */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        {selectedVideo ? (
          // --- Single Video View --- 
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="mb-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-skutopia-600 hover:bg-skutopia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skutopia-500"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Lessons
            </button>

            {/* Video Player */}
            <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              <VideoPlayer
                key={selectedVideo.id} // Add key to force re-render on video change
                videoUrl={selectedVideo.videoUrl}
                thumbnailUrl={selectedVideo.thumbnail}
                autoPlay
              />
            </div>

            {/* Video Details */}
            <div className="mt-6 pb-6 border-b border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedVideo.title}</h1>
              {/* ... Add other details like subject, grade etc. if needed ... */}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{selectedVideo.description}</p>
            </div>

            {/* Likes, Comments & Discussion Section */}
            <div className="mt-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comments & Discussion ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h2>
                {/* Like Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleLike}
                  disabled={!isAuthenticated || checkingLike || togglingLike}
                  className={`flex items-center ${userLiked ? 'text-red-600 border-red-600 hover:bg-red-50 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                  <Heart size={16} className={`mr-1.5 ${userLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </Button>
              </div>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6 flex items-start space-x-3">
                  <Avatar className="h-9 w-9 mt-1">
                    <AvatarImage src={user?.avatarUrl ?? '/default-avatar.png'} alt={user?.name ?? 'User'} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="Add a public comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-grow resize-none"
                  />
                  <Button type="submit" disabled={submittingComment || !newComment.trim()}
                    className="self-end"
                  >
                    {submittingComment ? 'Posting...' : 'Comment'}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please <Link to="/login" className="text-skutopia-600 hover:underline">login</Link> to comment or like.</p>
              )}

              {/* Comments List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {commentsLoading && <p className="py-4 text-center text-gray-500">Loading comments...</p>}
                {commentsError && <p className="py-4 text-center text-red-500">{commentsError}</p>}
                {!commentsLoading && !commentsError && comments.length === 0 && (
                  <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
                )}
                {!commentsLoading && !commentsError && comments.length > 0 && (
                  comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                )}
              </div> {/* End Comments List div */}
            </div> {/* End Likes/Comments section div */}
          </div> /* End Single Video View div */
        ) : (
          // --- Video Listing View (Restored) --- 
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Title */}
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
              </p>
            </motion.div>

            {/* Search and Filters (Optional - Restore if needed) */}
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
                {/* Add Filters back here if desired (Subject, Grade) using <select> */}
              </div>
            </div>

            {/* Categories (Optional - Restore if needed) */}
            <div className="mb-8">
              <div className="flex overflow-x-auto pb-2 space-x-4">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === null
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
                    className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === category.id
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

            {/* Video Sections/Grid */}
            {filteredVideos.length > 0 ? (
              // Use VideoSection or a simple grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              // No Results Message
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No videos match your search criteria. Try adjusting your filters or search term.
                </p>
              </div>
            )}
          </div>
        )}
      </main> {/* End main */}
      {/* Placeholder for potential Right Sidebar */}
      {/* <aside>...</aside> */}
    </div> /* End Outer flex div */
  );
}
