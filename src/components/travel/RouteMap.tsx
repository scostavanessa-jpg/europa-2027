import { ArrowRight, Building2, ExternalLink, GraduationCap, MapPin, Mountain, Plane, Train } from "lucide-react";

const europeFirst=[
  {icon:Plane,name:"Brasil",note:"embarque para a Europa"},
  {icon:Building2,name:"Milão",note:"boa porta de entrada para inverter a rota"},
  {icon:Train,name:"Tirano",note:"acesso à Bernina Line"},
  {icon:Mountain,name:"Alpes suíços",note:"Pontresina / St. Moritz / Samedan"},
  {icon:MapPin,name:"Strasbourg",note:"1 noite se continuar fazendo sentido"},
  {icon:Building2,name:"Bruxelas",note:"stopover ou troca por Bruges"},
  {icon:Train,name:"Amsterdam",note:"2 noites"},
  {icon:Building2,name:"Londres",note:"1–2 noites"},
  {icon:GraduationCap,name:"Liverpool",note:"4 semanas de curso"},
];

const courseFirst=[
  {icon:Plane,name:"Brasil",note:"chegada pelo Reino Unido"},
  {icon:GraduationCap,name:"Liverpool",note:"4 semanas de curso"},
  {icon:Building2,name:"Londres",note:"início do roteiro europeu"},
  {icon:Train,name:"Amsterdam",note:"2 noites"},
  {icon:Building2,name:"Bruxelas",note:"stopover ou troca por Bruges"},
  {icon:MapPin,name:"Strasbourg",note:"1 noite se continuar fazendo sentido"},
  {icon:Mountain,name:"Alpes suíços",note:"Pontresina / St. Moritz / Samedan"},
  {icon:Train,name:"Tirano",note:"Bernina Line"},
  {icon:Building2,name:"Milão",note:"final do roteiro e voo de volta"},
];

const mapSearch=(place:string)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(place);
const mapRoute=(origin:string,destination:string)=>"https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(origin)+"&destination="+encodeURIComponent(destination)+"&travelmode=transit";

const Route = ({title,badge,stops}:{title:string;badge:string;stops:typeof europeFirst}) => (
  <div className="rounded-[2rem] border border-border/60 bg-card/80 p-5 sm:p-6 shadow-card">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <span className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-[10px] uppercase tracking-wider text-olive">{badge}</span>
        <h3 className="font-display text-2xl sm:text-3xl text-ink mt-2">{title}</h3>
      </div>
    </div>
    <div className="space-y-2">
      {stops.map((s,i)=><div key={`${title}-${s.name}`} className="relative flex items-center gap-3 rounded-2xl border border-border/50 bg-background/60 p-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.name==="Liverpool"?"bg-gold/20":"bg-olive/10"}`}><s.icon className="h-4.5 w-4.5 text-olive"/></div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl text-ink">{s.name}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.note}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {s.name!=="Brasil"&&<a href={mapSearch(s.name)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-olive">Ver no mapa <ExternalLink className="h-3 w-3"/></a>}
            {i<stops.length-1&&s.name!=="Brasil"&&stops[i+1].name!=="Brasil"&&<a href={mapRoute(s.name,stops[i+1].name)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 text-xs text-olive/80">Como chegar ao próximo destino <ArrowRight className="h-3 w-3"/></a>}
          </div>
        </div>
        {i<stops.length-1&&<ArrowRight className="h-4 w-4 text-gold shrink-0"/>}
      </div>)}
    </div>
  </div>
);

export const RouteMap=()=> (
  <section id="mapa" className="bg-gradient-warm border-y border-border/60">
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Sentido da rota</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink">Se inverter a ordem, a Europa também precisa inverter.</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">Esse era um dos problemas do plano anterior: não adianta colocar “Europa primeiro” e manter o roteiro terminando em Milão para depois voltar até Liverpool. A rota precisa acompanhar a ordem escolhida.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Route title="Europa → Liverpool" badge="Tendência atual" stops={europeFirst}/>
        <Route title="Liverpool → Europa" badge="Plano alternativo" stops={courseFirst}/>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl border border-gold/30 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Se Europa vier primeiro:</strong> a lógica passa a ser entrar pelo lado italiano e avançar para oeste até Londres/Liverpool, evitando cruzar o continente duas vezes.</div>
        <div className="rounded-2xl border border-olive/25 bg-card/80 p-5 text-foreground/75 leading-relaxed"><strong className="text-ink">Se o curso vier primeiro:</strong> mantém-se a lógica anterior, saindo de Liverpool e seguindo de oeste para leste até Milão.</div>
      </div>
    </div>
  </section>
);