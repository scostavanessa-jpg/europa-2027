import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, GraduationCap, MapPin, TrainFront } from "lucide-react";

const facts = [
  { icon: CalendarDays, label: "Quando", value: "Março · abril 2028" },
  { icon: TrainFront, label: "Roteiro", value: "Europa primeiro? Talvez!" },
  { icon: GraduationCap, label: "Intercâmbio", value: "4 semanas em Liverpool" },
  { icon: MapPin, label: "Volta", value: "Até 13 de maio" },
];

export const Hero2028 = () => (
  <header id="topo" className="relative isolation-auto overflow-hidden bg-[#f6f2e9] border-b border-[#e3ddcd]">
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <img src="/hero-train.svg" alt="" loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-[58%_50%] scale-[1.04] opacity-[.52]"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,246,240,.96)_0%,rgba(248,246,240,.84)_48%,rgba(248,246,240,.54)_100%)]"/>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f6f2e9] to-transparent"/>
    </div>

    <div className="relative mx-auto max-w-6xl px-5 sm:px-7 pt-14 pb-12 md:pt-24 md:pb-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-white/70 px-4 py-2 text-[11px] font-medium tracking-[.11em] uppercase text-olive shadow-sm backdrop-blur">
        <span className="inline-block size-2 rounded-full bg-[#c99b71]" /> Nosso diário de bordo · 2028
      </div>
      <p className="mt-9 text-xs uppercase tracking-[.32em] font-semibold text-olive/80">Vanessa · Camila · Danielle</p>
      <h1 className="mt-4 max-w-[750px] font-display text-[clamp(3.6rem,9vw,7.5rem)] leading-[.91] tracking-[-.035em] text-[#293023]">
        A viagem começa<br/><span className="italic font-light text-[#68734c]">antes do embarque.</span>
      </h1>
      <p className="mt-7 max-w-xl text-[15px] leading-[1.9] text-[#5c6255]">
        Um mês de curso em Liverpool, uma semana para se perder pela Europa e muitas decisões para sonhar juntas.
        A ordem ainda está aberta — e o planejamento também.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <Link to="/planejar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-olive px-6 font-medium text-sm text-white shadow-[0_14px_30px_-18px_rgba(47,60,35,.7)] transition-transform active:scale-[.98] hover:-translate-y-0.5">
          Abrir nosso planejamento <ArrowUpRight className="h-4 w-4"/>
        </Link>
        <Link to="/rateio" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-olive/30 bg-white/60 px-6 text-sm font-medium text-olive transition-colors hover:bg-white">
          Organizar as despesas <ArrowUpRight className="h-4 w-4"/>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:gap-3">
        {facts.map(({icon: Icon,label,value})=>(
          <div key={label} className="min-h-[103px] rounded-[20px] border border-white/70 bg-white/70 p-4 shadow-[0_8px_25px_-22px_rgba(39,47,28,.4)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-olive/75"><Icon className="h-4 w-4"/><span className="text-[10px] uppercase tracking-[.12em] font-semibold">{label}</span></div>
            <p className="mt-3 text-sm sm:text-[15px] leading-snug font-medium text-[#30362b]">{value}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="relative h-1 w-full bg-gradient-to-r from-[#bfb894]/30 via-[#aa9f7d]/50 to-transparent"/>
  </header>
);
