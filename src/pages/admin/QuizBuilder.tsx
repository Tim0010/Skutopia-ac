
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Trash, Save, ArrowLeft, Check } from "lucide-react";
import { getQuizById, saveFullQuiz } from "@/services/quizService";
import { Quiz, Question, Answer } from "@/services/quizService";
import { v4 as uuidv4 } from 'uuid';

const QuizBuilder = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz>({
    id: quizId || 'new',
    title: '',
    description: '',
    grade: '',
    subject: '',
    time_limit_minutes: null,
    questions: []
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId && quizId !== 'new') {
        try {
          setLoading(true);
          const quizData = await getQuizById(quizId);
          if (quizData) {
            // Make sure to map question_text to text for compatibility
            const formattedQuiz = {
              ...quizData,
              questions: quizData.questions.map(q => ({
                ...q,
                text: q.text || (q as any).question_text, // Use text field but fallback to question_text
              }))
            };
            setQuiz(formattedQuiz);
          }
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast.error('Failed to load quiz');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeLimitChange = (value: string) => {
    setQuiz(prev => ({
      ...prev,
      time_limit_minutes: value ? parseInt(value) : null
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`, // Temporary ID until saved
      quiz_id: quiz.id,
      text: '',
      order_index: quiz.questions.length,
      points: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: []
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [name]: value
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddAnswer = (questionIndex: number) => {
    const newAnswer: Answer = {
      id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Temporary ID until saved
      question_id: quiz.questions[questionIndex].id,
      answer_text: '',
      is_correct: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answers: [...(updatedQuestions[questionIndex].answers || []), newAnswer]
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedAnswers = [...(updatedQuestions[questionIndex].answers || [])];
      updatedAnswers.splice(answerIndex, 1);
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answers: updatedAnswers
      };
      
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedAnswers = [...(updatedQuestions[questionIndex].answers || [])];
      
      updatedAnswers[answerIndex] = {
        ...updatedAnswers[answerIndex],
        [name]: value
      };
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answers: updatedAnswers
      };
      
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleCorrectAnswerChange = (questionIndex: number, answerIndex: number) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedAnswers = [...(updatedQuestions[questionIndex].answers || [])];
      
      // Set all answers to not correct
      updatedAnswers.forEach((answer, i) => {
        updatedAnswers[i] = { ...answer, is_correct: i === answerIndex };
      });
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answers: updatedAnswers
      };
      
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSaveQuiz = async () => {
    // Validation
    if (!quiz.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (quiz.questions.length === 0) {
      toast.error('Quiz must have at least one question');
      return;
    }

    // Check that all questions have text and at least one answer
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.text || question.text.trim() === '') {
        toast.error(`Question ${i + 1} must have text`);
        return;
      }

      if (!question.answers || question.answers.length < 2) {
        toast.error(`Question ${i + 1} must have at least two answers`);
        return;
      }

      // Check if there's at least one correct answer
      if (!question.answers.some(answer => answer.is_correct)) {
        toast.error(`Question ${i + 1} must have at least one correct answer`);
        return;
      }

      // Check if all answers have text
      for (let j = 0; j < question.answers.length; j++) {
        if (!question.answers[j].answer_text || question.answers[j].answer_text.trim() === '') {
          toast.error(`Answer ${j + 1} in Question ${i + 1} must have text`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      
      // Handle new quiz case
      if (quiz.id === 'new') {
        // Create a new UUID for the quiz
        const newQuizId = uuidv4();
        const updatedQuiz = {
          ...quiz,
          id: newQuizId,
          questions: quiz.questions.map(q => ({
            ...q,
            quiz_id: newQuizId,
            id: q.id.startsWith('new-') ? uuidv4() : q.id,
            answers: q.answers?.map(a => ({
              ...a,
              question_id: a.question_id.startsWith('new-') ? uuidv4() : a.question_id,
              id: a.id.startsWith('new-') ? uuidv4() : a.id,
            })) || []
          }))
        };
        
        await saveFullQuiz(updatedQuiz);
        navigate(`/admin/quizzes`);
      } else {
        // Update existing quiz
        await saveFullQuiz(quiz);
      }
      
      toast.success('Quiz saved successfully');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {quizId && quizId !== 'new' ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/admin/quizzes')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quizzes
            </Button>
            <Button onClick={handleSaveQuiz} disabled={saving}>
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={quiz.title}
                  onChange={handleQuizChange}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                <Select
                  value={quiz.time_limit_minutes?.toString() || ''}
                  onValueChange={handleTimeLimitChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No time limit</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level</Label>
                <Input
                  id="grade"
                  name="grade"
                  value={quiz.grade || ''}
                  onChange={handleQuizChange}
                  placeholder="E.g. Grade 10, College"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={quiz.subject || ''}
                  onChange={handleQuizChange}
                  placeholder="E.g. Mathematics, History"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={quiz.description || ''}
                onChange={handleQuizChange}
                placeholder="Describe what this quiz is about"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        {quiz.questions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No questions added yet. Click "Add Question" to get started.</p>
          </Card>
        ) : (
          quiz.questions.map((question, qIndex) => (
            <Card key={question.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle>Question {qIndex + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                    <Textarea
                      id={`question-${qIndex}`}
                      name="text"
                      value={question.text || ''}
                      onChange={(e) => handleQuestionChange(qIndex, e)}
                      placeholder="Enter your question here"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label>Points</Label>
                    <Input
                      name="points"
                      type="number"
                      value={question.points || 1}
                      onChange={(e) => handleQuestionChange(qIndex, e)}
                      className="w-20"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Answers</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddAnswer(qIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Answer
                      </Button>
                    </div>
                    
                    {question.answers && question.answers.length > 0 ? (
                      <div className="space-y-3">
                        {question.answers.map((answer, aIndex) => (
                          <div key={answer.id} className="flex items-start space-x-2 border p-3 rounded-md">
                            <div className="flex-1 space-y-2">
                              <Input
                                name="answer_text"
                                value={answer.answer_text}
                                onChange={(e) => handleAnswerChange(qIndex, aIndex, e)}
                                placeholder={`Answer option ${aIndex + 1}`}
                              />
                              {answer.is_correct && (
                                <Textarea
                                  name="explanation"
                                  value={answer.explanation || ''}
                                  onChange={(e) => handleAnswerChange(qIndex, aIndex, e)}
                                  placeholder="Explanation (optional)"
                                  className="text-sm"
                                />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Label htmlFor={`correct-${qIndex}-${aIndex}`} className="cursor-pointer">
                                  <div 
                                    className={`p-1 rounded-full ${answer.is_correct ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                                    onClick={() => handleCorrectAnswerChange(qIndex, aIndex)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </div>
                                </Label>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                                className="text-red-500"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed rounded-md">
                        <p className="text-muted-foreground">No answers yet. Add some answers.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {quiz.questions.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleSaveQuiz} size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
