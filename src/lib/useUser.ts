'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mapUser = (session: any): AppUser | null => {
      if (!session?.user) return null;
      const u = session.user;
      return {
        id: u.id,
        email: u.email || '',
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
        avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture,
      };
    };

    supabase.auth.getSession().then(({ data }) => {
      setUser(mapUser(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Quay lại đúng trang đang đứng (mặc định /app) để Supabase xử lý token + giữ phiên.
    // KHÔNG về "/" (landing) vì trang đó không khởi tạo Supabase -> mất phiên.
    const path = window.location.pathname;
    const back = path === '/' || path === '' ? '/app' : path + window.location.search;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + back },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signInWithGoogle, signOut };
}
