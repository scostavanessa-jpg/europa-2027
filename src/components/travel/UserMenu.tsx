import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const UserMenu = () => {
  const { user, profile, roles, loading, isOrganizadora } = useAuth();
  if (loading) return null;
  if (!user) return <Link to="/auth" className="px-3 py-1.5 rounded-full text-xs md:text-sm bg-olive text-primary-foreground whitespace-nowrap">Entrar</Link>;
  const label = profile?.display_name ?? user.email ?? "Conta";
  const role = isOrganizadora ? "organizadora" : roles[0] ?? "viajante";
  return <Link to="/grupo" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-secondary/60 transition-colors">
    {profile?.avatar_url ? <img src={profile.avatar_url} alt={`Foto de ${label}`} className="h-7 w-7 rounded-full object-cover" /> : <span className="h-7 w-7 rounded-full bg-olive/15 grid place-items-center text-olive text-xs font-medium">{label.charAt(0).toUpperCase()}</span>}
    <span className="hidden sm:block text-xs leading-tight text-left"><span className="block text-ink max-w-[9rem] truncate">{label.split(" ")[0]}</span><span className="block text-muted-foreground">{role}</span></span>
  </Link>;
};