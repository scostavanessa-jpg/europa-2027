const cards=[
{label:"Viajantes",value:"Vanessa · Camila · Danielle",note:"Cada uma terá conta própria"},
{label:"Grande objetivo",value:"30 dias em Liverpool",note:"Intercâmbio é a âncora do planejamento"},
{label:"Rota",value:"Pode mudar",note:"Antes de confirmar, comparar custo real e tempo"},
{label:"Prioridades pessoais",value:"Imperdível · desejável · opcional",note:"O otimizador respeita o que importa para cada uma"},
{label:"Despesas compartilhadas",value:"Rateio",note:"Quem pagou, quem participa e quem deve a quem"},
{label:"Decisão de compra",value:"Sem impulso",note:"Alertas e metas ajudam a decidir o momento"},
];
export const GroupAgreements=()=> <section id="combinados" className="container mx-auto px-6 py-16 md:py-24 max-w-6xl"><div className="mb-10 max-w-2xl"><p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Tudo alinhado</p><h2 className="font-display text-4xl md:text-5xl text-ink">Combinados do grupo</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{cards.map(c=><div key={c.label} className="rounded-3xl bg-gradient-warm border border-gold/30 p-7 shadow-card"><p className="text-xs uppercase tracking-wider text-olive mb-3">{c.label}</p><p className="font-display text-2xl md:text-3xl text-ink leading-snug">{c.value}</p><p className="text-sm text-muted-foreground mt-3">{c.note}</p></div>)}</div></section>;