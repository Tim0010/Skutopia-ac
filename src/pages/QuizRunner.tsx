
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
import { ArrowLeft, ArrowRight, Clock, Check, X, FileText } from "lucide-react";
import { getQuizById } from '@/services/quizService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const QuizRunner = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (quizId) {
            loadQuizData();
        }
    }, [quizId]);

    // Timer effect
    useEffect(() => {
        let timer;
        if (quizStarted && timeRemaining > 0 && !quizCompleted) {
            timer = setTimeout(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Time's up - submit the quiz
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeRemaining === 0 && !quizCompleted) {
            handleSubmitQuiz();
        }

        return () => clearTimeout(timer);
    }, [quizStarted, timeRemaining, quizCompleted]);

    const loadQuizData = async () => {
        try {
            setLoading(true);
            const data = await getQuizById(quizId);
            if (data) {
                setQuiz(data);
                // Sort questions by order_index if available
                if (data.questions) {
                    data.questions.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                }
                
                // Set the time limit
                if (data.time_limit_minutes) {
                    setTimeRemaining(data.time_limit_minutes * 60); // Convert to seconds
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
        setQuizStarted(true);
        // Initialize selected answers
        const initialAnswers = {};
        quiz.questions.forEach(q => {
            initialAnswers[q.id] = null;
        });
        setSelectedAnswers(initialAnswers);
    };

    const handleAnswerSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        // Calculate score
        let correctAnswers = 0;
        let totalPoints = 0;
        
        quiz.questions.forEach(question => {
            const selectedAnswerId = selectedAnswers[question.id];
            const correctAnswer = question.answers.find(a => a.is_correct);
            
            if (selectedAnswerId && correctAnswer && selectedAnswerId === correctAnswer.id) {
                correctAnswers++;
                totalPoints += question.points || 1;
            }
            
            totalPoints += question.points || 0;
        });
        
        const scorePercent = (correctAnswers / quiz.questions.length) * 100;
        
        // Record the result
        try {
            if (user) {
                // Save quiz attempt to Supabase
                const { error } = await supabase
                    .from('quiz_attempts')
                    .insert({
                        user_id: user.id,
                        quiz_id: quizId,
                        score: scorePercent,
                        answers: selectedAnswers,
                        completed_at: new Date().toISOString()
                    });
                
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error saving quiz result:", error);
        }
        
        setQuizCompleted(true);
        setResult({
            correctAnswers,
            totalQuestions: quiz.questions.length,
            scorePercent,
            totalPoints
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Quiz not found</h1>
                <Button onClick={() => navigate('/quizzes')} className="mt-4">
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    // Quiz intro screen
    if (!quizStarted) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                        <CardDescription>
                            {quiz.grade && <div className="mt-1">Grade: {quiz.grade}</div>}
                            {quiz.subject && <div className="mt-1">Subject: {quiz.subject}</div>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {quiz.description && (
                            <p className="mb-4">{quiz.description}</p>
                        )}
                        <div className="flex flex-col gap-3 mt-4">
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

                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <h3 className="font-medium">Instructions:</h3>
                            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                                <li>Read each question carefully before answering</li>
                                <li>You can navigate between questions using the previous and next buttons</li>
                                <li>You can review your answers before submitting</li>
                                {quiz.time_limit_minutes && (
                                    <li>The quiz will automatically submit when the time limit is reached</li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={startQuiz} className="w-full">
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

    // Quiz results screen
    if (quizCompleted && result) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Quiz Results</CardTitle>
                        <CardDescription>{quiz.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative w-40 h-40 mb-4">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-bold">
                                        {Math.round(result.scorePercent)}%
                                    </span>
                                </div>
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e6e6e6"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={result.scorePercent >= 70 ? "#4ade80" : result.scorePercent >= 50 ? "#facc15" : "#ef4444"}
                                        strokeWidth="3"
                                        strokeDasharray={`${result.scorePercent}, 100`}
                                    />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold">
                                You got {result.correctAnswers} out of {result.totalQuestions} questions correct
                            </p>
                            <p className="text-muted-foreground mt-1">
                                Score: {Math.round(result.scorePercent)}%
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Review Questions</h3>
                            {quiz.questions.map((question, index) => {
                                const userAnswerId = selectedAnswers[question.id];
                                const userAnswer = question.answers.find(a => a.id === userAnswerId);
                                const correctAnswer = question.answers.find(a => a.is_correct);
                                const isCorrect = userAnswerId === correctAnswer?.id;
                                
                                return (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-medium">
                                                Question {index + 1}: {question.question_text}
                                            </h4>
                                            {userAnswerId ? (
                                                isCorrect ? (
                                                    <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-1 rounded-full">
                                                        <Check className="h-5 w-5" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-1 rounded-full">
                                                        <X className="h-5 w-5" />
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-amber-500 font-medium">Not answered</span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-2">
                                            <p className="text-sm">
                                                <span className="font-medium">Your answer: </span>
                                                {userAnswer ? userAnswer.answer_text : "None"}
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                <span className="font-medium">Correct answer: </span>
                                                {correctAnswer?.answer_text}
                                            </p>
                                            {correctAnswer?.explanation && (
                                                <p className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                                    <span className="font-medium">Explanation: </span>
                                                    {correctAnswer.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate('/quizzes')} className="w-full">
                            Return to Quizzes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Quiz taking screen
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Timer and progress bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    {timeRemaining !== null && (
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>
                <Progress value={(currentQuestionIndex + 1) / quiz.questions.length * 100} />
            </div>
            
            {/* Question */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                    <CardDescription className="text-lg">{currentQuestion.question_text}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup 
                        value={selectedAnswers[currentQuestion.id] || ""} 
                        onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                    >
                        <div className="space-y-3">
                            {currentQuestion.answers.map((answer) => (
                                <div 
                                    key={answer.id} 
                                    className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50 cursor-pointer"
                                >
                                    <RadioGroupItem value={answer.id} id={answer.id} />
                                    <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                                        {answer.answer_text}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
            
            {/* Navigation */}
            <div className="flex justify-between">
                <Button 
                    variant="outline" 
                    onClick={goToPrevQuestion}
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Question
                </Button>
                
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <Button 
                        onClick={goToNextQuestion}
                        disabled={!selectedAnswers[currentQuestion.id]}
                    >
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmitQuiz}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Submit Quiz
                    </Button>
                )}
            </div>
        </div>
    );
};

export default QuizRunner;
