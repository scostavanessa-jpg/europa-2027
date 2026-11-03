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
  authError: string | null;
  isTripMember: boolean;
  isOrganizadora: boolean;
  canEdit: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, session: null, profile: null, participant: null, roles: [],
  loading: true, authError: null, isTripMember: false,
  isOrganizadora: false, canEdit: false,
  refreshProfile: async () => {}, signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearExtras = () => {
    setProfile(null); setRoles([]); setParticipant(null);
  };

  const loadExtras = async (uid: string) => {
    let bootstrapError: string | null = null;
    if (isNeonConfigured) {
      try {
        const { error } = await supabase.rpc("bootstrap_current_user");
        if (error) bootstrapError = error.message || "Falha ao preparar o perfil.";
      } catch (e: any) {
        bootstrapError = e?.message || "Falha ao preparar o perfil.";
      }
    }

    const [p, r, member] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, avatar_url").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      isNeonConfigured
        ? supabase.from("participants").select("id, name, email").eq("user_id", uid).maybeSingle()
        : Promise.resolve({ data: { id: uid, name: "Viajante", email: null }, error: null }),
    ]);
    if (p.error || r.error || member.error) {
      throw new Error(p.error?.message || r.error?.message || member.error?.message || "Erro ao buscar permissões.");
    }
    const nextRoles = ((r.data ?? []) as { role: AppRole }[]).map(x => x.role);
    setProfile((p.data as Profile) ?? null);
    setParticipant((member.data as Participant) ?? null);
    setRoles(nextRoles);
    // An existing, verified database link remains valid even if the bootstrap request was unavailable.
    setAuthError(!member.data && !nextRoles.includes("organizadora") ? bootstrapError : null);
  };

  const refreshProfile = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const s = data?.session ?? null;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.id) await loadExtras(s.user.id);
      else clearExtras();
    } catch (e: any) {
      clearExtras();
      setAuthError(e?.message || "Não foi possível consultar seu acesso.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    let currentRequest = 0;
    const applySession = async (s: Session | null) => {
      const request = ++currentRequest;
      if (!active) return;
      setLoading(true);
      setAuthError(null);
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        clearExtras();
        if (active && currentRequest === request) setLoading(false);
        return;
      }
      try {
        await loadExtras(s.user.id);
      } catch (e: any) {
        if (active && currentRequest === request) {
          clearExtras();
          setAuthError(e?.message || "Não foi possível carregar seu perfil.");
        }
      } finally {
        if (active && currentRequest === request) setLoading(false);
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event: unknown, s: Session | null) => {
      void applySession(s);
    });
    supabase.auth.getSession()
      .then(({ data, error }: any) => {
        if (error) throw error;
        if (active) void applySession(data?.session ?? null);
      })
      .catch((e: any) => {
        if (active) {
          clearExtras();
          setAuthError(e?.message || "Não foi possível iniciar a sessão.");
          setLoading(false);
        }
      });
    return () => { active = false; currentRequest++; sub.subscription.unsubscribe(); };
  }, []);

  // The server-side verified organizer role, not merely a client-supplied e-mail,
  // is the source of authority for administrative actions.
  const isOrganizadora = roles.includes("organizadora");
  const isTripMember = Boolean(participant) || isOrganizadora || (!isNeonConfigured && Boolean(user));
  const canEdit = isTripMember;

  return (
    <Ctx.Provider value={{
      user, session, profile, participant, roles, loading, authError,
      isTripMember, isOrganizadora, canEdit, refreshProfile,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
