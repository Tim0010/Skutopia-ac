import { supabase } from '../lib/supabaseClient';

// --- Type Definitions ---
export interface PastPaper {
    id: string; // UUID
    subject: string;
    year: number;
    grade: string;
    level: 'Basic' | 'Intermediate' | 'Advanced';
    file_url: string;
    file_size: number | null; // Size in MB
    created_at: string; // ISO timestamp string
}

export interface PastPaperFilters {
    subject?: string;
    year?: number;
    grade?: string;
}

// --- API Functions ---

/**
 * Fetches past papers based on optional filters.
 */
export const fetchPastPapers = async (filters: PastPaperFilters): Promise<PastPaper[]> => {
    let query = supabase
        .from('past_papers')
        .select('*')
        .order('year', { ascending: false })
        .order('subject');

    if (filters.subject) {
        query = query.eq('subject', filters.subject);
    }
    if (filters.year) {
        query = query.eq('year', filters.year);
    }
    if (filters.grade) {
        query = query.eq('grade', filters.grade);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching past papers:", error);
        throw error;
    }

    return data || [];
};

/**
 * Fetches distinct subjects available in past papers.
 */
export const fetchDistinctSubjects = async (): Promise<string[]> => {
    // Use a VIEW or RPC function in Supabase for better performance on large datasets
    // Specify expected return type for better type inference
    const { data, error } = await supabase
        .from('past_papers')
        .select('subject') as { data: { subject: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct subjects:", error);
        throw error;
    }

    // Get unique subjects, ensuring data is not null
    const subjects = data ? [...new Set(data.map(item => item.subject))].sort() : [];
    return subjects;
};

/**
 * Fetches distinct years available in past papers.
 */
export const fetchDistinctYears = async (): Promise<number[]> => {
    const { data, error } = await supabase
        .from('past_papers')
        .select('year') as { data: { year: number }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct years:", error);
        throw error;
    }
    // Ensure data exists and years are numbers before sorting
    const years = data ? [...new Set(data.map(item => item.year))].sort((a, b) => (b ?? 0) - (a ?? 0)) : [];
    return years;
};

/**
 * Fetches distinct grades available in past papers.
 */
export const fetchDistinctGrades = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('past_papers')
        .select('grade') as { data: { grade: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct grades:", error);
        throw error;
    }
    const grades = data ? [...new Set(data.map(item => item.grade))].sort() : [];
    return grades;
};

// Note: The uploadPastPaper function requires a file object (usually from an <input type="file">)
// and would typically be used in an admin section.
// Implementation would look similar to the user's example, ensuring STORAGE setup is correct.
