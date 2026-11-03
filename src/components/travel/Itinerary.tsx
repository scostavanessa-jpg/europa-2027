import { Building2, Camera, Dumbbell, GraduationCap, Hotel, MapPinned, Mountain, Music2, Plane, Train, Trees, Utensils, Wine } from "lucide-react";

type Stop={time:string;title:string;icon:any;tip?:string};
type Block={label:string;title:string;subtitle:string;stops:Stop[]};

const blocks:Block[]=[
  {
    label:"Bloco 1 · aproximadamente 1 semana",
    title:"Europa — roteiro móvel",
    subtitle:"As cidades continuam no radar, mas a ordem depende de quando esse bloco entrar. Se o passeio vier primeiro, a rota deve correr de Milão em direção ao Reino Unido. Se vier depois, faz o sentido inverso.",
    stops:[
      {time:"Entrada/saída",title:"Comparar aéreo multidestino entre Brasil, Reino Unido e Milão",icon:Plane,tip:"A passagem não deve ser fechada antes da ordem da viagem porque ela muda completamente a lógica do bilhete."},
      {time:"Itália",title:"Milão + Tirano",icon:Building2},
      {time:"Alpes",title:"Bernina Line + Pontresina / St. Moritz / Samedan",icon:Mountain,tip:"Comparar Bernina Express e trem regional quando a grade 2028 abrir."},
      {time:"França",title:"Strasbourg",icon:MapPinned,tip:"Permanece no plano apenas se a conexão continuar eficiente."},
      {time:"Bélgica",title:"Bruxelas ou Bruges",icon:Train,tip:"Escolher uma das duas; não precisamos transformar o mochilão numa gincana de estação."},
      {time:"Holanda",title:"Amsterdam",icon:Camera},
      {time:"Reino Unido",title:"Londres",icon:Building2},
    ],
  },
  {
    label:"Bloco 2 · 4 semanas",
    title:"Liverpool — curso e vida real",
    subtitle:"Esse bloco é o coração da viagem e continua estável independentemente da ordem. A data exata será escolhida depois de cruzar turma, férias, feriados e o sentido do roteiro europeu.",
    stops:[
      {time:"Seg–Sex",title:"Aulas na Kaplan Liverpool",icon:GraduationCap},
      {time:"Livre",title:"Beatles, Cavern Club, Albert Dock, catedrais e waterfront",icon:Music2},
      {time:"Treinos",title:"Jiu-jitsu — selecionar academia com drop-in e horários compatíveis",icon:Dumbbell},
      {time:"Fim de semana",title:"Chester e Manchester como bate-voltas naturais",icon:Train},
      {time:"Opcional",title:"York, Lake District ou norte do País de Gales",icon:Trees,tip:"Só entra se orçamento e energia permitirem; Liverpool continua sendo a base."},
      {time:"Hospedagem",title:"Uma base fixa durante as 4 semanas",icon:Hotel},
    ],
  },
  {
    label:"Fechamento",
    title:"Volta ao Brasil sem aperto",
    subtitle:"A regra continua simples: a viagem precisa terminar com bastante margem antes de 13/05/2028. O ponto de retorno muda conforme a ordem escolhida.",
    stops:[
      {time:"Europa primeiro",title:"terminar o passeio em Londres/Liverpool e fazer o curso antes da volta",icon:Plane},
      {time:"Curso primeiro",title:"terminar o passeio em Milão e voltar de lá",icon:Plane},
      {time:"Sempre",title:"comparar custo total, tempo de deslocamento e quantidade de banco necessária",icon:Utensils},
      {time:"Depois",title:"fechar os detalhes de cada dia só quando a ordem estiver decidida",icon:Wine},
    ],
  },
];

export const Itinerary=()=> (
  <section id="roteiro" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-5xl">
    <div className="mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Roteiro em construção</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Primeiro decidimos a ordem. Depois fechamos os dias.</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">O site anterior estava detalhando datas como se a decisão já estivesse tomada. Agora o roteiro trabalha por blocos, o que evita refazer tudo toda vez que vocês mudarem o sentido da viagem.</p>
    </div>

    <div className="space-y-12 md:space-y-16">
      {blocks.map((block,di)=><article key={di}><header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="text-xs tracking-[0.25em] uppercase text-gold font-medium">{block.label}</span><h3 className="font-display text-3xl md:text-4xl text-ink">{block.title}</h3></header><p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">{block.subtitle}</p><ol className="relative border-l-2 border-olive/20 ml-3 space-y-4">{block.stops.map((s,i)=><li key={i} className="pl-7 sm:pl-8 relative"><span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-cream border-2 border-olive flex items-center justify-center"><s.icon className="h-3 w-3 text-olive"/></span><div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 shadow-card"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-mono text-sm font-semibold text-olive tabular-nums">{s.time}</span><span className="font-body text-base text-ink">{s.title}</span></div>{s.tip&&<p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">↳ {s.tip}</p>}</div></li>)}</ol></article>)}
    </div>
  </section>
);