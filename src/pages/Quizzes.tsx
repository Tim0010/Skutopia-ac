
import { useState, useEffect } from "react";
import { Check, Clock, FileText, Search, Star, Trophy, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Define types for quizzes from the database
interface Quiz {
  id: string;
  title: string;
  description: string | null;
  grade: string | null;
  subject: string | null;
  time_limit_minutes: number | null;
  created_at: string;
  created_by: string | null;
  tutor_id: string | null;
  question_count?: number;
  attempts?: number;
  avg_score?: number;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
}

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
    if (user) {
      fetchUserAttempts();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Fetch quizzes from Supabase
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:questions(id)
        `);

      if (error) {
        throw error;
      }

      // Process the data to get question counts
      const processedQuizzes = data.map(quiz => ({
        ...quiz,
        question_count: quiz.questions ? quiz.questions.length : 0,
        // Placeholder data that would ideally come from analytics tables
        attempts: Math.floor(Math.random() * 300) + 50,
        avg_score: Math.floor(Math.random() * 30) + 60
      }));

      setQuizzes(processedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    if (!user) return;
    
    try {
      // Fetch user's quiz attempts from Supabase
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setUserAttempts(data || []);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
    }
  };

  // Filter quizzes based on search term, category and difficulty
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      searchTerm === "" ||
      (quiz.title && quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.subject && quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.grade && quiz.grade.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || (quiz.subject && quiz.subject === selectedCategory);
      
    // For difficulty, we'll use grade as a proxy for now
    const matchesDifficulty =
      selectedDifficulty === "all" || (quiz.grade && mapGradeToDifficulty(quiz.grade) === selectedDifficulty);

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Map grade to difficulty (simple mapping for now)
  const mapGradeToDifficulty = (grade: string): string => {
    const gradeNum = parseInt(grade.replace(/\D/g, ''));
    if (isNaN(gradeNum)) return "Intermediate";
    if (gradeNum <= 6) return "Beginner";
    if (gradeNum <= 9) return "Intermediate";
    return "Advanced";
  };

  // Get unique categories and difficulties for filters
  const categories = Array.from(
    new Set(quizzes.filter(q => q.subject).map((quiz) => quiz.subject!))
  ).sort();
  
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  // Check if the user has completed a quiz
  const getQuizAttempt = (quizId: string) => {
    return userAttempts.find(attempt => attempt.quiz_id === quizId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge and track your progress with our interactive quizzes
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredQuizzes.length} quizzes
      </div>

      {/* Quizzes grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const quizAttempt = getQuizAttempt(quiz.id);
            const difficulty = quiz.grade ? mapGradeToDifficulty(quiz.grade) : "Intermediate";
            
            return (
              <Card key={quiz.id} className="hover:border-skutopia-300 dark:hover:border-skutopia-700 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">Grade: {quiz.grade || 'N/A'}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        border-skutopia-200 dark:border-skutopia-800
                        ${difficulty === "Beginner" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : ""}
                        ${difficulty === "Intermediate" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                        ${difficulty === "Advanced" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" : ""}
                      `}
                    >
                      {difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {quiz.description || 'No description available.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="mr-1 h-4 w-4" />
                      <span>{quiz.question_count} questions</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{quiz.time_limit_minutes || 'N/A'} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{quiz.attempts} attempts</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="mr-1 h-4 w-4" />
                      <span>Avg: {quiz.avg_score}%</span>
                    </div>
                  </div>
                  
                  {quizAttempt && (
                    <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2 flex items-center">
                      <div className="bg-green-100 dark:bg-green-800 p-1 rounded-full mr-2">
                        <Check className="h-4 w-4 text-green-700 dark:text-green-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Completed</p>
                        <div className="flex items-center mt-1">
                          <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
                          <p className="text-xs text-green-700 dark:text-green-300">Your score: {Math.round(quizAttempt.score)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {quiz.subject && (
                      <Badge
                        variant="outline"
                        className="bg-skutopia-50 text-skutopia-700 dark:bg-skutopia-900/50 dark:text-skutopia-300 border-skutopia-200 dark:border-skutopia-800 text-xs"
                      >
                        {quiz.subject}
                      </Badge>
                    )}
                    {quiz.grade && (
                      <Badge
                        variant="outline"
                        className="bg-skutopia-50 text-skutopia-700 dark:bg-skutopia-900/50 dark:text-skutopia-300 border-skutopia-200 dark:border-skutopia-800 text-xs"
                      >
                        Grade {quiz.grade}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full bg-skutopia-600 hover:bg-skutopia-700"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    {quizAttempt ? "Retry Quiz" : "Start Quiz"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {filteredQuizzes.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No quizzes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
