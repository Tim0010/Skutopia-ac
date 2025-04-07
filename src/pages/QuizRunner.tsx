import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Check, X, FileText, Loader2, Share2 } from "lucide-react";
import { getQuizById, Quiz, Question, Answer } from '@/services/quizService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormControl } from "@/components/ui/form";

const QuizRunner = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | null>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    interface QuizResult {
        correctAnswers: number;
        totalQuestions: number;
        scorePercent: number;
        detailedAnswers: { questionText: string; yourAnswer: string | null; correctAnswer: string; isCorrect: boolean }[];
    }
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (quizId) {
            loadQuizData();
        }
    }, [quizId]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (quizStarted && timeRemaining !== null && timeRemaining > 0 && !quizCompleted) {
            timer = setTimeout(() => {
                setTimeRemaining(prev => {
                    const nextTime = (prev ?? 0) - 1;
                    if (nextTime <= 0) {
                        if (!quizCompleted) {
                            console.log("Time's up! Submitting quiz...");
                            handleSubmitQuiz();
                        }
                        return 0;
                    }
                    return nextTime;
                });
            }, 1000);
        } else if (timeRemaining === 0 && quizStarted && !quizCompleted) {
            console.log("Time became 0, submitting quiz...");
            handleSubmitQuiz();
        }
        return () => clearTimeout(timer);
    }, [quizStarted, timeRemaining, quizCompleted]);

    const loadQuizData = async () => {
        try {
            setLoading(true);
            const data: Quiz | null = await getQuizById(quizId);
            if (data) {
                if (data.questions) {
                    data.questions.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
                }
                setQuiz(data);
                if (data.time_limit_minutes) {
                    setTimeRemaining(data.time_limit_minutes * 60);
                }
            } else {
                toast.error("Quiz not found");
                navigate('/quizzes');
            }
        } catch (error) {
            toast.error("Error loading quiz");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        if (!quiz) return;
        setQuizStarted(true);
        const initialAnswers: Record<string, string | null> = {};
        quiz.questions.forEach(q => {
            initialAnswers[q.id] = null;
        });
        setSelectedAnswers(initialAnswers);
    };

    const handleAnswerSelect = (questionId: string, answerId: string | null) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const goToNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (isSubmitting || quizCompleted || !quiz || !quiz.questions) return;

        setIsSubmitting(true);
        console.log("Submitting quiz...");

        let correctAnswersCount = 0;
        const detailedAnswersResult: QuizResult['detailedAnswers'] = [];

        quiz.questions.forEach((question: Question) => {
            const selectedAnswerId = selectedAnswers[question.id];
            const correctAnswer: Answer | undefined = question.answers.find(a => a.is_correct);
            const selectedAnswer: Answer | undefined | null = selectedAnswerId ? question.answers.find(a => a.id === selectedAnswerId) : null;
            let isCorrect = false;

            if (correctAnswer && selectedAnswerId === correctAnswer.id) {
                correctAnswersCount++;
                isCorrect = true;
            }

            detailedAnswersResult.push({
                questionText: question.text ?? "Question text missing",
                yourAnswer: selectedAnswer?.answer_text ?? "No Answer",
                correctAnswer: correctAnswer?.answer_text ?? "N/A",
                isCorrect: isCorrect
            });
        });

        const totalQuestions = quiz.questions.length;
        const scorePercent = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
        const scorePercentFormatted = parseFloat(scorePercent.toFixed(2));

        setQuizCompleted(true);
        setResult({
            correctAnswers: correctAnswersCount,
            totalQuestions: totalQuestions,
            scorePercent: scorePercentFormatted,
            detailedAnswers: detailedAnswersResult
        });
        setTimeRemaining(null);

        if (user?.id && quizId) {
            const attemptData = {
                user_id: user.id,
                quiz_id: quizId,
                grade: quiz.grade || null,
                subject: quiz.subject || null,
                topic: quiz.title || null,
                score_percentage: scorePercentFormatted,
                correct_answers: correctAnswersCount,
                total_questions: totalQuestions,
                submitted_at: new Date().toISOString()
            };
            console.log("Saving quiz attempt:", attemptData);
            try {
                const { error } = await supabase
                    .from('quiz_attempts' as any)
                    .insert(attemptData);
                if (error) {
                    console.error("Error saving quiz result:", error);
                    toast.error(`Failed to save quiz results: ${error.message}`);
                } else {
                    console.log("Quiz attempt saved successfully.");
                }
            } catch (error) {
                console.error("Exception saving quiz result:", error);
                toast.error("An unexpected error occurred while saving quiz results.");
            }
        }
        setIsSubmitting(false);
    };

    const formatTime = (seconds: number | null): string => {
        if (seconds === null || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Quiz not found or could not be loaded.</AlertDescription>
                </Alert>
                <Button onClick={() => navigate('/quizzes')} variant="outline" className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quizzes
                </Button>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="mb-6 shadow-lg dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">{quiz.title}</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {quiz.grade && <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm mr-2">Grade: {quiz.grade}</span>}
                            {quiz.subject && <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm">Subject: {quiz.subject}</span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {quiz.description && (
                            <p className="mb-4 text-gray-600 dark:text-gray-300">{quiz.description}</p>
                        )}
                        <div className="flex flex-col gap-3 mt-4 text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                                <span>{quiz.questions.length} questions</span>
                            </div>
                            {quiz.time_limit_minutes && (
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                                    <span>{quiz.time_limit_minutes} minutes time limit</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h3 className="font-medium text-blue-800 dark:text-blue-200">Instructions:</h3>
                            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
                                <li>Read each question carefully before answering.</li>
                                <li>Select the best answer for each question.</li>
                                <li>You can navigate between questions using the Previous/Next buttons.</li>
                                {quiz.time_limit_minutes && (
                                    <li>The quiz will automatically submit when the time runs out.</li>
                                )}
                                <li>Click "Submit Quiz" when you are finished.</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={startQuiz} className="w-full" size="lg">
                            Start Quiz
                        </Button>
                    </CardFooter>
                </Card>
                <Button variant="outline" onClick={() => navigate('/quizzes')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    if (quizCompleted && result) {
        const shareUrl = window.location.href;
        const shareText = `I scored ${result.scorePercent}% on the ${quiz.title} quiz on Skutopia Academy!`;

        const handleShare = () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Quiz Results',
                    text: shareText,
                    url: shareUrl,
                }).catch(error => console.log('Error sharing:', error));
            } else {
                navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                toast.success("Results link copied to clipboard!");
            }
        };

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="mb-6 shadow-lg dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Quiz Results</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly ({result.scorePercent}%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center space-x-4 mb-6">
                            <Button variant="outline" onClick={() => navigate('/quizzes')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Take Another Quiz
                            </Button>
                            <Button onClick={handleShare} className="bg-green-600 hover:bg-green-700">
                                <Share2 className="mr-2 h-4 w-4" /> Share Results
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {result.detailedAnswers.map((ans, index) => (
                                <Card key={index} className={`p-4 border-l-4 ${ans.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700'}`}>
                                    <p className="font-medium mb-2 text-gray-800 dark:text-gray-200">Question {index + 1}: {ans.questionText}</p>
                                    <p className="text-sm mb-1"><span className="font-semibold">Your Answer:</span> <span className={ans.isCorrect ? '' : 'text-red-600 dark:text-red-400'}>{ans.yourAnswer}</span></p>
                                    {!ans.isCorrect && (
                                        <p className="text-sm text-green-700 dark:text-green-400"><span className="font-semibold">Correct Answer:</span> {ans.correctAnswer}</p>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {ans.isCorrect
                                            ? <Check className="h-5 w-5 text-green-500" />
                                            : <X className="h-5 w-5 text-red-500" />}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    const progressValue = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
    const currentQuestionText = currentQuestion?.text ?? "Loading question...";
    const currentQuestionAnswers = currentQuestion?.answers ?? [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{quiz.title}</h1>
                {timeRemaining !== null && (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-medium px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(timeRemaining)}</span>
                    </div>
                )}
            </div>

            <Progress value={progressValue} className="mb-6 h-2" />

            <Card className="shadow-lg dark:bg-gray-800">
                <CardHeader>
                    <CardTitle>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardTitle>
                    <CardDescription className="text-lg pt-2 text-gray-800 dark:text-gray-200">{currentQuestionText}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={selectedAnswers[currentQuestion?.id ?? ''] ?? undefined}
                        onValueChange={(value) => currentQuestion && handleAnswerSelect(currentQuestion.id, value)}
                        className="space-y-3"
                    >
                        {currentQuestionAnswers.map((answer) => (
                            <div key={answer.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                <FormControl>
                                    <RadioGroupItem value={answer.id} id={`q${currentQuestion?.id}-a${answer.id}`} />
                                </FormControl>
                                <Label htmlFor={`q${currentQuestion?.id}-a${answer.id}`} className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200">
                                    {answer.answer_text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={goToPrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <Button onClick={goToNextQuestion}>
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default QuizRunner;
