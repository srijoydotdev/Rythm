// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        toast.success("Signed out successfully");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}