import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
  loading: true, authError: null, isTripMember: false, isOrganizadora: false, canEdit: false,
  refreshProfile: async () => {}, signOut: async () => {},
});

type Extra = { profile: Profile | null; participant: Participant | null; roles: AppRole[]; error: string | null };

async function getProfileDetails(uid: string): Promise<Extra> {
  let bootstrapError: string | null = null;
  if (isNeonConfigured) {
    try {
      const { error } = await supabase.rpc("bootstrap_current_user");
      if (error) bootstrapError = error.message || "Falha ao preparar perfil.";
    } catch (e: any) {
      bootstrapError = e?.message || "Falha ao preparar perfil.";
    }
  }
  const [p,r,m] = await Promise.all([
    supabase.from("profiles").select("id, display_name, email, avatar_url").eq("id",uid).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id",uid),
    isNeonConfigured
      ? supabase.from("participants").select("id, name, email").eq("user_id",uid).maybeSingle()
      : Promise.resolve({data:{id:uid,name:"Viajante",email:null},error:null}),
  ]);
  const failure=p.error||r.error||m.error;
  if (failure) throw new Error(failure.message || "Falha ao carregar perfil e permissões.");
  const roles=((r.data||[]) as {role:AppRole}[]).map(x=>x.role);
  const participant=(m.data as Participant)||null;
  return {
    profile: (p.data as Profile)||null,
    participant,
    roles,
    error:!participant&&!roles.includes("organizadora")?bootstrapError:null
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session,setSession]=useState<Session|null>(null);
  const [user,setUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [participant,setParticipant]=useState<Participant|null>(null);
  const [roles,setRoles]=useState<AppRole[]>([]);
  const [loading,setLoading]=useState(true);
  const [authError,setAuthError]=useState<string|null>(null);
  const requestRef=useRef(0);
  const mountedRef=useRef(true);

  const clearExtras=useCallback(()=>{
    setProfile(null);setParticipant(null);setRoles([]);
  },[]);

  const applySession=useCallback(async (next: Session|null)=>{
    const request=++requestRef.current;
    if(!mountedRef.current)return;
    setSession(next);
    setUser(next?.user||null);
    setLoading(true);
    setAuthError(null);
    if(!next?.user?.id){
      clearExtras();setLoading(false);return;
    }
    try{
      const extras=await getProfileDetails(next.user.id);
      // Async reads from an old login must never overwrite the active account.
      if(!mountedRef.current||request!==requestRef.current)return;
      setProfile(extras.profile);
      setParticipant(extras.participant);
      setRoles(extras.roles);
      setAuthError(extras.error);
    }catch(e:any){
      if(!mountedRef.current||request!==requestRef.current)return;
      clearExtras();
      setAuthError(e?.message||"Não foi possível carregar suas permissões.");
    }finally{
      if(mountedRef.current&&request===requestRef.current)setLoading(false);
    }
  },[clearExtras]);

  const refreshProfile=useCallback(async()=>{
    setLoading(true);setAuthError(null);
    try{
      const {data,error}=await supabase.auth.getSession();
      if(error)throw error;
      await applySession(data?.session||null);
    }catch(e:any){
      setAuthError(e?.message||"Não foi possível consultar seu login.");
      setLoading(false);
    }
  },[applySession]);

  useEffect(()=>{
    mountedRef.current=true;
    let active=true;
    let changedSinceStart=false;
    const {data:subscription}=supabase.auth.onAuthStateChange((event: unknown, next:Session|null)=>{
      if(event!=="INITIAL_SESSION")changedSinceStart=true;
      if(active)void applySession(next);
    });
    supabase.auth.getSession()
      .then(({data,error}:any)=>{
        if(error)throw error;
        if(active&&!changedSinceStart)void applySession(data?.session||null);
      })
      .catch((e:any)=>{
        if(active&&!changedSinceStart){
          setAuthError(e?.message||"Não foi possível verificar sua sessão.");
          setLoading(false);
        }
      });
    return ()=>{
      active=false;mountedRef.current=false;requestRef.current++;
      subscription?.subscription?.unsubscribe();
    };
  },[applySession]);

  const isOrganizadora=roles.includes("organizadora");
  const isTripMember=Boolean(participant)||isOrganizadora||(!isNeonConfigured&&Boolean(user));

  return <Ctx.Provider value={{
    user,session,profile,participant,roles,loading,authError,
    isTripMember,isOrganizadora,canEdit:isTripMember,refreshProfile,
    signOut:async()=>{await supabase.auth.signOut();await applySession(null);}
  }}>{children}</Ctx.Provider>;
};

export const useAuth=()=>useContext(Ctx);
