import { Nav } from "@/components/travel/Nav";
import { Hero } from "@/components/travel/Hero";
import { Countdown } from "@/components/travel/Countdown";
import { WorldClocks } from "@/components/travel/WorldClocks";
import { SummaryCards } from "@/components/travel/SummaryCards";
import { CriticalBuy } from "@/components/travel/CriticalBuy";
import { Itinerary } from "@/components/travel/Itinerary";
import { RouteMap } from "@/components/travel/RouteMap";
import { Expenses } from "@/components/travel/Expenses";
import { Lodging } from "@/components/travel/Lodging";
import { FullChecklist } from "@/components/travel/FullChecklist";
import { GroupAgreements } from "@/components/travel/GroupAgreements";
import { FloatingActions } from "@/components/travel/FloatingActions";

const Index=()=> <div className="min-h-screen bg-background text-foreground"><Nav/><main><Hero/><Countdown/><WorldClocks/><SummaryCards/><CriticalBuy/><Itinerary/><RouteMap/><Expenses/><Lodging/><FullChecklist/><GroupAgreements/></main><footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground no-print">Europa até Liverpool 2027 <span className="text-gold">✦</span> planejamento vivo da viagem</footer><FloatingActions/></div>;
export default Index;