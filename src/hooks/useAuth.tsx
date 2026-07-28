import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isNeonConfigured } from "@/integrations/supabase/client";

export type AppRole = "organizadora" | "editora" | "convidada";
type Profile = { id: string; display_name: string | null; email: string | null; avatar_url: string | null };
type AuthCtx = { user: User | null; session: Session | null; profile: Profile | null; roles: AppRole[]; loading: boolean; isOrganizadora: boolean; canEdit: boolean; signOut: () => Promise<void> };

const Ctx = createContext<AuthCtx>({ user: null, session: null, profile: null, roles: [], loading: true, isOrganizadora: false, canEdit: false, signOut: async () => {} });
const ADMIN_EMAIL = "scosta.vanessa@gmail.com";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExtras = async (uid: string) => {
    if (isNeonConfigured) {
      try { await supabase.rpc("bootstrap_current_user"); } catch {}
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, avatar_url").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  };

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event: unknown, s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user) setTimeout(() => loadExtras(s.user.id), 0);
      else { setProfile(null); setRoles([]); }
    });
    supabase.auth.getSession().then(({ data }: any) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) loadExtras(data.session.user.id);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const emailAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const isOrganizadora = emailAdmin || roles.includes("organizadora");
  const canEdit = isOrganizadora || roles.includes("editora");

  return <Ctx.Provider value={{ user, session, profile, roles, loading, isOrganizadora, canEdit, signOut: async () => { await supabase.auth.signOut(); } }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
