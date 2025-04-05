import React, { useState, useEffect } from 'react';
import { fetchVideos, fetchDistinctGrades, fetchDistinctSubjects, fetchDistinctTopics, Video } from '../data/videoService';
import { VideoCard } from '../components/VideoCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const VideoLearning: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // Options for filters
    const [gradeOptions, setGradeOptions] = useState<string[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
    const [topicOptions, setTopicOptions] = useState<string[]>([]);

    // Fetch filter options on initial load
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                // Use Promise.all for parallel fetching
                const [grades, subjects, topics] = await Promise.all([
                    fetchDistinctGrades(),
                    fetchDistinctSubjects(),
                    fetchDistinctTopics()
                ]);
                setGradeOptions(grades || []);
                setSubjectOptions(subjects || []);
                setTopicOptions(topics || []);
            } catch (err) {
                console.error("Failed to load filter options:", err);
                // Handle error appropriately, maybe show a message
            }
        };
        loadFilterOptions();
    }, []);

    // Fetch videos when filters change
    useEffect(() => {
        const loadVideos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedVideos = await fetchVideos(selectedGrade, selectedSubject, selectedTopic);
                setVideos(fetchedVideos);
            } catch (err) {
                console.error("Failed to load videos:", err);
                setError('Could not load videos. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        loadVideos();
    }, [selectedGrade, selectedSubject, selectedTopic]);

    // Handlers for filter changes
    const handleGradeChange = (value: string) => {
        setSelectedGrade(value === 'all' ? null : value);
        // Reset subject/topic if grade changes? Optional, based on desired UX
        // setSelectedSubject(null);
        // setSelectedTopic(null);
    };

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value === 'all' ? null : value);
        // setSelectedTopic(null); // Reset topic if subject changes? 
    };

     const handleTopicChange = (value: string) => {
        setSelectedTopic(value === 'all' ? null : value);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6">Video Learning Hub</h1>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 border rounded-lg bg-card text-card-foreground">
                <div>
                    <Label htmlFor="grade-select">Grade</Label>
                    <Select onValueChange={handleGradeChange} value={selectedGrade ?? 'all'}>
                        <SelectTrigger id="grade-select">
                            <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Grades</SelectItem>
                            {gradeOptions.map(grade => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="subject-select">Subject</Label>
                     <Select onValueChange={handleSubjectChange} value={selectedSubject ?? 'all'}>
                        <SelectTrigger id="subject-select">
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjectOptions.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="topic-select">Topic</Label>
                    <Select onValueChange={handleTopicChange} value={selectedTopic ?? 'all'}>
                        <SelectTrigger id="topic-select">
                            <SelectValue placeholder="Select Topic" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Topics</SelectItem>
                            {topicOptions.map(topic => (
                                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Video List Section */}
            <div>
                {error && <p className="text-destructive text-center mb-4">{error}</p>}

                {isLoading ? (
                    // Loading Skeletons
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} className="w-full">
                                <CardHeader>
                                    <Skeleton className="h-4 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="aspect-video w-full" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-8 w-1/4" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : videos.length > 0 ? (
                    // Video Cards - Adjust grid layout as needed
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                         {videos.map(video => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No videos found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default VideoLearning;
