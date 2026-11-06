import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Ofertas from "./pages/Ofertas";
import Auth from "./pages/Auth";
import Grupo from "./pages/Grupo";
import MinhaViagem from "./pages/MinhaViagem";
import Rateio from "./pages/Rateio";
import Planejamento from "./pages/Planejamento";
import Projeto from "./pages/Projeto";
import Diagnostico from "./pages/Diagnostico";
import Ferias2028 from "./pages/Ferias2028";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { TravelDock } from "@/components/travel/TravelDock";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isTripMember, signOut, authError, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-gold/30 border-t-olive animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Abrindo nossa viagem…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  if (!isTripMember) {
    return (
      <div className="min-h-screen bg-gradient-warm grid place-items-center px-5 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-gold/30 bg-card/95 p-8 text-center shadow-soft">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gold/15 grid place-items-center">
            <LockKeyhole className="h-5 w-5 text-olive" />
          </div>
          <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-olive">Europa 2028</p>
          <h1 className="font-display text-3xl text-ink mt-2">Acesso restrito ao grupo</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Seu login existe, mas o vínculo com uma das três viajantes ainda não está aprovado.
            Confirme seu e-mail; Vanessa pode associar Camila e Danielle pela área do grupo.
          </p>
          {authError && <p className="mt-3 text-xs text-destructive">Não foi possível confirmar o perfil: {authError}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="rounded-full min-h-11" onClick={() => void refreshProfile()}>Atualizar meu acesso</Button>
            <Button variant="outline" className="rounded-full min-h-11" onClick={() => void signOut()}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}<TravelDock /></>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
          <Route path="/planejar" element={<PrivateRoute><Planejamento /></PrivateRoute>} />
          <Route path="/ferias-2028" element={<PrivateRoute><Ferias2028 /></PrivateRoute>} />
          <Route path="/ofertas" element={<PrivateRoute><Ofertas /></PrivateRoute>} />
          <Route path="/grupo" element={<PrivateRoute><Grupo /></PrivateRoute>} />
          <Route path="/minha-viagem" element={<PrivateRoute><MinhaViagem /></PrivateRoute>} />
          <Route path="/rateio" element={<PrivateRoute><Rateio /></PrivateRoute>} />
          <Route path="/projeto" element={<PrivateRoute><Projeto /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}
