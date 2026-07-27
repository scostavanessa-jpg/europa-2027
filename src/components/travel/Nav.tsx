import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { UserMenu } from "./UserMenu";
const links = [
  { href: "#resumo", label: "Resumo" }, { href: "#comprar", label: "Comprar" }, { href: "#roteiro", label: "Roteiro" },
  { href: "#mapa", label: "Mapa" }, { href: "#gastos", label: "Gastos" }, { href: "#hospedagem", label: "Estadias" },
  { href: "#checklist", label: "Checklist" }, { href: "#combinados", label: "Grupo" },
];
export const Nav = () => <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border/50 no-print">
  <div className="container mx-auto px-4 md:px-6 max-w-6xl flex items-center justify-between h-14">
    <a href="#topo" className="font-display text-lg text-ink tracking-tight whitespace-nowrap">Europa <span className="text-gold">·</span> <span className="italic text-olive">Liverpool 2027</span></a>
    <ul className="hidden lg:flex items-center gap-1 text-sm">
      {links.map(l => <li key={l.href}><a href={l.href} className="px-3 py-2 rounded-full text-foreground/70 hover:text-olive hover:bg-secondary/60 transition-colors">{l.label}</a></li>)}
      <li><Link to="/ofertas" className="ml-1 px-3 py-2 rounded-full bg-gold/20 text-ink hover:bg-gold/30 transition-colors inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-olive" /> Ofertas</Link></li>
      <li className="ml-1"><UserMenu /></li>
    </ul>
    <div className="lg:hidden flex items-center gap-2 min-w-0"><div className="overflow-x-auto flex gap-1 max-w-[55vw]">{links.slice(0,5).map(l => <a key={l.href} href={l.href} className="px-2 py-1.5 rounded-full whitespace-nowrap text-xs text-foreground/70">{l.label}</a>)}<Link to="/ofertas" className="px-2 py-1.5 rounded-full whitespace-nowrap text-xs bg-gold/20 text-ink">✨ Ofertas</Link></div><UserMenu /></div>
  </div>
</nav>;