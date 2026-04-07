import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string; phone: string; avatar_url: string } | null;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; phone: string; avatar_url: string } | null>(null);

  useEffect(() => {
    const checkAndCaptureLocation = async (userId: string) => {
      if (!("geolocation" in navigator)) return;
      
      const { data } = await supabase.from("addresses").select("id").eq("user_id", userId).limit(1).maybeSingle();
      if (data) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
              { headers: { 'Accept': 'application/json', 'User-Agent': 'PicmartApp/1.0' } }
            );
            if (!res.ok) return;
            const geoData = await res.json();
            const addressText = geoData.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`;
            
            await supabase.from("addresses").insert({
              user_id: userId,
              full_address: addressText,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              is_default: true,
              label: 'Home'
            });
          } catch (e) {
            console.error("Auto location capture failed", e);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
        if (event === "SIGNED_IN") {
          setTimeout(() => checkAndCaptureLocation(session.user.id), 1000);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("full_name, phone, avatar_url").eq("user_id", userId).single();
    if (data) setProfile(data);
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
