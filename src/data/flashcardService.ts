import { supabase } from '@/lib/supabaseClient';

// --- New Interfaces based on Schema ---

export interface Subject {
  id: string; // UUID
  name: string;
}

export interface Topic {
  id: string; // UUID
  subject_id: string;
  name: string;
  subject?: Subject; // Optional: For including subject name in fetches
}

export interface Tag {
  id: string; // UUID
  name: string;
}

export interface FlashcardData { // Renamed from Flashcard for clarity
  id: string; // UUID
  topic_id: string;
  grade: number | null; // Allow null if grade is optional or not set
  question: string;
  answer: string;
  difficulty_level: 'easy' | 'medium' | 'hard' | null; // Allow null
  created_at: string;
  updated_at: string;
  // Optional relations fetched via joins or separate queries
  topic?: Topic;
  tags?: Tag[];
}

// Interface for filtering flashcards
export interface FlashcardFilters {
  subjectId?: string;
  topicId?: string;
  grade?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tagIds?: string[]; // Filter by one or more tag IDs
  searchTerm?: string; // For searching question/answer text
}

// Keep existing progress interface if that system remains unchanged
export interface FlashcardProgressData {
  user_id: string;
  flashcard_id: string;
  is_correct: boolean;
  last_attempted_at: string;
  correct_count: number;
  incorrect_count: number;
  level: number;
  next_review_at?: string | null;
}

/* // Commenting out old mock data as it doesn't match the new schema and isn't used by functions
// Mock Flashcard Data - Keep for reference or initial seeding if needed, but not used by functions
const allFlashcards: FlashcardData[] = [
  // Grade 8 Math - Algebra
  { id: "m8a1", topic_id: "some-topic-id", grade: 8, question: "Solve for x: 2x + 5 = 15", answer: "x = 5", difficulty_level: 'medium', created_at: '', updated_at: '' },
  // ... Add more mock data conforming to new schema if needed for reference
];
*/

// --- Supabase API Calls (Refactored) ---

// Fetch all Subjects
export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name');

  if (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
  return data || [];
}

// Fetch Topics, optionally filtered by subject_id
export async function fetchTopics(subjectId?: string): Promise<Topic[]> {
  let query = supabase
    .from('topics')
    .select('id, name, subject_id') // Select required fields
    .order('name');

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching topics (subjectId: ${subjectId}):`, error);
    throw error;
  }
  return data || [];
}

// Fetch all Tags
export async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .order('name');

  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
  return data || [];
}

// Fetch Flashcards based on filters
export async function fetchFlashcards(filters: FlashcardFilters): Promise<FlashcardData[]> {

  // --- Pre-fetch Topic IDs if filtering by Subject only ---
  let topicIdsForSubject: string[] | undefined = undefined;
  if (filters.subjectId && !filters.topicId) {
    try {
      const topics = await fetchTopics(filters.subjectId);
      topicIdsForSubject = topics.map(t => t.id);
      if (topicIdsForSubject.length === 0) {
        // If subject has no topics, no flashcards can match
        return [];
      }
    } catch (error) {
      console.error("Error fetching topics for subject filter:", error);
      throw new Error("Failed to fetch topics for subject filter."); // Propagate error
    }
  }

  // --- Build the Query ---
  // Dynamically determine the select join for tags based on filtering
  const selectTagsJoin = (filters.tagIds && filters.tagIds.length > 0)
    ? `flashcard_tags!inner(tag:tags(id, name))` // Use INNER JOIN only when filtering tags
    : `flashcard_tags(tag:tags(id, name))`;      // Use LEFT JOIN otherwise

  let query = supabase
    .from('flashcards')
    .select(`
            id, topic_id, grade, question, answer, difficulty_level, created_at, updated_at,
            topic:topics!inner( id, name, subject_id, subject:subjects(id, name) ),
            ${selectTagsJoin}
        `)
    // Add !inner to topic join ensure topic exists - adjust if flashcards can exist without topics
    .order('random_seed');

  // --- Apply Filters ---
  if (filters.topicId) {
    query = query.eq('topic_id', filters.topicId);
  } else if (topicIdsForSubject) {
    // Apply filter using the fetched topic IDs for the selected subject
    query = query.in('topic_id', topicIdsForSubject);
  }
  // Removed the direct filter on topics.subject_id

  if (filters.grade) {
    query = query.eq('grade', filters.grade);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty_level', filters.difficulty);
  }

  // Tag filtering - applied via the inner join in select OR additional filter if needed
  if (filters.tagIds && filters.tagIds.length > 0) {
    // The !inner join in `selectTagsJoin` already handles this implicitly
    // For clarity or more complex scenarios, could add: .in('flashcard_tags.tag_id', filters.tagIds)
    // But let's rely on the !inner join mechanism for now.
  }

  if (filters.searchTerm) {
    query = query.or(`question.ilike.%${filters.searchTerm}%,answer.ilike.%${filters.searchTerm}%`);
  }

  // --- Execute Query ---
  // console.log("Executing Supabase query...", query);
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
  // console.log("Supabase raw data received:", data);

  // --- Process Data ---
  const processedData = (data || []).map((fc: any) => {
    // Extract tags - handle case where left join yields no tags
    const tags: Tag[] = (fc.flashcard_tags || []).map((ft: any) => ft?.tag).filter(Boolean);

    // Extract and structure the topic and its subject (handle potential arrays - though !inner should prevent)
    let processedTopic: Topic | undefined = undefined;
    if (fc.topic) {
      // Inner join on topic ensures it's not null/array
      const rawTopic = fc.topic;
      let processedSubject: Subject | undefined = undefined;
      if (rawTopic.subject) {
        // Subject relation might still be array depending on schema def? Safely handle.
        const rawSubject = Array.isArray(rawTopic.subject) ? rawTopic.subject[0] : rawTopic.subject;
        if (rawSubject) {
          processedSubject = { id: rawSubject.id, name: rawSubject.name };
        }
      }
      processedTopic = {
        id: rawTopic.id,
        name: rawTopic.name,
        subject_id: rawTopic.subject_id,
        subject: processedSubject
      };
    }

    const structuredFlashcard: FlashcardData = {
      id: fc.id,
      topic_id: fc.topic_id,
      grade: fc.grade,
      question: fc.question,
      answer: fc.answer,
      difficulty_level: fc.difficulty_level,
      created_at: fc.created_at,
      updated_at: fc.updated_at,
      topic: processedTopic,
      tags: tags,
    };
    return structuredFlashcard;
  }).filter(fc => fc.topic !== undefined); // Ensure flashcards have a topic after processing

  // console.log("Processed flashcard data:", processedData);
  return processedData;
}

// Add a new flashcard (and associate tags)
export async function addFlashcard(
  flashcardInput: Omit<FlashcardData, 'id' | 'created_at' | 'updated_at' | 'topic' | 'tags'>,
  tagIds: string[] = [] // Optional array of tag IDs to associate
): Promise<FlashcardData | null> {

  // 1. Insert the flashcard
  const { data: newFlashcard, error: insertError } = await supabase
    .from('flashcards')
    .insert({
      topic_id: flashcardInput.topic_id,
      grade: flashcardInput.grade,
      question: flashcardInput.question,
      answer: flashcardInput.answer,
      difficulty_level: flashcardInput.difficulty_level,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Supabase add flashcard error:", insertError);
    throw insertError;
  }

  if (!newFlashcard) {
    throw new Error("Failed to insert flashcard or retrieve the inserted row.");
  }

  // 2. If tags are provided, insert into flashcard_tags
  if (tagIds.length > 0) {
    const tagLinks = tagIds.map(tagId => ({
      flashcard_id: newFlashcard.id,
      tag_id: tagId
    }));

    const { error: tagLinkError } = await supabase
      .from('flashcard_tags')
      .insert(tagLinks);

    if (tagLinkError) {
      console.error("Error linking tags to flashcard:", tagLinkError);
      // Optionally, consider rolling back the flashcard insert or logging a warning
      // For now, we'll throw the error
      throw tagLinkError;
    }
  }

  // 3. Return the newly created flashcard (tags won't be populated here unless re-fetched)
  return newFlashcard as FlashcardData;
}

// --- User Progress Functions (Keep as is for now) ---

export async function updateFlashcardProgress(userId: string, flashcardId: string, isCorrect: boolean): Promise<FlashcardProgressData> {
  if (!userId || !flashcardId) {
    console.error("User ID and Flashcard ID are required for progress update.");
    throw new Error("User ID and Flashcard ID are required.");
  }
  const { data, error } = await supabase.rpc('upsert_flashcard_progress', {
    p_user_id: userId,
    p_flashcard_id: flashcardId,
    p_is_correct: isCorrect
  });
  if (error) {
    console.error("Supabase RPC update progress error:", JSON.stringify(error, null, 2));
    throw error;
  }
  if (!data) {
    throw new Error("No data returned from progress update.");
  }
  const updatedProgress: FlashcardProgressData = Array.isArray(data) ? data[0] : data;
  if (!updatedProgress) {
    throw new Error("Returned progress data is invalid.");
  }
  // console.log("Progress update successful, returned:", updatedProgress);
  return updatedProgress;
}

export async function fetchSingleFlashcardProgress(userId: string, flashcardId: string): Promise<FlashcardProgressData | null> {
  if (!userId || !flashcardId) {
    console.error("User ID and Flashcard ID are required to fetch progress.");
    return null;
  }
  const { data, error } = await supabase
    .from('user_flashcard_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('flashcard_id', flashcardId)
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Supabase fetch single progress error:", JSON.stringify(error, null, 2));
    throw error;
  }
  // console.log("Single progress fetched:", data); // Example if there was one here
  return data as FlashcardProgressData | null;
}
