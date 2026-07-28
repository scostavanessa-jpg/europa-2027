import { Link } from "react-router-dom";

const cards=[
{label:"Viajantes",value:"Vanessa · Camila · Danielle",note:"Cada uma com conta própria",to:"/grupo"},
{label:"Grande objetivo",value:"30 dias em Liverpool",note:"Intercâmbio é a âncora do planejamento",to:"/#roteiro"},
{label:"Rota",value:"Pode mudar",note:"Comparar custo real e tempo antes de confirmar",to:"/#mapa"},
{label:"Prioridades pessoais",value:"Imperdível · desejável · opcional",note:"Registre o que o otimizador deve preservar",to:"/minha-viagem"},
{label:"Despesas compartilhadas",value:"Rateio",note:"Quem pagou, quem participa e quem deve a quem",to:"/rateio"},
{label:"Decisão de compra",value:"Sem impulso",note:"Radar, alertas e metas ajudam a decidir o momento",to:"/ofertas"},
];
export const GroupAgreements=()=> <section id="combinados" className="container mx-auto px-6 py-16 md:py-24 max-w-6xl"><div className="mb-10 max-w-2xl"><p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Tudo alinhado</p><h2 className="font-display text-4xl md:text-5xl text-ink">Combinados do grupo</h2><p className="mt-3 text-sm text-muted-foreground">Os cards abaixo agora levam às áreas funcionais do planejamento.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{cards.map(c=><Link to={c.to} key={c.label} className="rounded-3xl bg-gradient-warm border border-gold/30 p-7 shadow-card hover:shadow-soft hover:border-gold/60 transition-all"><p className="text-xs uppercase tracking-wider text-olive mb-3">{c.label}</p><p className="font-display text-2xl md:text-3xl text-ink leading-snug">{c.value}</p><p className="text-sm text-muted-foreground mt-3">{c.note}</p><p className="text-xs text-olive mt-5">Abrir →</p></Link>)}</div></section>;