"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Debug logging for auth state changes
  useEffect(() => {
    console.log("Auth state changed:", {
      user: !!user,
      profile: !!profile,
      loading,
    });
  }, [user, profile, loading]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Session found:", !!session);
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        console.log("Setting loading to false in initializeAuth");
        setLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event, "Session:", !!session);
      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
      // Only set loading to false if we're not in the initial loading state
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
