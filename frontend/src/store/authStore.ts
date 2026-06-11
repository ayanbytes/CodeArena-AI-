import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'intern' | null;
  isLoading: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  setRole: (role: 'admin' | 'intern' | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  setUser: (user, session) => set({ user, session }),
  setRole: (role) => set({ role }),
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch role from public.users table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        set({ user: session.user, session, role: profile?.role || 'intern', isLoading: false });
      } else {
        set({ user: null, session: null, role: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          set({ user: session.user, session, role: profile?.role || 'intern' });
        } else {
          set({ user: null, session: null, role: null });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: null });
  }
}));
