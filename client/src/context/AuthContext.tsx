import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import apiClient from '../services/apiClient';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'MANAGEMENT' | 'FACULTY_ADVISOR' | 'SOCIETY_OB' | 'MEMBER';
  societyId?: string | null;
  society?: {
    id: string;
    name: string;
    balance?: number | string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

type E2EAuthState = {
  user: User | null;
  profile: UserProfile | null;
};

const getE2EAuthState = () => {
  return (globalThis as typeof globalThis & { __E2E_AUTH_STATE__?: E2EAuthState }).__E2E_AUTH_STATE__ ?? null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useSupabaseAuth = () => {
  const initialE2E = getE2EAuthState();
  const [user, setUser] = useState<User | null>(initialE2E?.user ?? null);
  const [profile, setProfile] = useState<UserProfile | null>(initialE2E?.profile ?? null);
  const [loading, setLoading] = useState<boolean>(!initialE2E);
  const isMounted = useRef(true);

  const fetchProfile = useCallback(async () => {
    const res = await apiClient.get<UserProfile>('/auth/me');
    if (isMounted.current) {
      setProfile(res.data);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      await fetchProfile();
    } catch (err) {
      console.error('Failed to fetch profile', err);
      if (isMounted.current) {
        setProfile(null);
      }
      toast.error('Unable to load profile. Please sign in again.');
    }
  }, [fetchProfile]);

  useEffect(() => {
    isMounted.current = true;

    const e2eAuthState = getE2EAuthState();
    if (e2eAuthState) {
      if (isMounted.current) {
        setUser(e2eAuthState.user);
        setProfile(e2eAuthState.profile);
        setLoading(false);
      }

      return () => {
        isMounted.current = false;
      };
    }

    const initializeAuth = async () => {
      if (isMounted.current) {
        setLoading(true);
      }

      try {
        try {
          const healthResponse = await apiClient.get('/health');
          console.info('Backend health check OK', healthResponse.data);
        } catch (healthError) {
          console.error('Backend health check failed', healthError);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const sessionUser = session?.user ?? null;
        if (isMounted.current) {
          setUser(sessionUser);
        }

        if (sessionUser) {
          await refreshProfile();
        } else {
          isMounted.current && setProfile(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted.current) {
        setLoading(true);
      }

      const sessionUser = session?.user ?? null;
      if (isMounted.current) {
        setUser(sessionUser);
      }

      if (sessionUser) {
        await refreshProfile();
      } else {
        isMounted.current && setProfile(null);
      }

      if (isMounted.current) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Sign out failed. Please try again.');
      throw error;
    }

    if (isMounted.current) {
      setUser(null);
      setProfile(null);
    }
  }, []);

  return {
    user,
    profile,
    loading,
    refreshProfile,
    signOut,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, refreshProfile, signOut } = useSupabaseAuth();

  const contextValue = useMemo(
    () => ({ user, profile, loading, refreshProfile, signOut }),
    [user, profile, loading, refreshProfile, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
