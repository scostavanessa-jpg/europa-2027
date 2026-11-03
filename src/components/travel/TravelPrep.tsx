import { BedDouble, ExternalLink, Luggage, ShieldCheck, Ticket, TrainFront } from "lucide-react";

const steps = [
  {
    icon: Ticket,
    when: "10–11 meses antes",
    title: "Eurostar",
    text: "Prioridade alta para Amsterdam → Londres e, se necessário, Bruxelas → Amsterdam. Hoje o Eurostar abre muitos trechos entre 10 e 11 meses antes; 2028 deve ser revalidado quando a venda abrir.",
    href: "https://www.eurostar.com/",
    action: "Acompanhar Eurostar",
  },
  {
    icon: BedDouble,
    when: "6–9 meses antes",
    title: "Hospedagens com cancelamento",
    text: "Reservar cedo Milão, Alpes, Amsterdam, Londres e principalmente Liverpool. Depois repricificar. Em Liverpool, distância da Kaplan vale mais do que economizar poucas libras por noite e gastar todo dia com transporte.",
  },
  {
    icon: TrainFront,
    when: "Quando abrir a malha 2028",
    title: "Itália + Suíça",
    text: "Milano Centrale → Tirano é direto e hoje leva cerca de 2h30. No Bernina, comparar o panorâmico com o regional: o regional percorre a mesma linha e costuma ser a solução de melhor custo-benefício.",
    href: "https://www.rhb.ch/en/panoramic-journeys/bernina-express/",
    action: "Ver Bernina / RhB",
  },
  {
    icon: TrainFront,
    when: "~12 semanas antes",
    title: "Londres → Liverpool",
    text: "Os bilhetes Advance da Avanti normalmente abrem perto de 12 semanas antes. É o trecho para comprar assim que aparecer tarifa boa, porque o trem direto leva pouco mais de duas horas.",
    href: "https://www.avantiwestcoast.co.uk/",
    action: "Acompanhar Avanti",
  },
  {
    icon: Luggage,
    when: "Na montagem da mala",
    title: "Mochila / mala cabine",
    text: "Esse roteiro tem estações, escadas, troca de plataforma e deslocamentos curtos. Mala grande vira taxa, cansaço e táxi. O objetivo é cada uma carregar tudo sem depender da outra.",
  },
  {
    icon: ShieldCheck,
    when: "Antes de fechar passes",
    title: "Não comprar Eurail no automático",
    text: "Vamos comparar bilhetes ponto a ponto com passe. Eurostar exige reserva e o trecho suíço tem regras próprias; em um roteiro curto, passe nem sempre ganha no preço.",
  },
];

export const TravelPrep = () => (
  <section id="preparacao" className="bg-gradient-warm border-y border-border/60">
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-8 md:mb-10 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Como preparar</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink">Comprar na ordem certa economiza mais que caçar promoção aleatória</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">Os horários e preços de 2028 ainda não estão abertos. Por isso o site separa o que já dá para planejar do que só deve ser comprado quando a malha oficial sair.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s) => (
          <article key={s.title} className="rounded-3xl bg-card border border-border/60 p-5 sm:p-6 shadow-card">
            <div className="h-11 w-11 rounded-2xl bg-olive/10 grid place-items-center mb-4"><s.icon className="h-5 w-5 text-olive" /></div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{s.when}</p>
            <h3 className="font-display text-2xl text-ink">{s.title}</h3>
            <p className="text-sm text-foreground/75 mt-3 leading-relaxed">{s.text}</p>
            {s.href && <a href={s.href} target="_blank" rel="noreferrer" className="mt-4 min-h-10 inline-flex items-center gap-2 text-sm text-olive hover:underline"><ExternalLink className="h-4 w-4" />{s.action}</a>}
          </article>
        ))}
      </div>
    </div>
  </section>
);
