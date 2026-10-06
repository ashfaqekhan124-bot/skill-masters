import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, name, role, referral_code, email_verified, created_at
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // Retry once after delay - the profile trigger may not have completed yet
      setTimeout(async () => {
        if (!mounted) return;
        const { data: retryData } = await supabase
          .from('profiles')
          .select('id, name, role, referral_code, email_verified, created_at')
          .eq('id', userId)
          .maybeSingle();
        if (retryData) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setProfile({ ...retryData, email: currentUser?.email || '' });
        }
        setLoading(false);
      }, 1500);
      return;
    }

    if (data) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const fullProfile: Profile = {
        ...data,
        email: currentUser?.email || '',
      };
      setProfile(fullProfile);
    }
    setLoading(false);
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
