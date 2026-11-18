import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { RbacRole } from '@/lib/rbac';

export interface AuthProfile {
  id: string;
  handle: string;
  display_name: string;
  avatar_initials: string;
  accent: string;
  country: string;
  bio: string;
  game: string;
  verified: boolean;
  discord_connected: boolean;
  discord_username: string | null;
  discord_status: string;
  reputation: number;
  created_at: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: RbacRole;
  loading: boolean;
  signUp: (email: string, password: string, handle: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function deriveRole(user: User | null): RbacRole {
  if (!user) return 'Normal Member';
  const role = user.app_metadata?.role;
  const validRoles: RbacRole[] = [
    'Server Owner', 'Administrator', 'Junior Administrator',
    'Moderator', 'Support Team', 'Loan Center Management',
    'Loan Officer', 'Normal Member',
  ];
  return (validRoles as string[]).includes(role) ? (role as RbacRole) : 'Normal Member';
}

export function useAuthProvider(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('[Auth] Failed to fetch profile:', error.message);
      return null;
    }
    setProfile(data as AuthProfile | null);
    return data as AuthProfile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(
    async (email: string, password: string, handle: string, displayName: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { handle, display_name: displayName },
        },
      });

      if (error) return { error: error.message };
      if (!data.user) return { error: 'Sign-up failed: no user returned.' };

      // Create profile row
      const initials = displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        handle,
        display_name: displayName,
        avatar_initials: initials,
      });

      if (profileError) {
        return { error: `Account created but profile setup failed: ${profileError.message}` };
      }

      return { error: null };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    role: deriveRole(session?.user ?? null),
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
}
