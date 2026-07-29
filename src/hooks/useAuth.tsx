import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isNeonConfigured } from "@/integrations/supabase/client";

export type AppRole = "organizadora" | "editora" | "convidada";
type Profile = { id: string; display_name: string | null; email: string | null; avatar_url: string | null };
export type Participant = { id: string; name: string; email: string | null };
type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  participant: Participant | null;
  roles: AppRole[];
  loading: boolean;
  isTripMember: boolean;
  isOrganizadora: boolean;
  canEdit: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  participant: null,
  roles: [],
  loading: true,
  isTripMember: false,
  isOrganizadora: false,
  canEdit: false,
  signOut: async () => {},
});
const ADMIN_EMAIL = "scosta.vanessa@gmail.com";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExtras = async (uid: string) => {
    if (isNeonConfigured) {
      try { await supabase.rpc("bootstrap_current_user"); } catch {}
    }

    const profilePromise = supabase.from("profiles").select("id, display_name, email, avatar_url").eq("id", uid).maybeSingle();
    const rolePromise = supabase.from("user_roles").select("role").eq("user_id", uid);
    const participantPromise = isNeonConfigured
      ? supabase.from("participants").select("id, name, email").eq("user_id", uid).maybeSingle()
      : Promise.resolve({ data: { id: uid, name: "Viajante", email: null } });

    const [{ data: p }, { data: r }, { data: member }] = await Promise.all([
      profilePromise,
      rolePromise,
      participantPromise,
    ] as any);

    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
    setParticipant((member as Participant) ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const applySession = async (s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(true);
      if (s?.user) {
        try { await loadExtras(s.user.id); } catch {
          setProfile(null); setRoles([]); setParticipant(null);
        }
      } else {
        setProfile(null); setRoles([]); setParticipant(null);
      }
      if (mounted) setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event: unknown, s: Session | null) => {
      void applySession(s);
    });

    supabase.auth.getSession().then(({ data }: any) => void applySession(data.session));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const emailAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const isOrganizadora = emailAdmin || roles.includes("organizadora");
  const isTripMember = !isNeonConfigured || Boolean(participant) || isOrganizadora;
  const canEdit = isOrganizadora || roles.includes("editora");

  return (
    <Ctx.Provider value={{
      user,
      session,
      profile,
      participant,
      roles,
      loading,
      isTripMember,
      isOrganizadora,
      canEdit,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
