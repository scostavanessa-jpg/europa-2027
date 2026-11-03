import { ArrowRight, Building2, GraduationCap, MapPin, Mountain, Plane, Train } from "lucide-react";

const stops=[
  {icon:Plane,name:"Brasil",note:"10/03 à noite · chegada pelo Reino Unido"},
  {icon:GraduationCap,name:"Liverpool",note:"Kaplan · 13/03 a 07/04"},
  {icon:Building2,name:"Londres",note:"2 noites · início do mochilão"},
  {icon:Train,name:"Amsterdam",note:"2 noites · Eurostar"},
  {icon:Building2,name:"Bruxelas",note:"Stopover · sem hotel"},
  {icon:MapPin,name:"Strasbourg",note:"1 noite · bônus logístico"},
  {icon:Mountain,name:"St. Moritz",note:"1 noite · Pontresina/Samedan se compensar"},
  {icon:Train,name:"Tirano",note:"Bernina Line · conexão italiana"},
  {icon:Building2,name:"Milão",note:"2 noites · voo de volta"},
];

export const RouteMap=()=> (
  <section id="mapa" className="bg-gradient-warm border-y border-border/60">
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Percurso recomendado</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink">Do curso ao mochilão, sem voltar para trás</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">Depois das 4 semanas em Liverpool, a rota cruza a Europa de oeste para leste e termina em Milão: Liverpool → Londres → Amsterdam → Bruxelas → Strasbourg → Alpes → Tirano → Milão.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stops.map((s,i)=><div key={s.name} className={`relative rounded-3xl bg-card border p-5 shadow-card ${s.name==="Liverpool"?"border-gold/60 ring-1 ring-gold/20":"border-border/60"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-2xl bg-olive/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-olive"/></div>
            <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{String(i+1).padStart(2,"0")}</span>
          </div>
          <p className="font-display text-2xl text-ink mt-4">{s.name}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.note}</p>
          {i<stops.length-1&&<ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold z-10"/>}
        </div>)}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl border border-gold/30 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Por que assim?</strong> o curso fica protegido dos feriados de Páscoa e a viagem termina em Milão, de onde faz sentido pesquisar a volta ao Brasil em bilhete multidestino/open jaw.</div>
        <div className="rounded-2xl border border-olive/25 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Lugar extra que passa no teste:</strong> Strasbourg. Bruges pode substituir Bruxelas se virar prioridade; não vale acrescentar as duas e transformar o dia em catálogo de estação de trem.</div>
      </div>
    </div>
  </section>
);