import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    fetchLikeCount,
    fetchUserLikeStatus,
    likeVideo,
    unlikeVideo,
    fetchComments,
    addComment,
    fetchVideoProgress,
    updateVideoProgress,
    Video,
    VideoComment,
} from '../data/videoService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for comments
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user avatars in comments
import { ThumbsUp, MessageCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use the actual auth context
import _ from 'lodash'; // For debouncing progress updates

interface VideoCardProps {
    video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    const { user } = useAuth(); // Get logged-in user from context
    const userId = user?.id; // Extract user ID

    const [likeCount, setLikeCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [isLoadingLikes, setIsLoadingLikes] = useState<boolean>(true);
    const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [likeError, setLikeError] = useState<string | null>(null);
    const [showComments, setShowComments] = useState(false);

    // Debounced function to update progress (remains defined but not auto-triggered by timeupdate)
    const debouncedUpdateProgress = useCallback(
        _.debounce((currentTime: number) => {
            // Log inside the debounced function
            console.log(`[VideoCard ${video.id}] Debounced update triggered for time: ${currentTime}, UserID: ${userId}`);
            if (userId && video.id) {
                console.log(`[VideoCard ${video.id}] Calling updateVideoProgress...`);
                updateVideoProgress(userId, video.id, currentTime);
            } else {
                console.log(`[VideoCard ${video.id}] Skipping updateVideoProgress (missing userId or video.id)`);
            }
        }, 3000), // Update every 3 seconds of watching
        [userId, video.id] // Include userId and video.id in dependencies
    );

    // Fetch initial data: likes, comments, progress
    useEffect(() => {
        const fetchData = async () => {
            if (!video.id) return;

            setIsLoadingLikes(true);
            setIsLoadingComments(true);
            setLikeError(null);
            setCommentError(null);

            try {
                // Fetch likes
                const count = await fetchLikeCount(video.id);
                setLikeCount(count);
                if (userId) {
                    const likedStatus = await fetchUserLikeStatus(userId, video.id);
                    setIsLiked(likedStatus);
                }
            } catch (error) {
                console.error("Error fetching likes:", error);
                setLikeError("Could not load likes.");
            } finally {
                setIsLoadingLikes(false);
            }

            try {
                // Fetch comments
                const fetchedComments = await fetchComments(video.id);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Error fetching comments:", error);
                setCommentError("Could not load comments.");
            } finally {
                setIsLoadingComments(false);
            }

            try {
                // Fetch progress and potentially set video start time (implementation needed)
                if (userId) {
                    const progress = await fetchVideoProgress(userId, video.id);
                    if (progress) {
                        // Update progress state
                    }
                }
            } catch (error) {
                console.error("Error fetching video progress:", error);
                // Non-critical, don't show UI error
            }
        };

        fetchData();

        // REMOVED timeupdate listener logic as it's unreliable for iframes without specific APIs

        // Cleanup function
        return () => {
            debouncedUpdateProgress.cancel(); // Cancel any pending debounced updates
        };

    }, [video.id, userId, debouncedUpdateProgress]); // Keep dependencies

    // Handle Like/Unlike click
    const handleLikeToggle = async () => {
        if (!userId) {
            // TODO: Prompt user to login
            alert('Please log in to like videos.');
            return;
        }
        if (!video.id) return;

        setLikeError(null);
        const currentlyLiked = isLiked;

        // Optimistic UI update
        setIsLiked(!currentlyLiked);
        setLikeCount(prev => currentlyLiked ? prev - 1 : prev + 1);

        try {
            if (currentlyLiked) {
                await unlikeVideo(userId, video.id);
            } else {
                await likeVideo(userId, video.id);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setLikeError('Could not update like.');
            // Revert optimistic update on error
            setIsLiked(currentlyLiked);
            setLikeCount(prev => currentlyLiked ? prev + 1 : prev - 1);
        }
    };

    // Handle Comment submission
    const handleAddComment = async () => {
        if (!userId) {
            // TODO: Prompt user to login
            alert('Please log in to comment.');
            return;
        }
        if (!video.id || !newComment.trim()) return;

        setCommentError(null);
        const originalComments = comments;
        const tempCommentId = Date.now().toString(); // Temporary ID for optimistic update
        const optimisticComment: VideoComment = {
            id: tempCommentId,
            user_id: userId,
            video_id: video.id,
            comment: newComment,
            created_at: new Date().toISOString(),
            // Placeholder user info - replace if you fetch it
            users: { name: 'User', avatar_url: '' }
        };

        // Optimistic UI Update
        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');

        try {
            const savedComment = await addComment(userId, video.id, newComment.trim());
            // Replace optimistic comment with saved one (which has real ID)
            setComments(prev => prev.map(c => c.id === tempCommentId ? savedComment : c));
        } catch (error) {
            console.error('Error adding comment:', error);
            setCommentError('Could not post comment.');
            // Revert optimistic update on error
            setComments(originalComments);
        }
    };

    return (
        <Card className="mb-4 overflow-hidden">
            <CardHeader>
                <CardTitle>{video.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Grade: {video.grade} | Subject: {video.subject} | Topic: {video.topic}
                </p>
            </CardHeader>
            <CardContent>
                <div className="aspect-video relative">
                    {/* Removed ID from iframe as the listener is removed */}
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={video.video_url}
                        title={video.title || "Video Player"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                {/* Likes Section */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLikeToggle}
                        disabled={isLoadingLikes || !userId}
                        aria-label={isLiked ? "Unlike video" : "Like video"}
                    >
                        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="ml-1">{likeCount}</span>
                    </Button>
                    {likeError && <p className="text-xs text-destructive">{likeError}</p>}
                </div>

                {/* Comments Section */}
                <div className="w-full space-y-3">
                    <h4 className="text-md font-semibold flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" /> Comments
                    </h4>
                    {commentError && <p className="text-xs text-destructive">{commentError}</p>}

                    {/* Comment List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2"> {/* Scrollable comments */}
                        {isLoadingComments ? (
                            <p className="text-sm text-muted-foreground">Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex items-start gap-2 text-sm">
                                    {/* <Avatar className="h-6 w-6">
                                        <AvatarImage src={comment.users?.avatar_url || undefined} alt={comment.users?.name || 'User'} />
                                        <AvatarFallback>{comment.users?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar> */}
                                    <div className="flex-1 bg-muted p-2 rounded-md">
                                        {/* <span className="font-medium mr-1">{comment.users?.name || 'Anonymous'}:</span> */}
                                        <span className="font-medium mr-1">User {comment.user_id.substring(0, 6)}:</span> {/* Simple display */}
                                        {comment.comment}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Form */}
                    {userId && (
                        <div className="flex gap-2 mt-2">
                            <Textarea
                                placeholder="Add your comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                                className="flex-1"
                            />
                            <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">Post</Button>
                        </div>
                    )}
                    {!userId && (
                        <p className="text-sm text-muted-foreground">Log in to post comments.</p>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};
