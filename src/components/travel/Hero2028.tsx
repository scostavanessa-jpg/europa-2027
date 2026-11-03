import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, ListChecks, MapPin, Sparkles, TrainFront } from "lucide-react";

export const Hero2028 = () => (
  <header id="topo" className="relative overflow-hidden border-b border-border/60 bg-gradient-warm">
    <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
    <div className="absolute top-48 -left-28 h-80 w-80 rounded-full bg-olive/10 blur-3xl" />

    <div className="relative container mx-auto px-4 sm:px-6 pt-14 pb-16 md:pt-24 md:pb-24 max-w-6xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 backdrop-blur px-4 py-2 text-xs text-olive mb-6">
        <Sparkles className="h-3.5 w-3.5" /> Europa 2028 · Vanessa, Camila e Danielle
      </div>

      <p className="font-body text-xs md:text-sm tracking-[0.3em] uppercase text-olive mb-5">Diário de bordo · março e abril de 2028</p>
      <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] text-ink text-balance max-w-4xl">
        Europa e curso.<br />A ordem ainda está aberta.
        <span className="block italic text-olive font-light text-3xl sm:text-4xl md:text-5xl mt-3">hoje, a tendência é passear primeiro</span>
      </h1>
      <p className="mt-7 font-body text-base md:text-lg text-foreground/75 max-w-2xl leading-relaxed">
        O que está fechado é a estrutura: cerca de 5 semanas no total, sendo 4 semanas de curso em Liverpool e aproximadamente 1 semana de Europa. O site passa a comparar as duas ordens sem fingir que a decisão já foi tomada.
      </p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
        <div className="rounded-2xl border border-border/60 bg-card/75 p-4"><CalendarDays className="h-4 w-4 text-olive mb-2"/><p className="text-xs text-muted-foreground">Janela</p><p className="font-display text-lg text-ink">mar · abr 2028</p></div>
        <div className="rounded-2xl border border-gold/50 bg-gold/10 p-4"><TrainFront className="h-4 w-4 text-olive mb-2"/><p className="text-xs text-muted-foreground">Tendência atual</p><p className="font-display text-lg text-ink">Europa → curso</p></div>
        <div className="rounded-2xl border border-border/60 bg-card/75 p-4"><GraduationCap className="h-4 w-4 text-olive mb-2"/><p className="text-xs text-muted-foreground">Curso</p><p className="font-display text-lg text-ink">4 semanas</p></div>
        <div className="rounded-2xl border border-border/60 bg-card/75 p-4"><MapPin className="h-4 w-4 text-olive mb-2"/><p className="text-xs text-muted-foreground">Regra fixa</p><p className="font-display text-lg text-ink">voltar antes de 13 mai</p></div>
      </div>

      <div className="mt-9 flex flex-wrap gap-3 no-print">
        <Button asChild size="lg" className="rounded-full bg-olive hover:bg-olive/90 text-primary-foreground shadow-soft px-7"><a href="#datas"><CalendarDays className="mr-1 h-4 w-4" />Comparar as duas ordens</a></Button>
        <Button asChild size="lg" variant="outline" className="rounded-full border-olive/40 text-olive bg-card/60 hover:bg-card px-7"><a href="#mapa"><MapPin className="mr-1 h-4 w-4" />Ver os dois sentidos da rota</a></Button>
        <Button asChild size="lg" variant="ghost" className="rounded-full text-olive px-5"><a href="#checklist"><ListChecks className="mr-1 h-4 w-4" />Checklist</a></Button>
      </div>
    </div>
  </header>
);