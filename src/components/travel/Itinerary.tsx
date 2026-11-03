import { Building2, Camera, Dumbbell, GraduationCap, Hotel, MapPinned, Mountain, Music2, Plane, Train, Trees, Utensils, Wine } from "lucide-react";

type Stop={time:string;title:string;icon:any;tip?:string};
type Day={label:string;title:string;subtitle:string;stops:Stop[]};

const days:Day[]=[
  {
    label:"Sex · 10/03",
    title:"São Paulo → Reino Unido",
    subtitle:"A viagem começa depois do trabalho: o fim de semana serve para chegar, regular o corpo e estar em Liverpool antes da segunda-feira.",
    stops:[
      {time:"Noite",title:"Embarque em São Paulo",icon:Plane,tip:"Comparar chegada por Londres e Manchester. A passagem multidestino faz sentido se o retorno for Milão → São Paulo."},
    ],
  },
  {
    label:"Sáb–Dom · 11–12/03",
    title:"Chegada e instalação em Liverpool",
    subtitle:"Nada de começar a Kaplan com mala aberta e jet lag no talo.",
    stops:[
      {time:"Chegada",title:"Aeroporto → Liverpool",icon:Train,tip:"Se chegar por Londres, usar Euston → Liverpool Lime Street; se Manchester estiver muito mais barato, comparar custo total aeroporto + trem."},
      {time:"Tarde",title:"Check-in + mercado + chip/eSIM + reconhecer o bairro",icon:Hotel},
      {time:"Domingo",title:"Caminhar até a Kaplan em Cotton House / Old Hall Street",icon:GraduationCap},
      {time:"Fim do dia",title:"Royal Albert Dock + waterfront",icon:Camera},
    ],
  },
  {
    label:"13/03 → 07/04",
    title:"4 semanas de Kaplan Liverpool",
    subtitle:"O curso vem primeiro. Esse encaixe termina antes dos feriados britânicos de Páscoa e deixa o mochilão como grande final.",
    stops:[
      {time:"Seg–Sex",title:"Aulas na Kaplan",icon:GraduationCap},
      {time:"Livre",title:"Beatles, Cavern Club, Albert Dock, catedrais e waterfront",icon:Music2},
      {time:"Treinos",title:"Jiu-jitsu — selecionar academia com drop-in e horários compatíveis",icon:Dumbbell},
      {time:"Bate-volta",title:"Chester — fácil e barato por Merseyrail",icon:Train},
      {time:"Outro sábado",title:"Manchester — música, futebol, Northern Quarter e museus",icon:Train},
      {time:"Opcional",title:"York, Lake District ou norte do País de Gales",icon:Mountain,tip:"Só entra se orçamento e energia permitirem. A base continua Liverpool; nada de trocar hotel por esporte."},
    ],
  },
  {
    label:"Sáb · 08/04",
    title:"Liverpool → Londres",
    subtitle:"Fim do curso, começo do mochilão. A ordem agora segue de oeste para leste até Milão.",
    stops:[
      {time:"Manhã",title:"Liverpool Lime Street → London Euston",icon:Train,tip:"Avanti faz hoje o direto em pouco mais de duas horas; comprar Advance quando a janela 2028 abrir."},
      {time:"Tarde",title:"Westminster · Big Ben · St James's Park · Buckingham Palace",icon:Building2},
      {time:"Noite",title:"Covent Garden / Soho",icon:Utensils},
    ],
  },
  {
    label:"Dom · 09/04",
    title:"Londres essencial",
    subtitle:"Um dia inteiro sem mudar de hotel.",
    stops:[
      {time:"Manhã",title:"Tower Bridge + margem do Tâmisa",icon:Camera},
      {time:"Depois",title:"Trafalgar Square + centro",icon:MapPinned},
      {time:"Tarde",title:"Museu gratuito ou Camden, conforme o estilo do trio",icon:Building2},
      {time:"Noite",title:"Pub ou musical se couber no orçamento",icon:Music2},
    ],
  },
  {
    label:"Seg · 10/04",
    title:"Londres → Amsterdam",
    subtitle:"Eurostar elimina aeroporto e entrega vocês no centro da cidade.",
    stops:[
      {time:"Manhã",title:"London St Pancras → Amsterdam Centraal",icon:Train,tip:"Os horários 2028 ainda não estão abertos; hoje o trecho direto fica na casa de quatro horas."},
      {time:"Tarde",title:"Jordaan + 9 Straatjes + canais",icon:Camera},
      {time:"Noite",title:"Caminhada pelo centro",icon:Wine},
    ],
  },
  {
    label:"Ter · 11/04",
    title:"Amsterdam de verdade",
    subtitle:"Um dia inteiro para a cidade, sem sacrificar tudo por um bate-volta.",
    stops:[
      {time:"Manhã",title:"Anne Frank House",icon:Building2,tip:"Ingresso concorrido: vira prioridade quando o calendário 2028 abrir."},
      {time:"Depois",title:"Museumplein + Vondelpark",icon:Trees},
      {time:"Opcional",title:"Zaanse Schans se moinhos forem prioridade",icon:Train,tip:"Escolher isso OU mais tempo em Amsterdam; não tentar fazer os dois no modo Fórmula 1."},
    ],
  },
  {
    label:"Qua · 12/04",
    title:"Amsterdam → Bruxelas → Strasbourg",
    subtitle:"Bruxelas vira um stopover inteligente: conhece o centro sem pagar outra diária.",
    stops:[
      {time:"Cedo",title:"Amsterdam Centraal → Bruxelles-Midi",icon:Train},
      {time:"Meio do dia",title:"Grand-Place · Galeries Royales · Mont des Arts · Manneken Pis",icon:MapPinned},
      {time:"Tarde",title:"Bruxelas → Strasbourg",icon:Train,tip:"A grade atual permite montar esse eixo sem transformar Alemanha ou Paris em destino; reconfirmar a malha 2028."},
      {time:"Noite",title:"Petite France + canais de Strasbourg",icon:Camera},
    ],
  },
  {
    label:"Qui · 13/04",
    title:"Strasbourg → Alpes suíços",
    subtitle:"O trecho longo do mochilão termina com uma recompensa bem séria: Engadin.",
    stops:[
      {time:"Manhã",title:"Catedral de Strasbourg + centro histórico",icon:Building2},
      {time:"Depois",title:"Strasbourg → Basel → Chur → Pontresina / St. Moritz",icon:Train,tip:"Deixar margem nas conexões; horários exatos de 2028 ainda não existem."},
      {time:"Fim da tarde",title:"Lago / centrinho / Engadin",icon:Mountain},
      {time:"Noite",title:"Dormir em Pontresina, Samedan ou St. Moritz conforme preço",icon:Hotel},
    ],
  },
  {
    label:"Sex · 14/04",
    title:"Bernina Line → Tirano → Milão",
    subtitle:"Sexta-feira Santa vira passeio, não aula perdida. O deslocamento é uma das experiências principais da viagem.",
    stops:[
      {time:"Manhã",title:"Pontresina / St. Moritz → Bernina Line",icon:Train,tip:"Comparar Bernina Express com trem regional pela mesma linha. O regional costuma ser a escolha mais racional para mochilão."},
      {time:"Trajeto",title:"Ospizio Bernina · Lago Bianco · Alp Grüm · Brusio",icon:Mountain},
      {time:"Depois",title:"Tirano → Milano Centrale",icon:Train},
      {time:"Noite",title:"Navigli + jantar",icon:Wine,tip:"Feriado pode alterar horários de trem e comércio; confirmar a operação específica de 14/04/2028."},
    ],
  },
  {
    label:"Sáb · 15/04",
    title:"Milão clássico",
    subtitle:"O último dia inteiro é urbano e fácil de fazer a pé/metrô.",
    stops:[
      {time:"Manhã",title:"Duomo + terraços",icon:Building2},
      {time:"11:30",title:"Galleria Vittorio Emanuele II",icon:Camera},
      {time:"Tarde",title:"Castello Sforzesco + Parco Sempione + Brera",icon:Trees},
      {time:"Noite",title:"Aperitivo de despedida",icon:Utensils},
    ],
  },
  {
    label:"Dom · 16/04",
    title:"Milão → São Paulo",
    subtitle:"Volta com folga enorme antes de 13/05 e sem desperdiçar Tiradentes nem 1º de maio dentro das férias.",
    stops:[
      {time:"Conforme voo",title:"Aeroporto de Milão → Brasil",icon:Plane,tip:"Na emissão, comparar MXP e eventuais tarifas open jaw com chegada por Londres/Manchester."},
    ],
  },
];

export const Itinerary=()=> (
  <section id="roteiro" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-5xl">
    <div className="mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Roteiro recomendado</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Curso primeiro. Europa depois.</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">A ordem ficou mais inteligente: chegar em Liverpool no fim de semana, concluir as 4 semanas de Kaplan sem feriado no meio e então atravessar Londres, Amsterdam, Bruxelas, Strasbourg, Alpes e Milão até o voo de volta.</p>
    </div>

    <div className="space-y-12 md:space-y-16">
      {days.map((day,di)=><article key={di}><header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="text-xs tracking-[0.25em] uppercase text-gold font-medium">{day.label}</span><h3 className="font-display text-3xl md:text-4xl text-ink">{day.title}</h3></header><p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">{day.subtitle}</p><ol className="relative border-l-2 border-olive/20 ml-3 space-y-4">{day.stops.map((s,i)=><li key={i} className="pl-7 sm:pl-8 relative"><span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-cream border-2 border-olive flex items-center justify-center"><s.icon className="h-3 w-3 text-olive"/></span><div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 shadow-card"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-mono text-sm font-semibold text-olive tabular-nums">{s.time}</span><span className="font-body text-base text-ink">{s.title}</span></div>{s.tip&&<p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">↳ {s.tip}</p>}</div></li>)}</ol></article>)}
    </div>
  </section>
);