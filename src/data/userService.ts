import { supabase } from '@/lib/supabaseClient'; // Corrected import name

export interface UserProfile {
    id: string;
    name?: string; // Assuming name comes from user_metadata or another field
    bio?: string;
    phone?: string;
    location?: string;
    avatar_url?: string;
    theme?: 'light' | 'dark';
    // Add other fields from your users table as needed
}

// Function to fetch user profile data (you might already have this)
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    const { data, error } = await supabase
        .from('users') // Adjust table name if needed
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
    return data;
}


// Function to update user profile data in the database
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (!userId) throw new Error("User ID is required.");

    // Remove id from updates if present, as it shouldn't be updated
    const { id, ...updateData } = updates;

    const { data, error } = await supabase
        .from("users") // Adjust table name if needed
        .update(updateData)
        .eq("id", userId)
        .select() // Select the updated data to return
        .single(); // Assuming only one row is updated

    if (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
    console.log("Profile updated successfully in DB:", data);
    return data as UserProfile;
}

// Function to upload avatar image and update user profile
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    if (!userId) throw new Error("User ID is required.");
    if (!file) throw new Error("File is required.");

    try {
        // We'll skip the bucket check since we know it exists now
        // Just proceed directly with the upload
        
        // Prepare file details
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        console.log(`Uploading avatar to path: ${filePath}`);

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { 
                cacheControl: '3600', 
                upsert: true // Overwrite if file exists
            });

        if (uploadError) {
            console.error("Error uploading avatar to storage:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log("Avatar uploaded successfully to storage.");

        // Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
            console.error("Could not get public URL for avatar");
            throw new Error("Could not get public URL for avatar");
        }

        const publicURL = urlData.publicUrl;
        console.log("Public URL obtained:", publicURL);

        // Update the user's profile with the new avatar URL
        await updateUserProfile(userId, { avatar_url: publicURL });
        console.log("User profile updated with new avatar URL.");
        return publicURL;
    } catch (error) {
        console.error("Avatar upload process failed:", error);
        throw error;
    }
}

// Function to update the user's theme preference
export async function updateTheme(userId: string, theme: 'light' | 'dark'): Promise<void> {
    if (!userId) throw new Error("User ID is required.");

    const { data, error } = await supabase
        .from("users") // Adjust table name if needed
        .update({ theme })
        .eq("id", userId);

    if (error) {
        console.error("Error updating theme:", error);
        throw error;
    }
    console.log(`User theme updated to ${theme}`);
}

// --- Delete User Account (Invokes Edge Function) ---
export const deleteCurrentUserAccount = async (): Promise<void> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error(sessionError?.message || "User is not authenticated.");
    }

    // Invoke the Edge Function
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
        // No body needed as function gets user from session
    });

    if (error) {
        console.error("Edge function invocation error:", error);
        throw new Error(`Failed to delete account: ${error.message}`);
    }

    if (data && !data.success) {
        console.error("Edge function returned error:", data.error);
        throw new Error(data.error || "Failed to delete account from backend.");
    }

    console.log("Account deletion function invoked successfully.");
};
