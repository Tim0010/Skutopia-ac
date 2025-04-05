import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'mentor' | 'admin';
  avatar_url?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  last_login?: string;
}

const useUsers = () => {
  const [loading, setLoading] = useState(false);
  
  // Get all users (for admin)
  const getUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        throw profilesError;
      }
      
      // Ensure profiles is treated as an array
      const profilesArray = profiles || [];
      
      // Type the map to hold auth user objects
      let authUsersMap = new Map<string, User>();
      
      try {
        // Try to get auth users for emails (admin only can do this)
        // This will fail if the user doesn't have admin privileges (403 error)
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          console.warn('Limited access mode: Cannot access auth user data', error.message);
          // We'll continue without emails
        } else if (data?.users && Array.isArray(data.users)) {
          // Create a map for faster lookups
          data.users.forEach((user: User) => {
            if (user && user.id) {
              authUsersMap.set(user.id, user);
            }
          });
        }
      } catch (adminError) {
        console.warn('Limited access mode: Admin API not available');
        // Continue without admin data - we'll just use profiles
      }
      
      // Combine data
      const users: UserProfile[] = profilesArray.map((profile: any) => {
        // Try to get the matching auth user
        const authUser = authUsersMap.get(profile.id);
        
        return {
          id: profile.id,
          name: profile.name || 'Unknown',
          // The profile doesn't have email in its type, so we're only using authUser email or fallback
          email: authUser?.email || '[Access limited]',
          role: profile.role as 'student' | 'mentor' | 'admin',
          avatar_url: profile.avatar_url,
          // The User type from Supabase doesn't have 'banned' property directly
          // Check if the user's status is active instead
          status: authUser?.user_metadata?.status === 'inactive' || !authUser ? 'inactive' : 'active',
          created_at: profile.created_at,
          last_login: authUser?.last_sign_in_at
        };
      });
      
      setLoading(false);
      return users;
    } catch (error) {
      setLoading(false);
      console.error('Error in getUsers:', error);
      toast.error('Failed to fetch user data');
      return [];
    }
  }, []);
  
  // Get a single user by id
  const getUser = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data as UserProfile;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user
  const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success('User updated successfully');
      return data[0] as UserProfile;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Create a new user
  const createUser = useCallback(async (email: string, password: string, userData: Partial<UserProfile>) => {
    setLoading(true);
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Profile should be created by trigger, but let's ensure it has all data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          avatar_url: userData.avatar_url
        })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      toast.success('User created successfully');
      
      return {
        id: authData.user.id,
        email: authData.user.email,
        ...userData
      } as UserProfile;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete a user
  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // Delete auth user (profiles will cascade)
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) {
        throw error;
      }
      
      toast.success('User deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  };
};

export default useUsers;
