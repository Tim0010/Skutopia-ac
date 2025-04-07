import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Define the structure of the user_profiles table data
interface DbUserProfile {
  id: string; // This is the primary key of the user_profiles table
  user_id: string; // Foreign key to auth.users
  name?: string | null;
  age?: number | null;
  grade?: string | null;
  current_school?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  profile_completed?: boolean | null;
  role?: "student" | "mentor" | "admin" | null;
  created_at: string;
  updated_at: string;
}

// Define the structure for the user object used in the context
interface UserProfile {
  id: string; // This should be the auth.users ID
  email: string;
  name: string;
  role: "student" | "mentor" | "admin";
  avatarUrl?: string;
  currentSchool?: string;
  grade?: string;
  city?: string;
  age?: number;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// For mock/fallback user data - used until Supabase auth is fully implemented
const MOCK_USERS = [
  {
    id: "user1",
    email: "student@example.com",
    name: "John Student",
    password: "password123",
    role: "student" as const,
    avatarUrl: "https://i.pravatar.cc/150?u=user1"
  },
  {
    id: "user2",
    email: "mentor@example.com",
    name: "Sarah Mentor",
    password: "password123",
    role: "mentor" as const,
    avatarUrl: "https://i.pravatar.cc/150?u=user2"
  },
  {
    id: "00000000-0000-0000-0000-000000000001", // Use a valid UUID format for mock admin
    email: "admin@example.com",
    name: "Admin User",
    password: "admin123",
    role: "admin" as const,
    avatarUrl: "https://i.pravatar.cc/150?u=admin1"
  }
];

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount and set up auth listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);

        if (newSession?.user) {
          // Fetch user profile data including role
          fetchUserProfile(newSession.user);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user);
      }

      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log("Fetching user profile for:", authUser.id);
      const { data, error } = await supabase
        .from('user_profiles' as any)
        .select('*')
        .eq('user_id', authUser.id)
        .single<DbUserProfile>();

      if (error) {
        if (error.code === 'PGRST116') { // Standard code for row not found
          console.log("No profile found in user_profiles for user:", authUser.id);
          // Set user state based only on auth data, assuming profile not completed
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'User',
            role: authUser.app_metadata?.role || 'student',
            avatarUrl: authUser.user_metadata?.avatar_url,
            profileCompleted: false, // Explicitly false as no profile record exists
          });
        } else {
          // Log other errors more clearly, possibly RLS or connection issues
          console.error("Error fetching user profile (potentially RLS issue?):", error);
          toast.error(`Error loading profile: ${error.message}. Please check permissions.`);
          // Fallback: Use auth data but don't assume profileCompleted status
          // Keep existing user state if possible, or default cautiously
          setUser(currentUser => ({
            ...(currentUser || {}), // Keep existing fields if user state already exists
            id: authUser.id,       // Ensure essential auth fields are updated
            email: authUser.email || '',
            name: authUser.user_metadata?.name || currentUser?.name || 'User',
            role: authUser.app_metadata?.role || currentUser?.role || 'student',
            avatarUrl: authUser.user_metadata?.avatar_url || currentUser?.avatarUrl,
            // Avoid setting profileCompleted here on unexpected errors
            profileCompleted: currentUser?.profileCompleted ?? false, // Keep previous or default false
          }));
        }
        return; // Stop processing if there was an error
      }

      // If data is successfully fetched (profile exists)
      const profileData = data;
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: profileData?.name || authUser.user_metadata?.name || 'User',
        role: profileData?.role || authUser.app_metadata?.role || 'student',
        avatarUrl: profileData?.avatar_url || authUser.user_metadata?.avatar_url,
        currentSchool: profileData?.current_school ?? undefined,
        grade: profileData?.grade ?? undefined,
        city: profileData?.city ?? undefined,
        age: profileData?.age ?? undefined,
        // Use the fetched profile_completed status
        profileCompleted: profileData?.profile_completed ?? false,
      });
      console.log("User profile state updated from DB:", { completed: profileData?.profile_completed });

    } catch (err) {
      // Catch any unexpected errors during the try block
      console.error("Unhandled error in fetchUserProfile:", err);
      toast.error("An unexpected error occurred while loading your profile.");
      // Final fallback
      setUser(currentUser => ({
        ...(currentUser || {}),
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || currentUser?.name || 'User',
        role: authUser.app_metadata?.role || currentUser?.role || 'student',
        avatarUrl: authUser.user_metadata?.avatar_url || currentUser?.avatarUrl,
        profileCompleted: currentUser?.profileCompleted ?? false,
      }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase login error:", error.message);
        setLoading(false);
        toast.error(`Login failed: ${error.message}`);
        return false;
      }

      // Login successful with Supabase
      console.log("Supabase login successful:", data.user?.email);
      // User profile will be fetched by onAuthStateChange listener
      setLoading(false);
      return true;

    } catch (e: any) {
      console.error("Login function error:", e);
      setLoading(false);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
          },
        }
      });

      if (error) {
        toast.error(error.message || "An error occurred during signup");
        console.error("Signup error:", error);
        setLoading(false);
        return false;
      }

      toast.success("Account created successfully! Please check your email to verify.");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("skutopia_user");
      setUser(null);
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  // Function to manually refresh the user profile data
  const refreshUserProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      console.log("Refreshing user profile...");
      await fetchUserProfile(authUser);
    } else {
      console.log("No authenticated user found during refresh.");
      setUser(null);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      // Redirect happens, state managed by onAuthStateChange
      return true;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast.error(error.message || "Failed to sign in with Google.");
      setLoading(false);
      return false;
    }
  };

  const signInWithFacebook = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      // Redirect happens, state managed by onAuthStateChange
      return true;
    } catch (error: any) {
      console.error("Facebook Sign-In Error:", error);
      toast.error(error.message || "Failed to sign in with Facebook.");
      setLoading(false);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUserProfile,
    signInWithGoogle,
    signInWithFacebook,
    isAuthenticated: !!session,
    isAdmin: user?.role === "admin",
    session
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
