
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  grade?: string | null;
  subject?: string | null;
  time_limit_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  questions: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string; // This is the correct field name in the database
  created_at: string;
  updated_at: string;
  order_index: number;
  points: number;
  answers?: Answer[];
  image_url?: string | null;
  type?: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  explanation?: string | null;
  created_at: string;
  updated_at: string;
}

interface QuizFormData {
  title: string;
  description?: string;
  grade?: string;
  subject?: string;
  time_limit_minutes?: number | null;
}

// Get all quizzes
export const getQuizzes = async () => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          answers (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Normalize the data structure to match our interfaces
    const quizzes = data.map(quiz => ({
      ...quiz,
      questions: (quiz.questions || []).map(q => ({
        ...q,
        text: q.text || q.question_text, // Handle both field names for compatibility
      })),
    }));

    return quizzes as Quiz[];
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    toast.error('Failed to fetch quizzes: ' + error.message);
    return [];
  }
};

// Get a quiz by id with all related questions and answers
export const getQuizById = async (quizId: string) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          answers (*)
        )
      `)
      .eq('id', quizId)
      .single();

    if (error) throw error;

    // Normalize the data structure
    const quiz = {
      ...data,
      questions: (data.questions || []).map(q => ({
        ...q,
        text: q.text || q.question_text, // Handle both field names for compatibility
        order_index: q.order_index || q.order || 0, // Handle different field names
      })),
    };

    return quiz as Quiz;
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    toast.error('Failed to fetch quiz: ' + error.message);
    return null;
  }
};

// Create a new quiz
export const createQuiz = async (quizData: QuizFormData) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select();

    if (error) throw error;
    
    toast.success('Quiz created successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    toast.error('Failed to create quiz: ' + error.message);
    return null;
  }
};

// Update a quiz
export const updateQuiz = async (quizId: string, quizData: Partial<QuizFormData>) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quizData)
      .eq('id', quizId)
      .select();

    if (error) throw error;
    
    toast.success('Quiz updated successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    toast.error('Failed to update quiz: ' + error.message);
    return null;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId: string) => {
  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;
    
    toast.success('Quiz deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    toast.error('Failed to delete quiz: ' + error.message);
    return false;
  }
};

// Add a new question to a quiz
export const addQuestion = async (quizId: string, questionData: Omit<Question, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>) => {
  try {
    // Make sure to map text field correctly
    const dbQuestionData = {
      ...questionData,
      text: questionData.text, // Ensure text field is used
      quiz_id: quizId
    };

    const { data, error } = await supabase
      .from('questions')
      .insert([dbQuestionData])
      .select();

    if (error) throw error;

    toast.success('Question added successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error adding question:', error);
    toast.error('Failed to add question: ' + error.message);
    return null;
  }
};

// Update a question
export const updateQuestion = async (questionId: string, questionData: Partial<Omit<Question, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>>) => {
  try {
    // Make sure to map text field correctly
    const dbQuestionData = {
      ...questionData,
      text: questionData.text, // Ensure text field is used
    };

    const { data, error } = await supabase
      .from('questions')
      .update(dbQuestionData)
      .eq('id', questionId)
      .select();

    if (error) throw error;

    toast.success('Question updated successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error updating question:', error);
    toast.error('Failed to update question: ' + error.message);
    return null;
  }
};

// Delete a question
export const deleteQuestion = async (questionId: string) => {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    
    toast.success('Question deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting question:', error);
    toast.error('Failed to delete question: ' + error.message);
    return false;
  }
};

// Add an answer to a question
export const addAnswer = async (questionId: string, answerData: Omit<Answer, 'id' | 'question_id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('answers')
      .insert([{
        ...answerData,
        question_id: questionId
      }])
      .select();

    if (error) throw error;

    toast.success('Answer added successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error adding answer:', error);
    toast.error('Failed to add answer: ' + error.message);
    return null;
  }
};

// Update an answer
export const updateAnswer = async (answerId: string, answerData: Partial<Omit<Answer, 'id' | 'question_id' | 'created_at' | 'updated_at'>>) => {
  try {
    const { data, error } = await supabase
      .from('answers')
      .update(answerData)
      .eq('id', answerId)
      .select();

    if (error) throw error;

    toast.success('Answer updated successfully');
    return data[0];
  } catch (error: any) {
    console.error('Error updating answer:', error);
    toast.error('Failed to update answer: ' + error.message);
    return null;
  }
};

// Delete an answer
export const deleteAnswer = async (answerId: string) => {
  try {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId);

    if (error) throw error;
    
    toast.success('Answer deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting answer:', error);
    toast.error('Failed to delete answer: ' + error.message);
    return false;
  }
};

// Save or update a full quiz with questions and answers
export const saveFullQuiz = async (quiz: Quiz) => {
  try {
    // First update the quiz metadata
    const { id, questions, ...quizData } = quiz;
    await updateQuiz(id, quizData);
    
    // For each question, either update or create it
    for (const question of questions) {
      let questionId = question.id;
      
      // Format question data
      const { answers, id: qId, quiz_id, created_at, updated_at, ...questionData } = question;
      
      // Handle text field mapping
      const formattedQuestionData = {
        ...questionData,
        text: question.text, // Use the correct field name
      };
      
      if (qId && qId !== 'new') {
        // Update existing question
        await updateQuestion(qId, formattedQuestionData);
        questionId = qId;
      } else {
        // Create new question
        const newQuestion = await addQuestion(quiz.id, formattedQuestionData);
        if (newQuestion) {
          questionId = newQuestion.id;
        } else {
          continue;
        }
      }
      
      // Handle answers for this question
      if (answers && answers.length > 0) {
        // Get existing answers for this question to compare
        const { data: existingAnswers } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', questionId);
          
        const existingAnswerIds = existingAnswers ? existingAnswers.map(a => a.id) : [];
        
        // Process each answer
        for (const answer of answers) {
          const { id: aId, question_id, created_at, updated_at, ...answerData } = answer;
          
          if (aId && aId !== 'new' && existingAnswerIds.includes(aId)) {
            // Update existing answer
            await updateAnswer(aId, answerData);
            
            // Remove from existingAnswerIds so we know not to delete it
            const idx = existingAnswerIds.indexOf(aId);
            if (idx > -1) existingAnswerIds.splice(idx, 1);
          } else {
            // Create new answer
            await addAnswer(questionId, answerData);
          }
        }
        
        // Delete answers that were removed
        for (const answerId of existingAnswerIds) {
          await deleteAnswer(answerId);
        }
      }
    }
    
    toast.success('Quiz saved successfully');
    return true;
  } catch (error: any) {
    console.error('Error saving quiz:', error);
    toast.error('Failed to save quiz: ' + error.message);
    return false;
  }
};

export default {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  saveFullQuiz
};
