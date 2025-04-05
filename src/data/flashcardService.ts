import { supabase } from '@/lib/supabaseClient';

export interface FlashcardData {
  id: string; // UUID from Supabase
  grade: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
}

// Interface for the detailed progress data returned by the function
export interface FlashcardProgressData {
  user_id: string;
  flashcard_id: string;
  is_correct: boolean;
  last_attempted_at: string;
  correct_count: number;
  incorrect_count: number;
  level: number;
  next_review_at?: string | null; // Can be null if not set
}

// Mock Flashcard Data - Keep for reference or initial seeding if needed, but not used by functions
const allFlashcards: FlashcardData[] = [
  // Grade 8 Math - Algebra
  { id: "m8a1", grade: "8", subject: "Mathematics", topic: "Algebra", question: "Solve for x: 2x + 5 = 15", answer: "x = 5" },
  { id: "m8a2", grade: "8", subject: "Mathematics", topic: "Algebra", question: "What is the slope of the line y = 3x - 2?", answer: "3" },
  { id: "m8a3", grade: "8", subject: "Mathematics", topic: "Algebra", question: "Simplify: (x^2)(x^3)", answer: "x^5" },

  // Grade 9 Science - Biology
  { id: "s9b1", grade: "9", subject: "Science", topic: "Biology", question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
  { id: "s9b2", grade: "9", subject: "Science", topic: "Biology", question: "What is photosynthesis?", answer: "The process plants use to convert light energy into chemical energy (glucose)." },
  { id: "s9b3", grade: "9", subject: "Science", topic: "Biology", question: "What are the four main types of tissues in the human body?", answer: "Epithelial, connective, muscle, and nervous tissue." },

  // Grade 10 Chemistry
  { id: "c10c1", grade: "10", subject: "Chemistry", topic: "Atomic Structure", question: "What are the three main subatomic particles?", answer: "Protons, neutrons, and electrons." },
  { id: "c10c2", grade: "10", subject: "Chemistry", topic: "Atomic Structure", question: "What is the atomic number of an element?", answer: "The number of protons in the nucleus of an atom." },

  // Grade 11 Physics - Kinematics
  { id: "p11k1", grade: "11", subject: "Physics", topic: "Kinematics", question: "What is the formula for speed?", answer: "Speed = Distance / Time" },
  { id: "p11k2", grade: "11", subject: "Physics", topic: "Kinematics", question: "What is acceleration?", answer: "The rate of change of velocity." },

  // Grade 12 Mathematics - Calculus
  { id: "m12c1", grade: "12", subject: "Mathematics", topic: "Calculus", question: "What is the derivative of x^2?", answer: "2x" },
  { id: "m12c2", grade: "12", subject: "Mathematics", topic: "Calculus", question: "What does the integral of a function represent?", answer: "The area under the curve of the function." },
];

// --- Supabase API Calls ---

export async function fetchFlashcards(grade: string, subject: string, topic: string): Promise<FlashcardData[]> {
  console.log("Fetching from Supabase with:", { grade, subject, topic }); // Debugging log
  if (!grade || !subject || !topic) {
    return []; // Return empty if any filter is missing
  }
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("grade", grade)
    .eq("subject", subject)
    .eq("topic", topic);

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }
  console.log("Supabase fetched data:", data);
  return data || [];
}

// Helper functions to get unique filter options - **Updated to query Supabase**
export async function getAvailableGrades(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('grade', { count: 'exact', head: false }); // Use select distinct workaround

    if (error) {
      console.error("Error fetching distinct grades:", error);
      throw error;
    }

    // Extract unique grades - Supabase doesn't have a native distinct() yet for select
    // We fetch all grades and filter unique ones client-side
    const grades = data ? [...new Set(data.map((item: any) => item.grade))].sort() : [];
    console.log("Available grades:", grades); // Debugging
    const result: string[] = grades;
    return result;
  } catch (err) {
    console.error("Failed to get grades:", err);
    return [];
  }
}

export async function getAvailableSubjects(grade: string): Promise<string[]> {
  if (!grade) return [];
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('subject') // Select only subject
      .eq('grade', grade);

    if (error) {
      console.error(`Error fetching distinct subjects for grade ${grade}:`, error);
      throw error;
    }

    // Extract unique subjects for the selected grade
    const subjects = data ? [...new Set(data.map((item: any) => item.subject))].sort() : [];
    console.log(`Available subjects for grade ${grade}:`, subjects); // Debugging
    const result: string[] = subjects;
    return result;
  } catch (err) {
    console.error(`Failed to get subjects for grade ${grade}:`, err);
    return [];
  }
}

export async function getAvailableTopics(grade: string, subject: string): Promise<string[]> {
  if (!grade || !subject) return [];
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('topic') // Select only topic
      .eq('grade', grade)
      .eq('subject', subject);

    if (error) {
      console.error(`Error fetching distinct topics for grade ${grade}, subject ${subject}:`, error);
      throw error;
    }

    // Extract unique topics for the selected grade and subject
    const topics = data ? [...new Set(data.map((item: any) => item.topic))].sort() : [];
    console.log(`Available topics for grade ${grade}, subject ${subject}:`, topics); // Debugging
    const result: string[] = topics;
    return result;
  } catch (err) {
    console.error(`Failed to get topics for grade ${grade}, subject ${subject}:`, err);
    return [];
  }
}

// --- User Progress Functions ---

// Updated function signature to return FlashcardProgressData
export async function updateFlashcardProgress(userId: string, flashcardId: string, isCorrect: boolean): Promise<FlashcardProgressData> {
  if (!userId || !flashcardId) {
    console.error("User ID and Flashcard ID are required for progress update.");
    throw new Error("User ID and Flashcard ID are required.");
  }

  // Call the database function to upsert the progress
  const { data, error } = await supabase.rpc('upsert_flashcard_progress', {
    p_user_id: userId,
    p_flashcard_id: flashcardId,
    p_is_correct: isCorrect
  });

  if (error) {
    // Log the full error object for more details
    console.error("Supabase RPC update progress error:", JSON.stringify(error, null, 2)); 
    // Throw the error so the calling component can handle it (e.g., show a toast)
    throw error;
  }

  // The RPC function now returns the updated row, which should be in 'data'
  // We might get an array with one item, so handle that.
  if (!data) {
    throw new Error("No data returned from progress update.");
  }

  // Assuming the function returns a single row which is the first element
  // Adjust if Supabase RPC returns data differently in your version
  const updatedProgress: FlashcardProgressData = Array.isArray(data) ? data[0] : data;

  if (!updatedProgress) {
      throw new Error("Returned progress data is invalid.");
  }

  console.log("Progress update successful, returned:", updatedProgress);
  return updatedProgress; // Return the detailed progress
}

// Fetch progress details for a single flashcard
export async function fetchSingleFlashcardProgress(userId: string, flashcardId: string): Promise<FlashcardProgressData | null> {
  if (!userId || !flashcardId) {
    console.error("User ID and Flashcard ID are required to fetch progress.");
    // Return null or throw error based on how you want to handle this in the UI
    return null; 
  }

  const { data, error } = await supabase
    .from('user_flashcard_progress')
    .select('*') // Select all columns: user_id, flashcard_id, is_correct, last_attempted_at, correct_count, incorrect_count, level, next_review_at
    .eq('user_id', userId)
    .eq('flashcard_id', flashcardId)
    .maybeSingle(); // Use maybeSingle() to get one record or null if not found

  if (error) {
      // Don't throw error for "No rows found" (PGRST116), just return null
      if (error.code === 'PGRST116') {
          return null; 
      }
      console.error("Supabase fetch single progress error:", JSON.stringify(error, null, 2));
      throw error; // Throw other errors
  }

  return data as FlashcardProgressData | null;
}

 // Optional: Add function for Admin to add flashcards
export async function addFlashcard(flashcard: Omit<FlashcardData, 'id' | 'created_at'>) {
  const { data, error } = await supabase
                            .from("flashcards")
                            .insert([flashcard])
                            .select(); // Select to return the inserted data

  if (error) {
    console.error("Supabase add flashcard error:", error);
    throw error;
  }
  return data ? data[0] : null;
}
