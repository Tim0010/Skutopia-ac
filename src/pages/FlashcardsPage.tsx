import React, { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress"; // Added progress bar
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
    fetchFlashcards,
    getAvailableGrades,
    getAvailableSubjects,
    getAvailableTopics,
    updateFlashcardProgress,
    fetchSingleFlashcardProgress,
    FlashcardData,
    FlashcardProgressData
} from "@/data/flashcardService";

// Helper: Format next review date
const formatNextReview = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not scheduled";
    try { // Add try-catch for invalid date strings
        const date = new Date(dateString);
        const now = new Date();
        // If review is far in the future, show the date. Otherwise, show relative time.
        if (date.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
            return format(date, "MMM d, yyyy");
        }
        return formatDistanceToNowStrict(date, { addSuffix: true });
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid date";
    }
};

const FlashcardsPage: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    // --- Filter States ---
    const [availableGrades, setAvailableGrades] = useState<string[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");

    // --- Flashcard States ---
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

    // --- Progress States ---
    const [currentCardProgress, setCurrentCardProgress] = useState<FlashcardProgressData | null>(null);
    const [lastProgressUpdate, setLastProgressUpdate] = useState<FlashcardProgressData | null>(null); // For immediate feedback
    const [streak, setStreak] = useState<number>(0); // Basic streak counter (needs persistent storage later)
    const [loading, setLoading] = useState<{ filters: boolean; flashcards: boolean; progress: boolean; updating: boolean }>({
        filters: false,
        flashcards: false,
        progress: false,
        updating: false
    });

    // --- Data Fetching Effects ---

    // Fetch available grades
    useEffect(() => {
        setLoading((prev) => ({ ...prev, filters: true }));
        getAvailableGrades()
            .then(setAvailableGrades)
            .catch(() => toast({ title: "Error", description: "Could not load grades.", variant: "destructive" }))
            .finally(() => setLoading((prev) => ({ ...prev, filters: false })));
    }, [toast]);

    // Fetch available subjects when grade changes
    useEffect(() => {
        if (!selectedGrade) {
            setAvailableSubjects([]);
            setSelectedSubject(""); // Reset subsequent filters
            setAvailableTopics([]);
            setSelectedTopic("");
            return;
        };
        setAvailableSubjects([]); // Clear previous subjects
        setSelectedSubject("");
        setAvailableTopics([]);
        setSelectedTopic("");
        setLoading((prev) => ({ ...prev, filters: true }));
        getAvailableSubjects(selectedGrade)
            .then(setAvailableSubjects)
            .catch(() => toast({ title: "Error", description: "Could not load subjects.", variant: "destructive" }))
            .finally(() => setLoading((prev) => ({ ...prev, filters: false })));
    }, [selectedGrade, toast]);

    // Fetch available topics when grade or subject changes
    useEffect(() => {
        if (!selectedGrade || !selectedSubject) {
             setAvailableTopics([]);
             setSelectedTopic("");
             return;
        };
        setAvailableTopics([]); // Clear previous topics
        setSelectedTopic("");
        setLoading((prev) => ({ ...prev, filters: true }));
        getAvailableTopics(selectedGrade, selectedSubject)
            .then(setAvailableTopics)
            .catch(() => toast({ title: "Error", description: "Could not load topics.", variant: "destructive" }))
            .finally(() => setLoading((prev) => ({ ...prev, filters: false })));
    }, [selectedGrade, selectedSubject, toast]);

    // Fetch flashcards when filters change
    useEffect(() => {
        if (!selectedGrade || !selectedSubject || !selectedTopic) {
            setFlashcards([]);
            setCurrentIndex(0);
            setIsAnswerRevealed(false);
            setCurrentCardProgress(null);
            setLastProgressUpdate(null);
            return;
        };
        setLoading((prev) => ({ ...prev, flashcards: true }));
        setIsAnswerRevealed(false);
        setCurrentCardProgress(null);
        setLastProgressUpdate(null);
        fetchFlashcards(selectedGrade, selectedSubject, selectedTopic)
            .then((data) => {
                setFlashcards(data);
                setCurrentIndex(0);
                 if (data.length === 0) {
                    toast({ title: "No Flashcards Found", description: "Try different filter criteria.", variant: "default" });
                }
            })
            .catch(() => toast({ title: "Error", description: "Could not load flashcards.", variant: "destructive" }))
            .finally(() => setLoading((prev) => ({ ...prev, flashcards: false })));
    }, [selectedGrade, selectedSubject, selectedTopic, toast]);

    // Fetch progress for current card
    useEffect(() => {
        const currentCard = flashcards?.[currentIndex];
        setLastProgressUpdate(null); // Clear feedback when card changes

        if (!user || !currentCard) {
            setCurrentCardProgress(null); // Clear if no user or card
            return;
        };
        setLoading((prev) => ({ ...prev, progress: true }));
        fetchSingleFlashcardProgress(user.id, currentCard.id)
            .then(setCurrentCardProgress)
            .catch(() => {
                 // Don't toast on progress fetch error, might be too noisy
                 console.error("Failed to fetch progress for card:", currentCard.id);
                 setCurrentCardProgress(null);
            })
            .finally(() => setLoading((prev) => ({ ...prev, progress: false })));
    }, [currentIndex, user, flashcards]); // Rerun on user, card index, or deck change

    // --- Helper Functions ---

    const handleRevealAnswer = () => {
        setIsAnswerRevealed(true);
    };

    // Handle navigation
    const handleNavigation = (direction: "prev" | "next") => {
        setIsAnswerRevealed(false); // Hide answer on navigate
        // lastProgressUpdate is cleared by the useEffect watching currentIndex
        setCurrentIndex((prev) => Math.max(0, Math.min(prev + (direction === "next" ? 1 : -1), flashcards.length - 1)));
    };

    // Handle progress update
    const handleProgressUpdate = async (isCorrect: boolean) => {
        if (!user) {
             toast({ title: "Login Required", description: "Please log in to save your progress.", variant: "destructive" });
             return;
        }
        const currentCard = flashcards?.[currentIndex];
        if (!currentCard || loading.updating) return; // Prevent double clicks

        setLoading((prev) => ({ ...prev, updating: true }));
        setLastProgressUpdate(null); // Clear previous feedback immediately

        try {
            const updatedProgress = await updateFlashcardProgress(user.id, currentCard.id, isCorrect);
            setCurrentCardProgress(updatedProgress); // Update displayed progress
            setLastProgressUpdate(updatedProgress); // Set feedback data

            // Update streak (simple version)
            if (isCorrect) setStreak((prev) => prev + 1);
            else setStreak(0);

            // Optionally move to next card after a delay to show feedback
            if (currentIndex < flashcards.length - 1) {
                 setTimeout(() => handleNavigation("next"), 1500); // 1.5s delay
            } else {
                 toast({ title: "Deck Complete!", description: "You've reviewed all cards in this set.", variant: "default", duration: 3000 });
                 // Don't auto-navigate on the last card, let user see final feedback/progress
                 // Clear feedback after a longer delay on the last card?
                 setTimeout(() => setLastProgressUpdate(null), 5000);
            }

        } catch (error) {
             console.error("Error updating progress:", error);
             toast({ title: "Error", description: "Could not save progress.", variant: "destructive" });
             // Don't clear progress on error, show last known state
             setLastProgressUpdate(null); // Clear any feedback attempt on error
        } finally {
            // Delay setting updating to false slightly longer than navigation delay
            // to prevent accidental clicks during transition
            setTimeout(() => setLoading((prev) => ({ ...prev, updating: false })), 1600);
        }
    };

    // Calculate overall progress percentage
    const overallProgress = useMemo(() => {
        if (!flashcards || flashcards.length === 0) return 0;
        return ((currentIndex + 1) / flashcards.length) * 100;
    }, [currentIndex, flashcards]);

    const currentCard = flashcards?.[currentIndex];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Review questions using spaced repetition. Correct answers increase the time until you see the card again, helping you memorize.
            </p>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Select value={selectedGrade} onValueChange={setSelectedGrade} disabled={loading.filters}>
                    <SelectTrigger><SelectValue placeholder={loading.filters ? "Loading..." : "Select Grade"} /></SelectTrigger>
                    <SelectContent>{availableGrades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={loading.filters || !selectedGrade}>
                    <SelectTrigger><SelectValue placeholder={loading.filters ? "Loading..." : (selectedGrade ? "Select Subject" : "Grade First")} /></SelectTrigger>
                    <SelectContent>{availableSubjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={loading.filters || !selectedSubject}>
                    <SelectTrigger><SelectValue placeholder={loading.filters ? "Loading..." : (selectedSubject ? "Select Topic" : "Subject First")} /></SelectTrigger>
                    <SelectContent>{availableTopics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            {/* Flashcards Area */}
            <div className="mt-6">
                {loading.flashcards && (
                    <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading Cards...</span></div>
                )}
                 {!loading.flashcards && flashcards.length === 0 && selectedGrade && selectedSubject && selectedTopic && (
                    <p className="text-center text-muted-foreground">No flashcards found for this selection.</p>
                )}

                 {!loading.flashcards && currentCard && (
                    <Card className="w-full max-w-lg mx-auto">
                        <CardHeader>
                            {/* Overall Progress Bar */}
                            <Progress value={overallProgress} className="w-full mb-2 h-2" />
                            <CardTitle>Card {currentIndex + 1} of {flashcards.length}</CardTitle>
                            <CardDescription>
                                {currentCard.topic} | Streak: {streak} 🔥
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[200px] flex flex-col justify-center relative"> {/* Added relative positioning */}
                            {/* Question */}
                            <p className="text-lg font-semibold mb-4">{currentCard.question}</p>

                            {/* Answer (Revealed) */}
                            {isAnswerRevealed && !lastProgressUpdate && ( // Show answer only if revealed AND no feedback is active
                                <p className="text-base text-muted-foreground">{currentCard.answer}</p>
                            )}

                             {/* Immediate Feedback Alert */}
                            {lastProgressUpdate && (
                                <Alert variant={lastProgressUpdate.is_correct ? "default" : "destructive"} className="mt-4">
                                    {/* Optional Icon? */}
                                    <AlertTitle>{lastProgressUpdate.is_correct ? "Correct!" : "Incorrect!"}</AlertTitle>
                                    <AlertDescription>
                                        {lastProgressUpdate.is_correct
                                            ? `Moved to Level ${lastProgressUpdate.level}. Review ${formatNextReview(lastProgressUpdate.next_review_at)}.`
                                            : `Back to Level ${lastProgressUpdate.level}. Review ${formatNextReview(lastProgressUpdate.next_review_at)}.`}
                                    </AlertDescription>
                                </Alert>
                            )}

                             {/* Loading overlay during update */}
                             {loading.updating && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            {/* Action Buttons */}
                            {!isAnswerRevealed ? (
                                <Button
                                    onClick={handleRevealAnswer}
                                    className="w-full"
                                    disabled={loading.updating || !!lastProgressUpdate} // Disable while updating or showing feedback
                                >
                                    Reveal Answer
                                </Button>
                            ) : (
                                <div className="flex w-full space-x-2">
                                    <Button
                                        variant={lastProgressUpdate && !lastProgressUpdate.is_correct ? "destructive" : "outline"}
                                        onClick={() => handleProgressUpdate(false)}
                                        disabled={loading.updating || !!lastProgressUpdate} // Disable after answer OR while updating
                                        className="flex-1"
                                    >
                                        Incorrect
                                    </Button>
                                    <Button
                                         variant={lastProgressUpdate && lastProgressUpdate.is_correct ? "default" : "default"}
                                        onClick={() => handleProgressUpdate(true)}
                                        disabled={loading.updating || !!lastProgressUpdate} // Disable after answer OR while updating
                                        className="flex-1"
                                    >
                                        Correct
                                    </Button>
                                </div>
                            )}

                            {/* Progress Details Display */}
                            {(isAnswerRevealed || lastProgressUpdate) && ( // Show details if revealed or after answering
                                <div className="text-sm text-muted-foreground mt-4 w-full text-center border-t pt-3">
                                    {loading.progress && !currentCardProgress ? ( // Show loader only if loading AND no data yet
                                        <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                                    ) : currentCardProgress ? (
                                        <span>
                                            📊 Lvl: {currentCardProgress.level} | ✅: {currentCardProgress.correct_count} | ❌: {currentCardProgress.incorrect_count} | 📅 Next: {formatNextReview(currentCardProgress.next_review_at)}
                                        </span>
                                    ) : (
                                        !loading.progress && <span>No progress recorded yet.</span> // Show only if not loading
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between w-full pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleNavigation('prev')}
                                    disabled={currentIndex === 0 || loading.updating || !!lastProgressUpdate} // Disable on first card, updating, or feedback shown
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleNavigation('next')}
                                    disabled={currentIndex >= flashcards.length - 1 || loading.updating || !!lastProgressUpdate} // Disable on last card, updating, or feedback shown
                                >
                                    Next
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                 )}
            </div>
        </div>
    );
};

export default FlashcardsPage;
