import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // For search
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Check, ChevronsUpDown, X } from "lucide-react"; // Add Search icon and icons for Combobox
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/components/ui/badge"; // For tags
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For Combobox
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // For Combobox
import { cn } from "@/lib/utils";
import {
    fetchSubjects,
    fetchTopics,
    fetchTags,
    fetchFlashcards,
    updateFlashcardProgress,
    fetchSingleFlashcardProgress,
    Subject,
    Topic,
    Tag,
    FlashcardData,
    FlashcardFilters,
    FlashcardProgressData
} from "@/data/flashcardService";
// Removed old service imports

// Helper: Format next review date (remains the same)
const formatNextReview = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not scheduled";
    try {
        const date = new Date(dateString);
        const now = new Date();
        if (date.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
            return format(date, "MMM d, yyyy");
        }
        return formatDistanceToNowStrict(date, { addSuffix: true });
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid date";
    }
};

// Constants for filters
const GRADES = Array.from({ length: 5 }, (_, i) => i + 8); // Grades 8-12
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const FlashcardsPage: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    // --- Filter Options States ---
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]); // Topics for the selected subject
    const [tags, setTags] = useState<Tag[]>([]); // All available tags

    // --- Selected Filter States ---
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedTopicId, setSelectedTopicId] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>(""); // Use string for Select compatibility
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

    // --- Flashcard States ---
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

    // --- Progress States ---
    const [currentCardProgress, setCurrentCardProgress] = useState<FlashcardProgressData | null>(null);
    const [lastProgressUpdate, setLastProgressUpdate] = useState<FlashcardProgressData | null>(null);
    const [streak, setStreak] = useState<number>(0);
    const [loading, setLoading] = useState<{ filters: boolean; flashcards: boolean; progress: boolean; updating: boolean }>(({
        filters: true, // Start loading filters initially
        flashcards: true, // Start loading flashcards initially
        progress: false,
        updating: false
    }));

    // --- Data Fetching Effects ---

    // Fetch Subjects and Tags on mount
    useEffect(() => {
        setLoading((prev) => ({ ...prev, filters: true }));
        Promise.all([fetchSubjects(), fetchTags()])
            .then(([fetchedSubjects, fetchedTags]) => {
                setSubjects(fetchedSubjects);
                setTags(fetchedTags);
            })
            .catch((err) => {
                console.error("Error loading initial filters:", err);
                toast({ title: "Error", description: "Could not load filter options.", variant: "destructive" });
            })
            .finally(() => {
                setLoading((prev) => ({ ...prev, filters: false }));
            });
    }, [toast]);

    // Fetch Topics when Subject changes
    useEffect(() => {
        if (!selectedSubjectId) {
            setTopics([]); // Clear topics if no subject is selected
            setSelectedTopicId(""); // Reset topic selection
            return;
        }
        setTopics([]); // Clear previous topics
        setSelectedTopicId(""); // Reset topic selection
        setLoading((prev) => ({ ...prev, filters: true })); // Indicate loading specific filters
        fetchTopics(selectedSubjectId)
            .then(setTopics)
            .catch((err) => {
                console.error("Error loading topics:", err);
                toast({ title: "Error", description: "Could not load topics for the selected subject.", variant: "destructive" });
            })
            .finally(() => {
                // Stop filter loading indicator (might overlap with flashcard loading)
                // Consider refining loading state granularity if needed
                setLoading((prev) => ({ ...prev, filters: false }));
            });
    }, [selectedSubjectId, toast]);

    // Fetch Flashcards when filters change
    const loadFlashcards = useCallback(() => {
        setLoading((prev) => ({ ...prev, flashcards: true }));
        setIsAnswerRevealed(false);
        setCurrentCardProgress(null);
        setLastProgressUpdate(null);

        const filters: FlashcardFilters = {
            subjectId: selectedSubjectId || undefined,
            topicId: selectedTopicId || undefined,
            grade: selectedGrade ? parseInt(selectedGrade, 10) : undefined,
            difficulty: selectedDifficulty as FlashcardFilters['difficulty'] || undefined,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            searchTerm: searchTerm || undefined,
        };

        // console.log("Fetching flashcards with filters:", filters); // Debug log

        fetchFlashcards(filters)
            .then((data) => {
                setFlashcards(data);
                setCurrentIndex(0);
                if (data.length === 0 && (filters.subjectId || filters.topicId || filters.grade || filters.difficulty || filters.tagIds || filters.searchTerm)) {
                    toast({ title: "No Flashcards Found", description: "Try adjusting your filter criteria.", variant: "default" });
                } else if (data.length === 0) {
                    // Initial load or no filters - maybe don't toast, or different message
                    console.log("No flashcards found initially or with no filters.");
                }
            })
            .catch((err) => {
                console.error("Error fetching flashcards:", err);
                toast({ title: "Error", description: "Could not load flashcards.", variant: "destructive" });
            })
            .finally(() => {
                setLoading((prev) => ({ ...prev, flashcards: false }));
            });
    }, [selectedSubjectId, selectedTopicId, selectedGrade, selectedDifficulty, selectedTagIds, searchTerm, toast]); // Dependencies for fetching

    // Trigger fetchFlashcards when filters change
    useEffect(() => {
        loadFlashcards();
    }, [loadFlashcards]);

    // Fetch progress for current card (remains largely the same)
    useEffect(() => {
        const currentCard = flashcards?.[currentIndex];
        setLastProgressUpdate(null);

        if (!user || !currentCard) {
            setCurrentCardProgress(null);
            return;
        }
        setLoading((prev) => ({ ...prev, progress: true }));
        fetchSingleFlashcardProgress(user.id, currentCard.id)
            .then(setCurrentCardProgress)
            .catch(() => {
                console.error("Failed to fetch progress for card:", currentCard.id);
                setCurrentCardProgress(null);
            })
            .finally(() => setLoading((prev) => ({ ...prev, progress: false })));
    }, [currentIndex, user, flashcards]);

    // --- Helper Functions ---

    const handleRevealAnswer = () => {
        setIsAnswerRevealed(true);
    };

    const handleNavigation = (direction: "prev" | "next") => {
        setIsAnswerRevealed(false);
        setCurrentIndex((prev) => Math.max(0, Math.min(prev + (direction === "next" ? 1 : -1), flashcards.length - 1)));
    };

    // Handle progress update (remains largely the same, uses currentCard.id)
    const handleProgressUpdate = async (isCorrect: boolean) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to save your progress.", variant: "destructive" });
            return;
        }
        const currentCard = flashcards?.[currentIndex];
        if (!currentCard || loading.updating) return;

        setLoading((prev) => ({ ...prev, updating: true }));
        setLastProgressUpdate(null);

        try {
            const updatedProgress = await updateFlashcardProgress(user.id, currentCard.id, isCorrect);
            setCurrentCardProgress(updatedProgress);
            setLastProgressUpdate(updatedProgress);

            if (isCorrect) setStreak((prev) => prev + 1);
            else setStreak(0);

            if (currentIndex < flashcards.length - 1) {
                setTimeout(() => handleNavigation("next"), 1500);
            } else {
                toast({ title: "Deck Complete!", description: "You've reviewed all cards in this set.", variant: "default", duration: 3000 });
                setTimeout(() => setLastProgressUpdate(null), 5000);
            }

        } catch (error) {
            console.error("Error updating progress:", error);
            toast({ title: "Error", description: "Could not save progress.", variant: "destructive" });
            setLastProgressUpdate(null);
        } finally {
            setTimeout(() => setLoading((prev) => ({ ...prev, updating: false })), 1600);
        }
    };

    const overallProgress = useMemo(() => {
        if (!flashcards || flashcards.length === 0) return 0;
        return ((currentIndex + 1) / flashcards.length) * 100;
    }, [currentIndex, flashcards]);

    const currentCard = flashcards?.[currentIndex];

    // Helper to get selected tag names for display
    const getSelectedTagNames = () => {
        if (selectedTagIds.length === 0) return "Select Tags...";
        if (selectedTagIds.length > 2) return `${selectedTagIds.length} tags selected`;
        return tags
            .filter(tag => selectedTagIds.includes(tag.id))
            .map(tag => tag.name)
            .join(", ");
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Select filters to find flashcards. Review questions using spaced repetition.
            </p>

            {/* Filters Section - Reordered and Dependencies Updated */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filter Flashcards</CardTitle>
                    <CardDescription>Select grade, subject, topic, and difficulty.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Grade Filter (First) */}
                    <Select
                        value={selectedGrade}
                        onValueChange={value => {
                            setSelectedGrade(value === "all" ? "" : value);
                            // Reset subsequent filters when grade changes
                            setSelectedSubjectId("");
                            setSelectedTopicId("");
                            setSelectedDifficulty("");
                        }}
                        disabled={loading.filters}
                    >
                        <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Grades (8-12)</SelectItem>
                            {GRADES.map((g) => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Subject Filter (Second) */}
                    <Select
                        value={selectedSubjectId}
                        onValueChange={value => {
                            setSelectedSubjectId(value === "all" ? "" : value);
                            setSelectedTopicId(""); // Reset topic when subject changes
                            setSelectedDifficulty("");
                        }}
                        disabled={loading.filters || !selectedGrade} // Depends on Grade
                    >
                        <SelectTrigger><SelectValue placeholder={loading.filters ? "Loading..." : (!selectedGrade ? "Grade First" : "Select Subject")} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Topic Filter (Third) */}
                    <Select
                        value={selectedTopicId}
                        onValueChange={value => {
                            setSelectedTopicId(value === "all" ? "" : value);
                            setSelectedDifficulty(""); // Reset difficulty when topic changes
                        }}
                        disabled={loading.filters || !selectedSubjectId} // Depends on Subject
                    >
                        <SelectTrigger><SelectValue placeholder={loading.filters ? "Loading..." : (!selectedSubjectId ? "Subject First" : "Select Topic")} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Topics</SelectItem>
                            {topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Difficulty Filter (Fourth) */}
                    <Select
                        value={selectedDifficulty}
                        onValueChange={value => setSelectedDifficulty(value === "all" ? "" : value)}
                        disabled={loading.filters || !selectedTopicId} // Depends on Topic
                    >
                        <SelectTrigger><SelectValue placeholder={!selectedTopicId ? "Topic First" : "Select Difficulty"} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            {DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Tag Filter (Combobox) */}
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={tagPopoverOpen}
                                className="w-full justify-between font-normal"
                                disabled={loading.filters}
                            >
                                <span className="truncate">{getSelectedTagNames()}</span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                            <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                    <CommandEmpty>No tags found.</CommandEmpty>
                                    <CommandGroup>
                                        {tags.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                value={tag.name} // Use name for searching
                                                onSelect={() => {
                                                    const updatedIds = selectedTagIds.includes(tag.id)
                                                        ? selectedTagIds.filter((id) => id !== tag.id)
                                                        : [...selectedTagIds, tag.id];
                                                    setSelectedTagIds(updatedIds);
                                                    // setTagPopoverOpen(false); // Keep open for multi-select
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {tag.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Search Filter (Last) */}
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search Q&A..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                            disabled={loading.flashcards} // Disable during fetch
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                </CardContent>
            </Card>

            {/* Flashcards Area */}
            <div className="mt-6">
                {loading.flashcards && (
                    <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading Cards...</span></div>
                )}

                {!loading.flashcards && flashcards.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">
                        No flashcards found. Select filters above or check back later.
                    </p>
                )}

                {!loading.flashcards && currentCard && (
                    <>
                        {/* Progress Bar */}
                        <Progress value={overallProgress} className="mb-4 h-2" />

                        <Card className="relative min-h-[350px] flex flex-col"> {/* Ensure minimum height */}
                            {/* Card Header with Meta */}
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                                    <span>{currentIndex + 1} / {flashcards.length}</span>
                                    {/* Display Subject > Topic */}
                                    <span className="font-medium">
                                        {currentCard.topic?.subject?.name ? `${currentCard.topic.subject.name} > ` : ''}
                                        {currentCard.topic?.name || 'Unknown Topic'}
                                    </span>
                                    {/* Display Grade & Difficulty */}
                                    <div>
                                        {currentCard.grade && <Badge variant="outline" className="mr-1">Grade {currentCard.grade}</Badge>}
                                        {currentCard.difficulty_level && <Badge variant="secondary" className="capitalize">{currentCard.difficulty_level}</Badge>}
                                    </div>
                                </div>
                                <CardTitle className="text-lg pt-4">Question:</CardTitle>
                                <CardDescription className="text-base text-foreground min-h-[60px] pt-1"> {/* Ensure some min height for question */}
                                    {currentCard.question}
                                </CardDescription>
                            </CardHeader>

                            {/* Card Content for Answer */}
                            <CardContent className="flex-grow pt-0 pb-4">
                                {isAnswerRevealed ? (
                                    <>
                                        <h3 className="text-md font-semibold text-primary mb-1">Answer:</h3>
                                        <p className="text-base text-foreground">{currentCard.answer}</p>
                                        {/* Display Tags */}
                                        {currentCard.tags && currentCard.tags.length > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <span className="text-xs font-medium text-muted-foreground mr-2">Tags:</span>
                                                {currentCard.tags.map(tag => (
                                                    <Badge key={tag.id} variant="outline" className="mr-1 mb-1">{tag.name}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <Button variant="outline" onClick={handleRevealAnswer}>Reveal Answer</Button>
                                    </div>
                                )}
                            </CardContent>

                            {/* Footer for Actions and Progress */}
                            <CardFooter className="flex flex-col items-center gap-4 pt-4 border-t">
                                {/* Progress Feedback Section */}
                                <div className="w-full text-center min-h-[60px]"> {/* Min height for feedback */}
                                    {loading.progress && <p className="text-xs text-muted-foreground">Loading progress...</p>}
                                    {lastProgressUpdate && (
                                        <Alert variant={lastProgressUpdate.is_correct ? "default" : "destructive"} className="text-sm py-2 px-3">
                                            <AlertDescription>
                                                {lastProgressUpdate.is_correct ? `Correct! (+${lastProgressUpdate.correct_count}, -${lastProgressUpdate.incorrect_count})` : `Incorrect. (+${lastProgressUpdate.correct_count}, -${lastProgressUpdate.incorrect_count})`}
                                                <span className="block text-xs">Next review: {formatNextReview(lastProgressUpdate.next_review_at)}</span>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {!loading.progress && !lastProgressUpdate && currentCardProgress && (
                                        <div className="text-xs text-muted-foreground space-x-2">
                                            <span>Correct: {currentCardProgress.correct_count}</span>
                                            <span>Incorrect: {currentCardProgress.incorrect_count}</span>
                                            <span>Level: {currentCardProgress.level}</span>
                                            <span>Next: {formatNextReview(currentCardProgress.next_review_at)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between w-full">
                                    <Button variant="outline" onClick={() => handleNavigation("prev")} disabled={currentIndex === 0 || loading.updating}>Previous</Button>
                                    {isAnswerRevealed && (
                                        <div className="flex gap-2">
                                            <Button variant="destructive" onClick={() => handleProgressUpdate(false)} disabled={loading.updating}>Incorrect</Button>
                                            <Button variant="default" onClick={() => handleProgressUpdate(true)} disabled={loading.updating}>Correct</Button>
                                        </div>
                                    )}
                                    <Button variant="outline" onClick={() => handleNavigation("next")} disabled={currentIndex === flashcards.length - 1 || loading.updating}>Next</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default FlashcardsPage;
