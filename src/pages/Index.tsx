import { Nav } from "@/components/travel/Nav";
import { Hero2028 } from "@/components/travel/Hero2028";
import { PlannerHub } from "@/components/travel/PlannerHub";
import { Countdown } from "@/components/travel/Countdown";
import { WorldClocks } from "@/components/travel/WorldClocks";
import { SummaryCards } from "@/components/travel/SummaryCards";
import { DateScenarios } from "@/components/travel/DateScenarios";
import { CriticalBuy } from "@/components/travel/CriticalBuy";
import { Itinerary } from "@/components/travel/Itinerary";
import { RouteMap } from "@/components/travel/RouteMap";
import { TravelPrep } from "@/components/travel/TravelPrep";
import { Expenses } from "@/components/travel/Expenses";
import { Lodging } from "@/components/travel/Lodging";
import { FullChecklist } from "@/components/travel/FullChecklist";
import { GroupAgreements } from "@/components/travel/GroupAgreements";
import { FloatingActions } from "@/components/travel/FloatingActions";

const Index=()=> <div className="min-h-screen bg-background text-foreground pb-24 lg:pb-0"><Nav/><main><Hero2028/><PlannerHub/><Countdown/><DateScenarios/><RouteMap/>
  <section className="mx-auto max-w-6xl px-4 sm:px-7 py-9 md:py-14">
    <p className="text-[11px] tracking-[.25em] uppercase text-olive/70 font-semibold">Para consultar quando precisar</p>
    <h2 className="font-display text-4xl sm:text-5xl mt-2 text-ink">Nosso caderno de bordo</h2>
    <p className="text-sm text-muted-foreground mt-2 mb-6">O essencial fica à mão. O resto, organizado por assunto.</p>
    <div className="space-y-3">
      <details id="roteiro-detalhado" className="group rounded-[22px] border border-border/60 bg-card shadow-card overflow-hidden">
        <summary className="min-h-16 cursor-pointer px-5 sm:px-7 py-5 text-base font-semibold text-olive flex justify-between items-center">Roteiro e experiências <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span></summary>
        <Itinerary/><TravelPrep/>
      </details>
      <details className="group rounded-[22px] border border-border/60 bg-card shadow-card overflow-hidden">
        <summary className="min-h-16 cursor-pointer px-5 sm:px-7 py-5 text-base font-semibold text-olive flex justify-between items-center">Preços, gastos e hospedagem <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span></summary>
        <CriticalBuy/><Expenses/><Lodging/>
      </details>
      <details id="checklist" className="group rounded-[22px] border border-border/60 bg-card shadow-card overflow-hidden">
        <summary className="min-h-16 cursor-pointer px-5 sm:px-7 py-5 text-base font-semibold text-olive flex justify-between items-center">Checklist da viagem <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span></summary>
        <FullChecklist/>
      </details>
      <details className="group rounded-[22px] border border-border/60 bg-card shadow-card overflow-hidden">
        <summary className="min-h-16 cursor-pointer px-5 sm:px-7 py-5 text-base font-semibold text-olive flex justify-between items-center">Mais informações <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span></summary>
        <SummaryCards/><WorldClocks/><GroupAgreements/>
      </details>
    </div>
  </section></main><footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground no-print">Europa 2028 <span className="text-gold">✦</span> planejamento vivo da nossa viagem</footer><FloatingActions/></div>;
export default Index;