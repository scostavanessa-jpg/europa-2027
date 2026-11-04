import { Link, useLocation } from "react-router-dom";
import { Home, MapPinned, ReceiptText, Sparkles, UserRound } from "lucide-react";

const links = [
  { to: "/", label: "Início", icon: Home },
  { to: "/planejar", label: "Planejar", icon: MapPinned },
  { to: "/rateio", label: "Rateio", icon: ReceiptText },
  { to: "/ofertas", label: "Ofertas", icon: Sparkles },
  { to: "/minha-viagem", label: "Minha", icon: UserRound },
];

export function TravelDock() {
  const { pathname } = useLocation();
  // The landing page already has the existing persistent dock in Nav.
  if (pathname === "/") return null;

  return (
    <nav aria-label="Navegação da viagem" className="lg:hidden fixed inset-x-0 bottom-0 z-[60] no-print px-3 pb-[max(.6rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-md rounded-[1.35rem] border border-[#e4e2d7] bg-[#fffefa]/95 backdrop-blur-xl shadow-[0_15px_42px_-16px_rgba(39,49,28,.32)] p-1.5 pointer-events-auto">
        <div className="grid grid-cols-5 gap-1">
          {links.map(item => {
            const Icon = item.icon;
            const active = item.to === pathname || (item.to === "/minha-viagem" && pathname === "/grupo");
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={"flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors " +
                  (active ? "bg-[#e9eddf] text-[#46583a]" : "text-[#77806f] active:bg-[#f0f0e8]")}
              >
                <Icon className={"h-[19px] w-[19px] " + (active ? "text-[#46583a]" : "text-[#687764]")}/>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
