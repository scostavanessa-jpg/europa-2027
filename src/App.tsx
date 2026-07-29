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
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isTripMember, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-gold/30 border-t-olive animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Abrindo sua viagem…</p>
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
          <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-olive">Europa até Liverpool 2027</p>
          <h1 className="font-display text-3xl text-ink mt-2">Conta aguardando aprovação</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            O planejamento é privado. Somente Vanessa, Camila e Danielle vinculadas ao grupo conseguem acessar o roteiro e os dados da viagem.
          </p>
          <Button variant="outline" className="rounded-full mt-6" onClick={() => void signOut()}>Sair</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
          <Route path="/ofertas" element={<PrivateRoute><Ofertas /></PrivateRoute>} />
          <Route path="/grupo" element={<PrivateRoute><Grupo /></PrivateRoute>} />
          <Route path="/minha-viagem" element={<PrivateRoute><MinhaViagem /></PrivateRoute>} />
          <Route path="/rateio" element={<PrivateRoute><Rateio /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}
