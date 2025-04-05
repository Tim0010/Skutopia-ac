import React, { useState, useEffect } from 'react';
import { fetchQuizAttemptResults, QuizResult } from '../data/quizService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, RotateCcw, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface QuizReviewProps {
    userId: string;
    quizAttemptId: string;
    onRestart: () => void; // Function to go back to quiz selection
}

const QuizReview: React.FC<QuizReviewProps> = ({ userId, quizAttemptId, onRestart }) => {
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchQuizAttemptResults(userId, quizAttemptId)
            .then(data => {
                // Ensure data has is_correct populated (evaluation should be complete)
                if (data.some(r => r.is_correct === null)) {
                    console.warn("Evaluation might not be complete, some results are null.");
                    // Optional: add a small delay and retry?
                }
                setResults(data);
            })
            .catch(err => {
                console.error("Error fetching quiz results:", err);
                setError("Could not load your quiz results. Please try restarting.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId, quizAttemptId]);

    const score = results.filter(r => r.is_correct).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Function to handle WhatsApp sharing
    const handleShare = () => {
        // Simple message without topic for now
        const message = `I scored ${score}/${total} (${percentage}%) on a quiz on Skutopia Academy! Check it out: ${window.location.origin}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        
        // Open WhatsApp link in a new tab
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl font-semibold">Loading Results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 text-center">
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={onRestart} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Results</CardTitle>
                    <CardDescription>You answered {score} out of {total} questions correctly ({percentage}%).</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2">
                    <Button onClick={onRestart} variant="outline">
                         <RotateCcw className="mr-2 h-4 w-4" /> Take Another Quiz
                    </Button>
                    <Button onClick={handleShare} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                         <Share2 className="mr-2 h-4 w-4" /> Share Results
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                {results.map((result, index) => (
                    <Card key={result.id} className={result.is_correct ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                 <CardTitle className="text-base font-medium">Question {index + 1}</CardTitle>
                                 <CardDescription>{result.question.question}</CardDescription>
                            </div>
                            {result.is_correct ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-500" />
                            )}
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div>Your Answer: <Badge variant={result.is_correct ? "default" : "destructive"} className="ml-2 align-middle">{result.selected_answer || <em>Timed Out</em>}</Badge></div>
                            {!result.is_correct && (
                                <div className="mt-1">Correct Answer: <Badge variant="secondary" className="ml-2 align-middle bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{result.question.correct_answer}</Badge></div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuizReview;
