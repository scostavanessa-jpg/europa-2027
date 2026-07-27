import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen bg-gradient-warm grid place-items-center px-6 text-center">
    <div className="max-w-md rounded-3xl bg-card border border-gold/30 shadow-card p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-olive mb-3">Europa até Liverpool 2027</p>
      <h1 className="font-display text-5xl text-ink">Página não encontrada</h1>
      <p className="mt-4 text-sm text-muted-foreground">Esse caminho saiu do roteiro. Vamos voltar para a viagem.</p>
      <Button asChild className="mt-7 rounded-full"><Link to="/">Voltar ao início</Link></Button>
    </div>
  </div>
);

export default NotFound;