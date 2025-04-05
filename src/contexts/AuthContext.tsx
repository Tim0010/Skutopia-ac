import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "student" | "mentor" | "admin";
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // Add refresh function
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
      // First, try to get profile from Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      
      if (profile) {
        setUser({
          id: profile.id,
          email: authUser.email || '',
          name: profile.name || authUser.user_metadata?.name || 'User',
          role: profile.role as "student" | "mentor" | "admin",
          avatarUrl: profile.avatar_url
        });
        
        console.log("User profile loaded from database:", profile.role);
        return;
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      // Fall back to mock data in case of error
    }
    
    // Fallback for development - use mock data if needed
    const mockUser = MOCK_USERS.find(u => u.email === authUser.email);
    if (mockUser) {
      const { password, ...userWithoutPassword } = mockUser;
      setUser({
        ...userWithoutPassword,
        id: authUser.id
      });
      console.log("Using mock data for user:", mockUser.role);
    } else {
      // Create a basic user profile
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'User',
        role: 'student',
        avatarUrl: authUser.user_metadata?.avatar_url
      });
      console.log("Created basic user profile");
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

  const getUserRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error getting user role:", error);
        return null;
      }
      
      return data?.role || null;
    } catch (error) {
      console.error("Get user role error:", error);
      return null;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student',
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
          }
        }
      });
      
      if (error) {
        toast.error(error.message || "An error occurred during signup");
        console.error("Signup error:", error);
        setLoading(false);
        return false;
      }
      
      // Successful signup
      toast.success("Account created successfully!");
      setLoading(false);
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
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUserProfile,
    isAuthenticated: !!session,
    isAdmin: user?.role === "admin",
    session
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
