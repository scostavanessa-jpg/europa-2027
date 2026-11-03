import { ArrowRight, Building2, GraduationCap, MapPin, Mountain, Train } from "lucide-react";

const stops=[
  {icon:Building2,name:"Milão",note:"Entrada preferencial · 2 noites"},
  {icon:Train,name:"Tirano",note:"Conexão para a Bernina Line"},
  {icon:Mountain,name:"St. Moritz",note:"Alpes · dormir em St. Moritz/Pontresina"},
  {icon:MapPin,name:"Strasbourg",note:"Bônus logístico · 1 noite"},
  {icon:Building2,name:"Bruxelas",note:"Parada longa · sem trocar hotel"},
  {icon:Train,name:"Amsterdam",note:"2 noites · canais + Anne Frank"},
  {icon:Building2,name:"Londres",note:"2 noites · conexão perfeita"},
  {icon:GraduationCap,name:"Liverpool",note:"Kaplan · 4 semanas"},
];

export const RouteMap=()=> (
  <section id="mapa" className="bg-gradient-warm border-y border-border/60">
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Percurso recomendado</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink">Uma linha lógica até Liverpool</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">A ordem foi pensada para preservar os lugares que vocês querem, evitar Alemanha como destino e não incluir Paris no roteiro. Strasbourg entra como cidade-bônus porque cria uma passagem ferroviária natural entre Suíça e Bélgica.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        <div className="rounded-2xl border border-gold/30 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Trecho crítico:</strong> St. Moritz → Strasbourg → Bruxelas. A malha 2028 ainda não abriu, então a compra só acontece quando os horários oficiais confirmarem conexões confortáveis.</div>
        <div className="rounded-2xl border border-olive/25 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Regra do roteiro:</strong> cidade nova só entra se trouxer experiência real sem custar uma diária, uma conexão ruim ou um dia inteiro perdido. Strasbourg passa nesse teste; Bruges, por exemplo, seria troca por Bruxelas, não um acréscimo automático.</div>
      </div>
    </div>
  </section>
);