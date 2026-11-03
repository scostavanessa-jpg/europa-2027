import { Building2, Camera, Dumbbell, GraduationCap, Hotel, MapPinned, Mountain, Music2, Train, Trees, Utensils, Wine } from "lucide-react";

type Stop={time:string;title:string;icon:any;tip?:string};
type Day={label:string;title:string;subtitle:string;stops:Stop[]};

const days:Day[]=[
  {
    label:"Sex · 10/03",
    title:"São Paulo → Europa",
    subtitle:"Saída à noite para usar o fim de semana como parte da viagem, sem começar as férias na sexta.",
    stops:[
      {time:"Noite",title:"Embarque em São Paulo",icon:Train,tip:"Prioridade: passagem multidestino/open jaw se o preço fizer sentido — entrar por Milão e voltar pelo Reino Unido."},
    ],
  },
  {
    label:"Sáb · 11/03",
    title:"Chegada em Milão + noite leve",
    subtitle:"Nada de pousar depois de um voo longo e tentar zerar a Itália no mesmo dia.",
    stops:[
      {time:"Chegada",title:"Aeroporto → hospedagem / deixar malas",icon:Hotel},
      {time:"Fim da tarde",title:"Duomo + Galleria Vittorio Emanuele II",icon:Building2,tip:"Se o voo atrasar, esse bloco migra para domingo sem quebrar o roteiro."},
      {time:"Noite",title:"Navigli para jantar",icon:Wine},
    ],
  },
  {
    label:"Dom · 12/03",
    title:"Milão clássico sem correria",
    subtitle:"Um dia inteiro para a cidade antes do trecho alpino.",
    stops:[
      {time:"Manhã",title:"Duomo por dentro + terraços",icon:Building2,tip:"Comprar horário antecipado quando a agenda 2028 abrir."},
      {time:"11:30",title:"Castello Sforzesco",icon:Building2},
      {time:"13:00",title:"Parco Sempione + almoço",icon:Trees},
      {time:"Tarde",title:"Brera / centro histórico",icon:Camera},
      {time:"Noite",title:"Aperitivo e preparar mochila do Bernina",icon:Utensils},
    ],
  },
  {
    label:"Seg · 13/03",
    title:"Milão → Tirano → Alpes",
    subtitle:"O deslocamento já é um dos principais passeios da viagem.",
    stops:[
      {time:"Cedo",title:"Milano Centrale → Tirano",icon:Train,tip:"Hoje o direto leva cerca de 2h30; confirmar grade 2028."},
      {time:"Meio-dia",title:"Tirano → Pontresina / St. Moritz pela Bernina Line",icon:Mountain,tip:"Comparar Bernina Express com trem regional pela mesma linha. Regional costuma ganhar no custo-benefício."},
      {time:"Trajeto",title:"Brusio · Alp Grüm · Ospizio Bernina · Lago Bianco",icon:Camera},
      {time:"Fim da tarde",title:"Lago e centrinho de St. Moritz",icon:Mountain},
      {time:"Noite",title:"Dormir em Pontresina, Samedan ou St. Moritz conforme preço",icon:Hotel},
    ],
  },
  {
    label:"Ter · 14/03",
    title:"St. Moritz → Strasbourg",
    subtitle:"Esse é o nosso desvio inteligente: mantém o roteiro ferroviário sem colocar Alemanha ou Paris como destino e ainda entrega uma cidade bonita de bônus.",
    stops:[
      {time:"Manhã",title:"Café + última volta no Engadin",icon:Mountain},
      {time:"Depois",title:"St. Moritz / Pontresina → Chur → Basel",icon:Train},
      {time:"Conexão",title:"Basel → Strasbourg",icon:Train,tip:"Os horários exatos de 2028 ainda não existem; deixar margem confortável entre conexões."},
      {time:"Noite",title:"Petite France + canais",icon:Camera},
      {time:"Jantar",title:"Centro histórico de Strasbourg",icon:Utensils},
    ],
  },
  {
    label:"Qua · 15/03",
    title:"Strasbourg → Bruxelas → Amsterdam",
    subtitle:"Bruxelas funciona melhor como parada longa do que como mais uma troca de hotel.",
    stops:[
      {time:"08:00",title:"Catedral de Strasbourg + Petite France",icon:Building2},
      {time:"Fim da manhã",title:"TGV Strasbourg → Bruxelas",icon:Train,tip:"A grade atual tem opção direta via norte da França; validar em 2028 para manter a rota sem Alemanha e sem passeio em Paris."},
      {time:"Tarde",title:"Grand-Place · Galeries Royales · Mont des Arts · Manneken Pis",icon:MapPinned},
      {time:"Fim do dia",title:"Bruxelas → Amsterdam",icon:Train,tip:"Eurostar faz hoje o trecho em cerca de 1h53."},
      {time:"Noite",title:"Primeira caminhada pelos canais",icon:Camera},
    ],
  },
  {
    label:"Qui · 16/03",
    title:"Amsterdam de verdade",
    subtitle:"Um dia inteiro sem mala na mão.",
    stops:[
      {time:"Manhã",title:"Jordaan + canais",icon:Camera},
      {time:"10:30",title:"Anne Frank House",icon:Building2,tip:"Ingresso é concorrido; este vira item de compra prioritária quando a agenda abrir."},
      {time:"Almoço",title:"Centro / 9 Straatjes",icon:Utensils},
      {time:"Tarde",title:"Museumplein + Vondelpark",icon:Trees},
      {time:"Opcional",title:"Zaanse Schans se vocês preferirem moinhos a museus",icon:Train,tip:"É um extra possível; não vale tentar encaixar tudo no mesmo dia."},
    ],
  },
  {
    label:"Sex · 17/03",
    title:"Amsterdam → Londres",
    subtitle:"Troca de país sem aeroporto: sair do centro e chegar no centro.",
    stops:[
      {time:"Manhã",title:"Último café / passeio curto em Amsterdam",icon:Camera},
      {time:"Depois",title:"Eurostar Amsterdam Centraal → London St Pancras",icon:Train,tip:"Hoje o retorno direto Amsterdam → Londres leva cerca de 4h09; comprar cedo quando abrir."},
      {time:"Fim da tarde",title:"King's Cross · St Pancras · Bloomsbury",icon:MapPinned},
      {time:"Noite",title:"Covent Garden / Soho",icon:Utensils},
    ],
  },
  {
    label:"Sáb · 18/03",
    title:"Londres essencial",
    subtitle:"Um dia compacto, mas com os clássicos realmente próximos entre si.",
    stops:[
      {time:"Manhã",title:"Westminster · Big Ben · St James's Park",icon:Building2},
      {time:"11:30",title:"Buckingham Palace",icon:Camera},
      {time:"Tarde",title:"Trafalgar Square · Covent Garden",icon:MapPinned},
      {time:"Fim da tarde",title:"Tower Bridge / margem do Tâmisa",icon:Camera},
      {time:"Noite",title:"Pub ou musical, conforme orçamento",icon:Music2},
    ],
  },
  {
    label:"Dom · 19/03",
    title:"Londres → Liverpool",
    subtitle:"Chegar um dia antes da Kaplan para reconhecer a cidade, mercado, escola e transporte.",
    stops:[
      {time:"Manhã",title:"London Euston → Liverpool Lime Street",icon:Train,tip:"Avanti faz hoje o direto em cerca de 2h21; tarifas Advance costumam abrir por volta de 12 semanas antes."},
      {time:"Tarde",title:"Check-in e mercado",icon:Hotel},
      {time:"Depois",title:"Caminhar até Cotton House / Kaplan",icon:GraduationCap},
      {time:"Noite",title:"Albert Dock + waterfront",icon:Camera},
    ],
  },
];

const liverpool = [
  {title:"Durante a semana",text:"Kaplan + rotina real da cidade. A escola fica em Cotton House, Old Hall Street; hospedagem próxima reduz gasto e tempo de transporte.",icon:GraduationCap},
  {title:"Liverpool obrigatório",text:"Royal Albert Dock, Beatles Story, Cavern Club, catedrais, waterfront, Anfield se houver interesse/jogo e Crosby Beach / Another Place.",icon:Music2},
  {title:"Bate-volta fácil",text:"Chester é o primeiro da lista: Merseyrail liga Liverpool à cidade e hoje o trajeto gira em torno de 39 minutos.",icon:Train},
  {title:"Outro fim de semana",text:"Manchester é fácil por trem e vale para música, futebol, Northern Quarter e museus — sem trocar hospedagem.",icon:Train},
  {title:"Se sobrar orçamento",text:"York ou Lake District entram como fim de semana maior. A regra é: só adicionar se não atrapalhar curso, descanso e orçamento.",icon:Mountain},
  {title:"Jiu-jitsu",text:"Separar 1–2 academias com drop-in e horários compatíveis com a Kaplan quando a grade 2028 estiver disponível.",icon:Dumbbell},
];

export const Itinerary=()=> (
  <section id="roteiro" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-5xl">
    <div className="mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Roteiro sugerido</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">9 dias de turismo sem desperdiçar cidade com check-in</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">Baseado no cenário recomendado de saída em 10/03 e início da Kaplan em 20/03. O roteiro mantém Itália, Bernina/St. Moritz, Amsterdam, Bruxelas, Londres e Liverpool; Strasbourg entra porque resolve a logística ferroviária sem Alemanha e vira um bônus de verdade.</p>
    </div>

    <div className="space-y-12 md:space-y-16">
      {days.map((day,di)=><article key={di}><header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="text-xs tracking-[0.25em] uppercase text-gold font-medium">{day.label}</span><h3 className="font-display text-3xl md:text-4xl text-ink">{day.title}</h3></header><p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">{day.subtitle}</p><ol className="relative border-l-2 border-olive/20 ml-3 space-y-4">{day.stops.map((s,i)=><li key={i} className="pl-7 sm:pl-8 relative"><span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-cream border-2 border-olive flex items-center justify-center"><s.icon className="h-3 w-3 text-olive"/></span><div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 shadow-card"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-mono text-sm font-semibold text-olive tabular-nums">{s.time}</span><span className="font-body text-base text-ink">{s.title}</span></div>{s.tip&&<p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">↳ {s.tip}</p>}</div></li>)}</ol></article>)}
    </div>

    <div className="mt-14 md:mt-20">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">4 semanas em Liverpool</p>
      <h3 className="font-display text-3xl md:text-4xl text-ink">Passear sem viver de mala pronta</h3>
      <p className="mt-3 text-muted-foreground max-w-2xl">A melhor parte de ter Liverpool como base é conhecer outros lugares nos fins de semana sem pagar novas hospedagens toda hora.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">{liverpool.map((x)=><div key={x.title} className="rounded-3xl bg-card border border-border/60 p-5 shadow-card"><x.icon className="h-5 w-5 text-olive mb-3"/><h4 className="font-display text-xl text-ink">{x.title}</h4><p className="text-sm text-foreground/75 mt-2 leading-relaxed">{x.text}</p></div>)}</div>
    </div>
  </section>
);