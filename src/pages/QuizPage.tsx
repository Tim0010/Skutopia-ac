import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating quiz attempt IDs
import { useAuth } from '../contexts/AuthContext';
import {
    fetchQuizGrades,
    fetchQuizSubjects,
    fetchQuizTopics,
    fetchQuizQuestions,
    saveUserQuizAnswers,
    evaluateQuizAttempt,
    QuizQuestion,
    // UserQuizResponse,
} from '../data/quizService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import QuizReview from './QuizReview.tsx'; // We'll create this next

// Constants
const QUESTION_TIME_LIMIT = 90; // Seconds per question

type QuizState = 'selecting' | 'taking' | 'submitting' | 'reviewing' | 'error';

const QuizPage: React.FC = () => {
    const { user } = useAuth();
    const [quizState, setQuizState] = useState<QuizState>('selecting');

    // Filters
    const [grades, setGrades] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');

    // Quiz Data
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({}); // { [quizId: string]: selectedAnswer }
    const [quizAttemptId, setQuizAttemptId] = useState<string>('');

    // UI/Loading State
    const [loading, setLoading] = useState({
        filters: false,
        questions: false,
        submit: false,
    });
    const [error, setError] = useState<string | null>(null);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [timerExpired, setTimerExpired] = useState(false);

    // --- Filter Data Fetching ---
    useEffect(() => {
        setLoading(prev => ({ ...prev, filters: true }));
        fetchQuizGrades()
            .then(setGrades)
            .catch(() => toast({ title: "Error", description: "Could not load grades.", variant: "destructive" }))
            .finally(() => setLoading(prev => ({ ...prev, filters: false })));
    }, []);

    useEffect(() => {
        if (!selectedGrade) {
            setSubjects([]);
            setSelectedSubject('');
            return;
        }
        setLoading(prev => ({ ...prev, filters: true }));
        fetchQuizSubjects(selectedGrade)
            .then(setSubjects)
            .catch(() => toast({ title: "Error", description: "Could not load subjects.", variant: "destructive" }))
            .finally(() => setLoading(prev => ({ ...prev, filters: false })));
    }, [selectedGrade]);

    useEffect(() => {
        if (!selectedGrade || !selectedSubject) {
            setTopics([]);
            setSelectedTopic('');
            return;
        }
        setLoading(prev => ({ ...prev, filters: true }));
        fetchQuizTopics(selectedGrade, selectedSubject)
            .then(setTopics)
            .catch(() => toast({ title: "Error", description: "Could not load topics.", variant: "destructive" }))
            .finally(() => setLoading(prev => ({ ...prev, filters: false })));
    }, [selectedGrade, selectedSubject]);

    // Reset dependent filters
    const handleGradeChange = (value: string) => {
        setSelectedGrade(value);
        setSelectedSubject('');
        setSelectedTopic('');
        setSubjects([]);
        setTopics([]);
    };

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedTopic('');
        setTopics([]);
    };

    // --- Quiz Logic ---

    const startQuiz = async () => {
        if (!selectedGrade || !selectedSubject || !selectedTopic || !user) {
            toast({ title: "Selection Required", description: "Please select grade, subject, and topic.", variant: "default" });
            return;
        }
        setLoading(prev => ({ ...prev, questions: true }));
        setError(null);
        setQuizState('taking');
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        const attemptId = uuidv4(); // Generate unique ID for this attempt
        setQuizAttemptId(attemptId);

        try {
            const fetchedQuestions = await fetchQuizQuestions(selectedGrade, selectedSubject, selectedTopic, 20); // Fetch 20 questions
            if (fetchedQuestions.length < 5) { // Arbitrary minimum threshold
                 toast({ title: "Not Enough Questions", description: `Found only ${fetchedQuestions.length} questions. Need at least 5 to start.`, variant: "default" });
                 setQuizState('selecting');
                 setQuestions([]);
                 return;
            }
            setQuestions(fetchedQuestions);
            setQuizState('taking');
        } catch (err) {
            console.error("Failed to start quiz:", err);
            toast({ title: "Error", description: "Could not load quiz questions. Please try again.", variant: "destructive" });
            setError("Failed to load questions.");
            setQuizState('error');
            setQuestions([]);
        } finally {
            setLoading(prev => ({ ...prev, questions: false }));
        }
    };

    const handleSubmitQuiz = useCallback(async () => {
        if (!user || !quizAttemptId) {
            toast({ title: "Error", description: "User or quiz session not found.", variant: "destructive" });
            setQuizState('error');
            return;
        }

        setQuizState('submitting');
        setLoading(prev => ({ ...prev, submit: true }));

        // Format answers for saving
        const answersToSave = Object.entries(userAnswers).map(([quizId, selectedAnswer]) => ({
            quizId: quizId, // quizId from Object.entries is already the string (UUID) we need
            selectedAnswer: selectedAnswer, // Can be null if timed out
        }));

        try {
            // 1. Save the raw answers first
            await saveUserQuizAnswers(user.id, quizAttemptId, answersToSave);
            toast({ title: "Answers Saved", description: "Evaluating your quiz...", variant: "default" });

            // 2. Trigger evaluation (backend compares answers)
            const results = await evaluateQuizAttempt(user.id, quizAttemptId);
            setQuizState('reviewing');
            toast({ title: "Quiz Submitted!", description: "Review your results.", variant: "default" });

        } catch (error: any) {
            console.error("Error submitting quiz:", error);
            toast({ title: "Submission Error", description: error.message || "Could not submit quiz.", variant: "destructive" });
            setError(error.message || "Failed to submit quiz.");
            setQuizState('error');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    }, [user, quizAttemptId, userAnswers, toast]);

    /**
     * Handles selecting an answer for a specific question.
     * Also triggered by the timer when time expires (selectedAnswer = null).
     */
    const handleAnswerSelect = useCallback((quizId: string, selectedAnswer: string | null) => {
        // quizId is now expected to be a string (UUID)

        console.log(`Answer selected for ${quizId}: ${selectedAnswer}`);
        const updatedAnswers = {
            ...userAnswers,
            [quizId]: selectedAnswer // Store null if timed out
        };
        setUserAnswers(updatedAnswers);

        // Move to next question or finish quiz
        // Progression logic remains the same, timer just provides a way to call this
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            // Timer reset is handled by the useEffect hook triggered by index change
        } else {
            // Last question answered/timed out, prepare for submission
            console.log("Last question reached. Ready to submit.");
            handleSubmitQuiz(); // Auto-submit for now
        }
    }, [currentQuestionIndex, questions.length, userAnswers, handleSubmitQuiz]);

    const currentQuestion = useMemo(() => questions?.[currentQuestionIndex], [questions, currentQuestionIndex]);
    const options = useMemo(() => {
        if (!currentQuestion) return [];
        // Shuffle options for display
        const opts = [currentQuestion.option_a, currentQuestion.option_b, currentQuestion.option_c, currentQuestion.option_d];
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        return opts;
    }, [currentQuestion]);

    const selectedAnswerForCurrent = userAnswers[currentQuestion?.id ?? ''] ?? null;

    // --- Timer Effect ---
    useEffect(() => {
        // Only run the timer when actively taking the quiz and on a valid question
        if (quizState !== 'taking' || currentQuestionIndex >= questions.length) {
            return; // Exit if not in 'taking' state or no more questions
        }

        // Reset timer and expiry flag for the new question
        setTimeLeft(QUESTION_TIME_LIMIT);
        setTimerExpired(false);

        // Set up the interval
        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId); // Stop the timer
                    setTimerExpired(true); // Mark as expired
                    // Automatically submit 'null' or a specific TIMEOUT indicator when time runs out
                    // We need to ensure handleAnswerSelect can handle this and moves to the next question
                    const currentId = questions[currentQuestionIndex]?.id;
                    console.log(`Timer expired for question index ${currentQuestionIndex}, ID: ${currentId}`);
                    if (currentId) { // Check if ID exists
                        handleAnswerSelect(currentId, null); // Pass string ID
                    } else {
                        console.error("Timer expired but could not get question ID.");
                    }
                    return 0;
                } 
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup function to clear interval when component unmounts,
        // question changes, or quiz state changes
        return () => clearInterval(timerId);

    }, [quizState, currentQuestionIndex, questions.length]); // Dependencies: run when state, index, or questions length changes

    // --- Render Logic ---

    if (quizState === 'error') {
        return (
            <div className="container mx-auto p-4 text-center">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "An unexpected error occurred."}</AlertDescription>
                </Alert>
                <Button onClick={() => setQuizState('selecting')} className="mt-4">Try Again</Button>
            </div>
        );
    }

    if (quizState === 'reviewing') {
        return <QuizReview userId={user!.id} quizAttemptId={quizAttemptId} onRestart={() => setQuizState('selecting')} />;
    }

    if (quizState === 'submitting') {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl font-semibold">Submitting your answers...</p>
                <p className="text-muted-foreground">Calculating your results.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Take a Quiz</h1>

            {quizState === 'selecting' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Quiz Topic</CardTitle>
                        <CardDescription>Choose your grade, subject, and topic to start the quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select onValueChange={handleGradeChange} value={selectedGrade} disabled={loading.filters}>
                            <SelectTrigger><SelectValue placeholder={loading.filters && !grades.length ? "Loading..." : "Select Grade..."} /></SelectTrigger>
                            <SelectContent>
                                {grades.map((grade) => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={handleSubjectChange} value={selectedSubject} disabled={!selectedGrade || loading.filters}>
                             <SelectTrigger><SelectValue placeholder={loading.filters && selectedGrade && !subjects.length ? "Loading..." : "Select Subject..."} /></SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setSelectedTopic} value={selectedTopic} disabled={!selectedSubject || loading.filters}>
                            <SelectTrigger><SelectValue placeholder={loading.filters && selectedSubject && !topics.length ? "Loading..." : "Select Topic..."} /></SelectTrigger>
                            <SelectContent>
                                {topics.map((topic) => (
                                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={startQuiz} disabled={!selectedTopic || loading.questions || loading.filters}>
                            {loading.questions ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "Start Quiz"}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {quizState === 'taking' && currentQuestion && (
                <Card>
                    <CardHeader>
                        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                        <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <RadioGroup
                             key={`${currentQuestion.id}-${timeLeft}`} // Re-render radio group if needed, though maybe not necessary
                             value={userAnswers[currentQuestion.id] ?? ''} 
                             // Wrap the handler to pass both quizId (explicitly Number) and value
                             onValueChange={(value) => {
                                 const currentId = currentQuestion?.id;
                                 console.log(`Radio changed for question ID: ${currentId}`);
                                 if (currentId) { // Check if ID exists
                                     handleAnswerSelect(currentId, value); // Pass string ID
                                 } else {
                                     console.error("Radio changed but could not get question ID.");
                                 }
                             }} 
                             className="grid grid-cols-1 md:grid-cols-2 gap-4"
                             disabled={timerExpired} // Disable options if timer expired
                          >
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                     <RadioGroupItem value={option} id={`option-${index}`} />
                                     <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 p-3 border rounded-md hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary">
                                         {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {/* Timer Display & Progress Bar */}
                        <div className="mt-4">
                             <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                                <div 
                                    className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                                    style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">Time Left: {timeLeft}s</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {/* Placeholder for potential prev button? */}
                         <div></div>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={!selectedAnswerForCurrent}>
                                Next Question
                            </Button>
                        ) : (
                            <Button onClick={handleSubmitQuiz} disabled={!selectedAnswerForCurrent} >
                                Submit Quiz
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default QuizPage;
