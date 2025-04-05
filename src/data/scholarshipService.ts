import { supabase } from '../lib/supabaseClient';

// --- Type Definitions ---
export interface Scholarship {
    id: string; // UUID
    title: string;
    description: string;
    organization: string;
    country: string;
    eligibility: string;
    level: string; // (Undergraduate, Masters, PhD) - Consider defining specific levels if needed
    field_of_study: string;
    application_link: string;
    deadline: string; // DATE string (YYYY-MM-DD)
    created_at: string; // ISO timestamp string
}

export interface ScholarshipFilters {
    country?: string;
    field_of_study?: string;
    level?: string;
}

// --- API Functions ---

/**
 * Fetches scholarships based on optional filters.
 */
export const fetchScholarships = async (filters: ScholarshipFilters): Promise<Scholarship[]> => {
    let query = supabase
        .from('scholarships')
        .select('*')
        .order('deadline', { ascending: true }); // Show upcoming deadlines first

    if (filters.country) {
        query = query.eq('country', filters.country);
    }
    if (filters.field_of_study) {
        query = query.ilike('field_of_study', `%${filters.field_of_study}%`); // Use ilike for broader match
    }
     if (filters.level) {
        query = query.eq('level', filters.level);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching scholarships:", error);
        throw error;
    }
    return data || [];
};

/**
 * Fetches distinct countries available for scholarships.
 */
export const fetchDistinctCountries = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('scholarships')
        .select('country') as { data: { country: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct countries:", error);
        throw error;
    }
    const countries = data ? [...new Set(data.map(item => item.country))].sort() : [];
    return countries;
};

/**
 * Fetches distinct fields of study available for scholarships.
 * Note: This might return many variations if the field isn't standardized.
 * Consider creating a separate table or enum for fields_of_study for better filtering.
 */
export const fetchDistinctFields = async (): Promise<string[]> => {
     const { data, error } = await supabase
        .from('scholarships')
        .select('field_of_study') as { data: { field_of_study: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct fields:", error);
        throw error;
    }
    // Simple split and unique logic - might need refinement
    const allFields = data ? data.flatMap(item => item.field_of_study.split(/, | & /)) : [];
    const uniqueFields = [...new Set(allFields.map(field => field.trim()))].filter(Boolean).sort();
    return uniqueFields;
};


/**
 * Fetches distinct levels (e.g., Undergraduate, Masters) available for scholarships.
 */
export const fetchDistinctLevels = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('scholarships')
        .select('level') as { data: { level: string }[] | null, error: any };

    if (error) {
        console.error("Error fetching distinct levels:", error);
        throw error;
    }
     // Simple split and unique logic for levels
    const allLevels = data ? data.flatMap(item => item.level.split(/, | & /)) : [];
    const uniqueLevels = [...new Set(allLevels.map(level => level.trim()))].filter(Boolean).sort();
    return uniqueLevels;
};

// TODO: Implement functions for saved scholarships (fetch, save, unsave)
