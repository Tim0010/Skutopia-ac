import React, { useEffect, useState } from 'react';
import { fetchLeaderboardWithMaxScore, LeaderboardEntry } from '../data/quizService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"; // Use shadcn Progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Trophy } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [maxScore, setMaxScore] = useState<number>(100); // Default max score
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchLeaderboardWithMaxScore()
            .then(data => {
                setLeaders(data.leaderboard);
                // Ensure maxScore is at least 1 to avoid potential NaN/Infinity if leaders have 0 score
                setMaxScore(Math.max(1, data.maxScore));
            })
            .catch(err => {
                console.error("Error loading leaderboard:", err);
                setError("Could not load the leaderboard. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl font-semibold">Loading Leaderboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 text-center">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>

            {leaders.length === 0 && !loading && (
                 <p className="text-center text-muted-foreground">No scores recorded yet. Take a quiz to get on the board!</p>
            )}

            <div className="space-y-4 max-w-2xl mx-auto">
                {leaders.map((leader, index) => {
                    // Calculate percentage relative to the fetched maxScore
                    const progressPercentage = (leader.highest_score / maxScore) * 100;

                    return (
                        <Card key={leader.user_id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 p-4">
                                <div className="flex items-center space-x-3">
                                     <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                        #{index + 1}
                                     </span>
                                     <span className="font-medium truncate">{leader.username}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">{leader.highest_score}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {leader.total_quizzes_taken} quiz{leader.total_quizzes_taken !== 1 ? 'zes' : ''} taken
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                {/* Use shadcn Progress component */}
                                <Progress value={progressPercentage} className="h-2" />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardPage;
