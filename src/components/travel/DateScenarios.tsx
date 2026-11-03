import { ArrowRightLeft, CalendarDays, GraduationCap, Plane, TriangleAlert } from "lucide-react";

const scenarios = [
  {
    title: "Europa primeiro · curso depois",
    badge: "Tendência atual",
    flight: "Sex · 17/03 à noite",
    tour: "18/03 → 26/03",
    course: "27/03 → 21/04",
    returnDate: "Fim de semana · 22–23/04",
    vacation: "Exemplo-base: 20/03 → 18/04",
    bank: "Banco provável: 19 e 20/04; 21/04 é Tiradentes",
    note: "É a ordem que vocês estão considerando agora. O ponto que precisa ser confirmado antes de fechar é o calendário da escola em torno da Páscoa de 2028, porque ele pode mexer nos dias efetivos de aula.",
    tone: "good",
  },
  {
    title: "Curso primeiro · Europa depois",
    badge: "Alternativa preservada",
    flight: "Sex · 10/03 à noite",
    tour: "08/04 → 16/04",
    course: "13/03 → 07/04",
    returnDate: "Dom · 16/04",
    vacation: "Exemplo-base: 13/03 → 11/04",
    bank: "Banco estimado: 12 e 13/04",
    note: "Continua sendo um encaixe forte porque concentra as quatro semanas de curso antes da Páscoa e deixa o roteiro europeu para o final. Fica salvo como plano B, não como decisão tomada.",
    tone: "mid",
  },
];

const toneClass = (tone: string) =>
  tone === "good"
    ? "border-olive/50 ring-1 ring-olive/15"
    : "border-gold/50";

export const DateScenarios = () => (
  <section id="datas" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
    <div className="mb-8 md:mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Ordem da viagem</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Duas possibilidades. Nenhuma decisão fingida.</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        A estrutura continua sendo 4 semanas de curso + aproximadamente 1 semana de Europa. O que muda é onde o passeio entra. Em vez de espalhar quatro cenários quase iguais, o site agora compara apenas as duas decisões que realmente importam.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
      {scenarios.map((s) => (
        <article key={s.title} className={`rounded-3xl bg-card border p-5 sm:p-6 shadow-card ${toneClass(s.tone)}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${s.tone === "good" ? "bg-olive/10 text-olive" : "bg-gold/15 text-olive"}`}>
                {s.badge}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-ink mt-3">{s.title}</h3>
            </div>
            <ArrowRightLeft className="h-6 w-6 text-olive shrink-0" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Embarque</strong><span className="text-muted-foreground">{s.flight}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><CalendarDays className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Europa</strong><span className="text-muted-foreground">{s.tour}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><GraduationCap className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Curso</strong><span className="text-muted-foreground">{s.course}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Volta</strong><span className="text-muted-foreground">{s.returnDate}</span></div>
          </div>

          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p><strong className="text-ink">Férias:</strong> <span className="text-foreground/75">{s.vacation}</span></p>
            <p><strong className="text-ink">Banco:</strong> <span className="text-foreground/75">{s.bank}</span></p>
            <p className="rounded-2xl bg-gold/10 border border-gold/25 p-3 text-foreground/80">{s.note}</p>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-5 rounded-2xl border border-olive/25 bg-card p-4 sm:p-5 text-sm text-foreground/75 leading-relaxed">
      <strong className="text-ink">O que decide de verdade:</strong> aprovação das férias, quantidade de banco necessária, disponibilidade da turma, calendário da escola, preço do aéreo multidestino e sentido mais eficiente do roteiro europeu. Até isso fechar, o site trabalha com as duas versões.
    </div>

    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-foreground/75 leading-relaxed">
      <TriangleAlert className="h-5 w-5 text-olive shrink-0 mt-0.5" />
      <p>As datas acima são cenários de planejamento, não reservas. Antes de comprar passagem ou curso, o calendário 2028 da escola e as férias precisam ser reconfirmados.</p>
    </div>
  </section>
);