import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Ofertas from "./pages/Ofertas";
import Auth from "./pages/Auth";
import Grupo from "./pages/Grupo";
import { AuthProvider } from "@/hooks/useAuth";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/grupo" element={<Grupo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}