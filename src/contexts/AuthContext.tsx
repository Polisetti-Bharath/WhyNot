import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set a safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timed out after 10 seconds');
        setLoading(false);
      }
    }, 10000);

    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;

        clearTimeout(loadingTimeout);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        if (!mounted) return;

        console.error('Auth session error:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const data = await api.getStudentProfile(userId);

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
          name: data.name,
          avatar: data.avatar,
          department: data.department,
          notifications: 0,
          major: data.major,
          year: data.year,
          semester: data.semester,
          cgpa: data.cgpa,
          skills: data.skills,
          preferences: data.preferences,
        });
      } else {
        // If no profile data, we don't sign out immediately to allow for profile creation/recovery
        console.warn('No profile found for user:', userId);
        setUser(null);
        // Do not sign out here, as it prevents profile creation flows
        // await supabase.auth.signOut();
        throw new Error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile-setup`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          name,
          role,
          ...additionalData,
        });

        if (profileError) throw profileError;

        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
    } catch (error: any) {
      console.error('SignOut error:', error);
    } finally {
      // Always clear user state locally, even if server request fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
