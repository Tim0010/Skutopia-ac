import { useState, useEffect } from "react";
import { History, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Attempt to restore full QuizAttempt interface again
interface QuizAttempt {
  id: string;
  quiz_id: string;
  grade: string | null;
  subject: string | null;
  topic: string | null;
  score_percentage: number | null;
  submitted_at: string;
}

const Quizzes = () => {
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserAttempts();
    } else {
      setLoadingAttempts(false);
      setUserAttempts([]);
    }
  }, [user]);

  const fetchUserAttempts = async () => {
    if (!user) return;
    setLoadingAttempts(true);
    console.log("Quizzes.tsx: Starting fetchUserAttempts (full details - attempt 3)...");
    try {
      // Try fetching all relevant columns again
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id, 
          grade,
          subject,
          topic,
          score_percentage,
          submitted_at
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false }); // Order by submission time

      if (error) {
        console.error("Quizzes.tsx: Supabase error fetching full attempts:", error);
        // Display a more specific error if possible
        toast.error(`Failed to load history: ${error.message}`);
        throw error; // Re-throw to be caught by catch block
      }
      console.log("Quizzes.tsx: Raw full attempt data from Supabase:", data);

      setUserAttempts((data as QuizAttempt[] | null) || []);
    } catch (error) {
      // Catch block handles errors thrown from try or from the fetch itself
      console.error("Error fetching full quiz attempts catch block:", error);
      // Toast is shown already if it was a Supabase error, avoid double toast
      // toast.error("Failed to load your quiz history");
      setUserAttempts([]); // Ensure state is reset on error
    } finally {
      console.log("Quizzes.tsx: fetchUserAttempts finished.");
      setLoadingAttempts(false);
    }
  };

  // Restore formatDate utility
  const formatDate = (dateString: string) => {
    try {
      // Check for invalid date string before formatting
      if (!dateString || isNaN(new Date(dateString).getTime())) {
        return "Invalid Date";
      }
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quizzes</h1>
        <p className="text-muted-foreground">
          Start a new quiz or review your past results.
        </p>
      </div>

      {/* Section to Start New Quiz */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Start a New Quiz</h2>
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground mb-4">Generate a new quiz based on your selected grade, subject, and topic.</p>
          <Button onClick={() => navigate('/start-quiz')}>
            Start Dynamic Quiz
          </Button>
        </Card>
      </section>

      {/* Quiz History Section */}
      {user && (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center">
            <History className="mr-2 h-6 w-6" /> My Quiz History
          </h2>
          {loadingAttempts ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : userAttempts.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Date Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.topic || '-'}</TableCell>
                      <TableCell>{attempt.subject || '-'}</TableCell>
                      <TableCell>{attempt.grade || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {attempt.score_percentage !== null ? `${attempt.score_percentage.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(attempt.submitted_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-40 border-dashed">
              <p className="text-muted-foreground">You haven't completed any quizzes yet.</p>
            </Card>
          )}
        </section>
      )}

    </div>
  );
};

export default Quizzes;
