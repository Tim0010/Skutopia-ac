import { supabase } from '../lib/supabaseClient'; // Corrected import path
import type { User } from '@supabase/supabase-js';

// --- Types ---

export interface QuizQuestion {
    id: string; // UUID
    grade: string;
    subject: string;
    topic: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface UserQuizResponse {
    id: string; // UUID
    user_id: string; // UUID
    quiz_id: string; // UUID
    selected_answer: string;
    is_correct: boolean | null; // Initially null, updated after evaluation
    quiz_attempt_id: string; // UUID
    created_at: string; // ISO timestamp
}

export interface QuizResult extends UserQuizResponse {
    question: QuizQuestion; // Include the question details in the result
}

export interface UserQuizAnswer {
    quizId: string; // Should be string (UUID) to match QuizQuestion.id
    selectedAnswer: string | null; // Allow null for timed out/skipped
}

// Leaderboard Entry Type
export interface LeaderboardEntry {
    user_id: string;
    username: string; // Assuming a 'username' column in your 'profiles' table
    highest_score: number;
    total_quizzes_taken: number;
}

// Type for the combined leaderboard data and max score
export interface LeaderboardData {
    leaderboard: LeaderboardEntry[];
    maxScore: number;
}

// --- Filter Fetching Functions ---

export const fetchQuizGrades = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('quizzes')
        .select('grade', { count: 'exact', head: false }); // Faster way to get distinct values

    if (error) {
        console.error("Error fetching quiz grades:", error);
        throw error;
    }
    // Extract unique grades, ensure they are strings, then cast
    const uniqueGrades = [...new Set(data.map(item => String(item.grade)))] as string[];
    console.log("Available quiz grades:", uniqueGrades);
    return uniqueGrades.sort();
};

export const fetchQuizSubjects = async (grade: string): Promise<string[]> => {
    if (!grade) return [];
    const { data, error } = await supabase
        .from('quizzes')
        .select('subject')
        .eq('grade', grade);

    if (error) {
        console.error(`Error fetching quiz subjects for grade ${grade}:`, error);
        throw error;
    }
    // Extract unique subjects, ensure they are strings, then cast
    const uniqueSubjects = [...new Set(data.map(item => String(item.subject)))] as string[];
     console.log(`Available quiz subjects for grade ${grade}:`, uniqueSubjects);
    return uniqueSubjects.sort();
};

export const fetchQuizTopics = async (grade: string, subject: string): Promise<string[]> => {
    if (!grade || !subject) return [];
    const { data, error } = await supabase
        .from('quizzes')
        .select('topic')
        .eq('grade', grade)
        .eq('subject', subject);

    if (error) {
        console.error(`Error fetching quiz topics for ${grade} - ${subject}:`, error);
        throw error;
    }
    // Extract unique topics, ensure they are strings, then cast
     const uniqueTopics = [...new Set(data.map(item => String(item.topic)))] as string[];
     console.log(`Available quiz topics for grade ${grade}, subject ${subject}:`, uniqueTopics);
    return uniqueTopics.sort();
};


// --- Quiz Taking Functions ---

/**
 * Fetches a specified number of random quiz questions for the given criteria.
 */
export const fetchQuizQuestions = async (grade: string, subject: string, topic: string, limit: number = 20): Promise<QuizQuestion[]> => {
    console.log(`Fetching ${limit} quiz questions for:`, { grade, subject, topic });
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('grade', grade)
        .eq('subject', subject)
        .eq('topic', topic)
        // .order('random()') // '.order' doesn't support 'random()' directly in supabase-js v2
        // Instead, we can use an RPC function or fetch more and shuffle client-side.
        // For simplicity here, we'll fetch a larger set and hope for variety, or rely on db ordering.
        // A more robust solution involves an SQL function like:
        // CREATE FUNCTION get_random_quizzes(p_grade TEXT, p_subject TEXT, p_topic TEXT, p_limit INT)
        // RETURNS SETOF quizzes LANGUAGE sql AS $$ SELECT * FROM quizzes WHERE grade=p_grade AND subject=p_subject AND topic=p_topic ORDER BY random() LIMIT p_limit; $$;
        // Then call: supabase.rpc('get_random_quizzes', { p_grade: grade, p_subject: subject, p_topic: topic, p_limit: limit })
        .limit(limit); // Fetch the desired number

    if (error) {
        console.error("Error fetching quiz questions:", error);
        throw error;
    }
    if (!data || data.length === 0) {
        console.warn("No quiz questions found for the criteria.");
        return [];
    }
    // Simple client-side shuffle (Fisher-Yates) if random() isn't used via RPC
    for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }
    console.log("Fetched quiz questions:", data);
    return data as QuizQuestion[];
};


/**
 * Saves a batch of user answers for a single quiz attempt.
 */
export const saveUserQuizAnswers = async (
    userId: string,
    quizAttemptId: string,
    answers: UserQuizAnswer[] // Use the interface, which now has number for quizId
): Promise<UserQuizResponse[]> => {
    if (!userId || answers.length === 0) {
        throw new Error("User ID and answers are required.");
    }

    const responsesToInsert = answers.map(answer => ({
        user_id: userId,
        quiz_id: answer.quizId, // Pass as number, assuming DB column is numeric
        selected_answer: answer.selectedAnswer,
        quiz_attempt_id: quizAttemptId,
        is_correct: null, // Mark as null initially
    }));

    console.log("Saving user quiz answers:", responsesToInsert);

    const { data, error } = await supabase
        .from('user_quiz_responses')
        .insert(responsesToInsert)
        .select(); // Return the inserted rows

    if (error) {
        console.error("Error saving user quiz answers:", error);
        throw error;
    }
    console.log("Saved user quiz responses:", data);
    return data as UserQuizResponse[];
};


/**
 * Evaluates a completed quiz attempt by comparing user answers to correct answers
 * and updating the is_correct status in the database.
 */
export const evaluateQuizAttempt = async (userId: string, quizAttemptId: string): Promise<void> => {
     console.log(`Evaluating quiz attempt ${quizAttemptId} for user ${userId}`);
    // 1. Fetch the user's responses for this attempt
    const { data: userResponses, error: responseError } = await supabase
        .from('user_quiz_responses')
        .select('id, quiz_id, selected_answer')
        .eq('user_id', userId)
        .eq('quiz_attempt_id', quizAttemptId);

    if (responseError) {
        console.error("Error fetching user responses for evaluation:", responseError);
        throw responseError;
    }
    if (!userResponses || userResponses.length === 0) {
        console.warn("No responses found for this quiz attempt.");
        return; // Nothing to evaluate
    }

    // 2. Fetch the correct answers for the relevant questions
    const quizIds = userResponses.map(r => r.quiz_id);
    const { data: correctAnswers, error: quizError } = await supabase
        .from('quizzes')
        .select('id, correct_answer')
        .in('id', quizIds);

    if (quizError) {
        console.error("Error fetching correct answers for evaluation:", quizError);
        throw quizError;
    }

    const correctAnswersMap = new Map(correctAnswers.map(q => [q.id, q.correct_answer]));

    // 3. Determine correctness and prepare updates
    const updates = userResponses.map(response => {
        const correctAnswer = correctAnswersMap.get(response.quiz_id);
        const isCorrect = response.selected_answer === correctAnswer;
        return {
            match: { id: response.id }, // Match by the specific response ID
            update: { is_correct: isCorrect }
        };
    });

    console.log("Prepared updates for evaluation:", updates);

    // 4. Bulk update the is_correct status
    // Supabase doesn't have a direct bulk update based on different conditions in one call via JS client.
    // We need to loop or use an RPC function. Loop is simpler here.
    let errors = [];
    for (const update of updates) {
        const { error: updateError } = await supabase
            .from('user_quiz_responses')
            .update(update.update)
            .match(update.match);

        if (updateError) {
            console.error(`Error updating response ${update.match.id}:`, updateError);
            errors.push(updateError);
        }
    }

    if (errors.length > 0) {
         console.error("Evaluation complete with some errors.");
        // Decide if we need to throw a combined error
        // throw new Error("Failed to update some quiz responses during evaluation.");
    } else {
         console.log("Evaluation complete, all responses updated.");
    }
};


/**
 * Fetches the results of a specific quiz attempt, including question details.
 */
export const fetchQuizAttemptResults = async (userId: string, quizAttemptId: string): Promise<QuizResult[]> => {
    console.log(`Fetching results for quiz attempt ${quizAttemptId}`);
    const { data, error } = await supabase
        .from('user_quiz_responses')
        .select(`
            *,
            quizzes (
                *
            )
        `)
        .eq('user_id', userId)
        .eq('quiz_attempt_id', quizAttemptId)
        .order('created_at', { ascending: true }); // Ensure results are in order

    if (error) {
        console.error("Error fetching quiz attempt results:", error);
        throw error;
    }

    if (!data) return [];

    // Manually structure the result to match QuizResult interface, as Supabase nests the relation
    const results = data.map(item => ({
        ...item, // Spread user_quiz_responses fields
        question: item.quizzes as QuizQuestion // Assign the nested quizzes object
    })) as QuizResult[];


    // Remove the now redundant nested 'quizzes' key if necessary (depends on how you use it)
    results.forEach(r => delete (r as any).quizzes);

    console.log("Fetched quiz results:", results);
    return results;
};

// --- Leaderboard Functions ---

/**
 * Fetches the top leaderboard entries along with the overall maximum score.
 * Assumes a 'profiles' table exists with 'id' (matching auth.users) and 'username'.
 */
export const fetchLeaderboardWithMaxScore = async (limit: number = 10): Promise<LeaderboardData> => {
    // Fetch the top N users based on highest_score, joining with profiles for username
    const { data: leaderboard, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select(`
            user_id,
            highest_score,
            total_quizzes_taken,
            profiles ( username )
        `)
        .order('highest_score', { ascending: false })
        .limit(limit);

    if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
        throw leaderboardError;
    }

    // Fetch the single highest score across the entire leaderboard
    // Note: RLS policies must allow reading the leaderboard table.
    const { data: maxScoreData, error: maxScoreError } = await supabase
        .from('leaderboard')
        .select('highest_score')
        .order('highest_score', { ascending: false })
        .limit(1)
        .single();
        // .rpc('get_max_leaderboard_score'); // Alternative: Use a DB function if complex/RLS issues

    if (maxScoreError && maxScoreError.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found) if leaderboard is empty
        console.error("Error fetching max score:", maxScoreError);
        throw maxScoreError;
    }

    const maxScore = maxScoreData?.highest_score ?? 100; // Default to 100 if no scores yet or error

    // Process the leaderboard data to flatten the profile information
    const processedLeaderboard: LeaderboardEntry[] = leaderboard.map((entry: any) => ({
        user_id: entry.user_id,
        username: entry.profiles?.username ?? 'Unknown User', // Handle cases where profile might be missing
        highest_score: entry.highest_score,
        total_quizzes_taken: entry.total_quizzes_taken,
    }));

    return { leaderboard: processedLeaderboard, maxScore };
};
