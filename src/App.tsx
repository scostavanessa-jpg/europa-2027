import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Ofertas from "./pages/Ofertas";
import Auth from "./pages/Auth";
import Grupo from "./pages/Grupo";
import MinhaViagem from "./pages/MinhaViagem";
import Rateio from "./pages/Rateio";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
