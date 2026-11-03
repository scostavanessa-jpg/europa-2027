import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert, Compass, Heart, LockKeyhole, TrainFront } from "lucide-react";

type Phase="Existe, validar"|"Parcial"|"Pendente";
type Item={title:string;phase:Phase;detail:string};
const matrix:Item[]=[
 {title:"Identidade da viagem",phase:"Existe, validar",detail:"Vanessa, Camila e Danielle · quatro semanas de curso em Liverpool + cerca de uma semana pela Europa · 2028."},
 {title:"Calendário e férias CLT",phase:"Parcial",detail:"Datas comparativas, início semanal às segundas, 30 dias corridos de férias e eventual banco de horas; não considerar férias aprovadas sem confirmação."},
 {title:"Ordem do passeio e do curso",phase:"Existe, validar",detail:"Europa antes da escola é uma tendência, não decisão. Manter o cenário inverso visível."},
 {title:"Roteiro ferroviário e Bernina",phase:"Parcial",detail:"Milão, Tirano, Alpes suíços, Strasbourg, Bruxelas, Amsterdam, Londres e Liverpool são ideias sujeitas ao tempo disponível, logística e preços."},
 {title:"Acesso exclusivo das três",phase:"Parcial",detail:"Sem chave compartilhada; perfis individuais e aprovação pela organizadora. Login real no celular ainda requer teste das três."},
 {title:"Cofrinho e metas individuais",phase:"Existe, validar",detail:"Metas e depósitos por viajante, guardados na nuvem; revisar cálculos e permissões com dados reais."},
 {title:"Gastos pessoais e Rateio",phase:"Existe, validar",detail:"Lançamentos pessoais começam privados. Só vão ao Rateio após escolha explícita; divisões por pessoas, valores ou porcentagem e registro dos acertos."},
 {title:"Passagens, preços e cupons",phase:"Existe, validar",detail:"Comparação das duas ordens, registro compartilhado de tarifas reais e lista de cupons; alertas automáticos de preço ainda não estão rodando."},
 {title:"Mapas, hospedagens e decisões",phase:"Parcial",detail:"Cidades e hospedagens editáveis; faltam mapas dinâmicos completos, reservas anexadas e um histórico claro das decisões."},
 {title:"Alertas de câmbio, clima e notícias",phase:"Parcial",detail:"Preferências e informações de apoio existem; notificações automáticas e dados atualizados ainda precisam de conectores verificados."},
 {title:"Contadores, checklist e fuso horário",phase:"Existe, validar",detail:"Informações e checklist disponíveis, mas precisam acompanhar as datas finais e passar por testes em aparelhos diferentes."},
 {title:"WhatsApp, chat e lembretes",phase:"Pendente",detail:"Integração e disparos automáticos dependem de autorização e infraestrutura; nenhum aviso é prometido sem configuração ativa."},
 {title:"Compras críticas e estratégia",phase:"Parcial",detail:"Monitorar voos, Eurostar, hospedagens e trem Bernina; comparar preço total com bagagem e deslocamentos, não apenas tarifa."},
 {title:"Controle de pagamentos à agência",phase:"Pendente",detail:"Trazer o cronograma e comprovantes ao painel apenas depois de conferir o histórico; valores não devem ser estimados como pagamentos efetivos."},
 {title:"Imagem original do trem",phase:"Parcial",detail:"Há um desenho restaurado como marca-d'água. A imagem histórica apreciada ainda não foi recuperada em um arquivo utilizável."},
];
const phaseColor:Record<Phase,string>={
 "Existe, validar":"text-[#4b6851]",
 "Parcial":"text-[#987848]",
 "Pendente":"text-[#9b6d66]"
};
const references=[
 {name:"Wanderlog",use:"Planejamento colaborativo, mapas e reservas",url:"https://wanderlog.com/"},
 {name:"Splitwise",use:"Rateio, histórico e acertos",url:"https://www.splitwise.com/"},
 {name:"Tricount",use:"Despesas coletivas multimoeda e modo offline",url:"https://www.tricount.com/features"},
 {name:"TravelSpend",use:"Orçamento de viagem por categoria e país",url:"https://travel-spend.com/"},
 {name:"TripIt",use:"Organização de confirmações e documentos",url:"https://www.tripit.com/"},
 {name:"Google Flights",use:"Alertas externos de tarifas reais",url:"https://www.google.com/travel/flights/saves"},
 {name:"Wise",use:"Avisos de cotação de moedas",url:"https://wise.com/br/tools/exchange-rate-alerts"}
];
export default function Projeto(){
 return <div className="min-h-screen bg-[#f8f6f1] text-[#30362b] pb-20">
  <header className="relative overflow-hidden bg-[#f1f1e7] border-b border-[#e5e6d9]">
   <img src="/hero-train.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-[.23] pointer-events-none"/>
   <div className="absolute inset-0 bg-[#f4f3ec]/75"/>
   <div className="relative mx-auto max-w-5xl px-5 sm:px-7 pt-7 pb-12">
    <Link to="/" className="inline-flex items-center gap-2 min-h-11 text-sm text-olive"><ArrowLeft className="h-4 w-4"/>Voltar ao painel</Link>
    <p className="mt-6 text-xs uppercase tracking-[.24em] text-olive/80">A nossa bússola · 03/11/2026</p>
    <h1 className="font-display text-[clamp(3.2rem,8vw,5.6rem)] mt-3 leading-[.95]">A essência<br/><span className="italic text-olive font-light">da nossa viagem</span></h1>
    <p className="mt-5 max-w-2xl leading-relaxed text-sm text-[#6d7667]">Uma memória viva dos pedidos originais e das decisões seguintes. Cada mudança deve melhorar o projeto sem apagar o que já foi combinado.</p>
   </div>
  </header>
  <main className="mx-auto max-w-5xl px-4 sm:px-7 py-8 sm:py-12 space-y-7">
   <section className="rounded-[26px] bg-white border border-[#eae6db] p-5 sm:p-7 shadow-card">
    <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-olive"/><h2 className="font-display text-3xl">Nosso compromisso</h2></div>
    <p className="text-sm leading-relaxed text-[#70766c] mt-3">
     Não é só turismo: são três amigas organizando um intercâmbio de 4 semanas em Liverpool e aproximadamente 1 semana pela Europa. A viagem deve ser prática, colaborativa, bonita, acessível no celular e financeiramente transparente — respeitando decisões individuais e coletivas.
    </p>
    <div className="grid sm:grid-cols-3 gap-3 mt-5">
     <div className="rounded-2xl p-4 bg-[#f2f2e9]"><LockKeyhole className="h-5 w-5 text-olive"/><h3 className="font-semibold text-sm mt-2">Cada uma tem seu espaço</h3><p className="text-xs text-[#7c8476] mt-1">Gastos e metas pessoais não são coletivos.</p></div>
     <div className="rounded-2xl p-4 bg-[#f2f2e9]"><Compass className="h-5 w-5 text-olive"/><h3 className="font-semibold text-sm mt-2">Decidir juntas</h3><p className="text-xs text-[#7c8476] mt-1">Sem impor a ordem da rota antes de escolher.</p></div>
     <div className="rounded-2xl p-4 bg-[#f2f2e9]"><TrainFront className="h-5 w-5 text-olive"/><h3 className="font-semibold text-sm mt-2">Guardar a identidade</h3><p className="text-xs text-[#7c8476] mt-1">Trem, Europa, memória afetiva e leveza visual.</p></div>
    </div>
   </section>
   <section className="rounded-[26px] bg-white border border-[#eae6db] p-5 sm:p-7 shadow-card">
    <div className="flex justify-between gap-3 items-end flex-wrap"><div><p className="text-xs uppercase tracking-widest text-olive/75">Inventário de funcionalidades</p><h2 className="font-display text-3xl sm:text-4xl mt-2">Pedido por pedido</h2></div><p className="text-[11px] text-muted-foreground">Status técnico ≠ teste de uso concluído</p></div>
    <div className="divide-y divide-[#f0ede4] mt-5">
     {matrix.map(x=><article key={x.title} className="py-4 flex items-start gap-4">
      {x.phase==="Existe, validar"?<CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#66816b]"/>:<CircleAlert className="h-5 w-5 shrink-0 mt-0.5 text-[#a58c6c]"/>}
      <div className="flex-1 min-w-0"><div className="flex flex-wrap gap-x-3 gap-y-1 justify-between items-baseline"><h3 className="font-semibold text-sm">{x.title}</h3><span className={"text-[11px] font-medium "+phaseColor[x.phase]}>{x.phase}</span></div>
      <p className="text-xs sm:text-sm text-[#7b8076] leading-relaxed mt-1.5">{x.detail}</p></div>
     </article>)}
    </div>
   </section>
   <section className="rounded-[26px] bg-[#eff1e8] border border-[#e2e6d9] p-5 sm:p-7">
    <p className="text-xs uppercase tracking-[.2em] text-olive/75">O que não podemos esquecer</p>
    <h2 className="font-display text-3xl mt-2">Regras para qualquer atualização</h2>
    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#636e5f] list-disc pl-5">
     <li>Preservar os dados já registrados e as três identidades, sem usar e-mails de referência não confirmados.</li>
     <li>Nunca converter automaticamente despesa pessoal em despesa coletiva.</li>
     <li>Nunca confundir cenários com reservas, preços estimados com preços pesquisados, ou preferência de alerta com automação ativa.</li>
     <li>Validar acesso, gravação no banco e experiência no celular antes de declarar uma função concluída.</li>
     <li>A viagem é em 2028; datas e preços definidos em 2027 são históricos e devem ser reavaliados.</li>
    </ul>
   </section>
   <section className="rounded-[26px] bg-white border border-[#eae6db] p-5 sm:p-7 shadow-card">
    <p className="text-xs uppercase tracking-[.2em] text-olive/75">Pesquisa de mercado</p>
    <h2 className="font-display text-3xl sm:text-4xl mt-2">Boas ideias, sem perder nossa cara</h2>
    <p className="text-sm text-[#788074] mt-2">Referências oficiais para melhorar nosso portal. São links externos; não representam integrações ativadas.</p>
    <div className="grid sm:grid-cols-2 gap-3 mt-5">{references.map(r=><a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="flex justify-between items-start gap-3 rounded-2xl border border-[#e9e9df] p-4 hover:border-olive/30 transition-colors">
     <div><h3 className="font-semibold text-sm">{r.name}</h3><p className="mt-1 text-xs text-[#7c8478]">{r.use}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-olive"/>
    </a>)}</div>
   </section>
  </main>
 </div>;
}
