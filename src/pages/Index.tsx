import { Nav } from "@/components/travel/Nav";
import { Hero2028 } from "@/components/travel/Hero2028";
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

const Index=()=> <div className="min-h-screen bg-background text-foreground pb-24 lg:pb-0"><Nav/><main><Hero2028/><Countdown/><WorldClocks/><SummaryCards/><DateScenarios/><CriticalBuy/><RouteMap/><Itinerary/><TravelPrep/><Expenses/><Lodging/><FullChecklist/><GroupAgreements/></main><footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground no-print">Europa 2028 <span className="text-gold">✦</span> planejamento vivo da nossa viagem</footer><FloatingActions/></div>;
export default Index;