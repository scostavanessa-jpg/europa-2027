import { Link } from "react-router-dom";
import { Home, MapPinned, Sparkles, UserRound, WalletCards } from "lucide-react";
import { UserMenu } from "./UserMenu";

const links = [
  { href: "#resumo", label: "Resumo" },
  { href: "#comprar", label: "Comprar" },
  { href: "#roteiro", label: "Roteiro" },
  { href: "#mapa", label: "Mapa" },
  { href: "#gastos", label: "Gastos" },
  { href: "#hospedagem", label: "Estadias" },
  { href: "#checklist", label: "Checklist" },
  { href: "#combinados", label: "Grupo" },
];

const mobileItems = [
  { type: "anchor" as const, href: "#topo", label: "Início", icon: Home },
  { type: "anchor" as const, href: "#roteiro", label: "Roteiro", icon: MapPinned },
  { type: "anchor" as const, href: "#gastos", label: "Gastos", icon: WalletCards },
  { type: "route" as const, href: "/ofertas", label: "Ofertas", icon: Sparkles },
  { type: "route" as const, href: "/minha-viagem", label: "Minha", icon: UserRound },
];

export const Nav = () => (
  <>
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/90 border-b border-border/50 no-print">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl flex items-center justify-between h-14">
        <a href="#topo" className="font-display text-lg text-ink tracking-tight whitespace-nowrap">
          Europa <span className="text-gold">·</span> <span className="italic text-olive">2028</span>
        </a>

        <ul className="hidden lg:flex items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="px-3 py-2 rounded-full text-foreground/70 hover:text-olive hover:bg-secondary/60 transition-colors">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/ofertas" className="ml-1 px-3 py-2 rounded-full bg-gold/20 text-ink hover:bg-gold/30 transition-colors inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-olive" /> Ofertas
            </Link>
          </li>
          <li className="ml-1"><UserMenu /></li>
        </ul>

        <div className="lg:hidden flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">mar · abr</span>
          <UserMenu />
        </div>
      </div>
    </nav>

    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 no-print px-3 pb-[max(.6rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-md rounded-[1.35rem] border border-border/70 bg-card/95 backdrop-blur-xl shadow-soft px-1.5 py-1.5 pointer-events-auto">
        <div className="grid grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium text-foreground/70 active:bg-secondary">
                <Icon className="h-4 w-4 text-olive" />
                {item.label}
              </span>
            );
            return item.type === "route" ? (
              <Link key={item.href} to={item.href} aria-label={item.label}>{content}</Link>
            ) : (
              <a key={item.href} href={item.href} aria-label={item.label}>{content}</a>
            );
          })}
        </div>
      </div>
    </nav>
  </>
);
