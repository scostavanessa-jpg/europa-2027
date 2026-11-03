import { CalendarDays, CheckCircle2, GraduationCap, Plane, TriangleAlert } from "lucide-react";

const scenarios = [
  {
    title: "Cenário A · curso primeiro",
    badge: "Melhor opção",
    flight: "Sex · 10/03 à noite",
    tour: "08/04 → 16/04",
    course: "13/03 → 07/04",
    returnDate: "Dom · 16/04",
    vacation: "30 dias: 13/03 → 11/04",
    bank: "Banco estimado: 12 e 13/04",
    holidays: "As 4 semanas de curso terminam antes da Páscoa britânica. Good Friday (14/04) vira parte do turismo, e Tiradentes + 1º de maio ficam preservados no Brasil.",
    tone: "good",
  },
  {
    title: "Cenário B · turismo primeiro",
    badge: "Boa alternativa",
    flight: "Sex · 10/03 à noite",
    tour: "11/03 → 19/03",
    course: "20/03 → 14/04",
    returnDate: "15 ou 16/04",
    vacation: "30 dias: 13/03 → 11/04",
    bank: "Banco estimado: 12 e 13/04",
    holidays: "Funciona bem na CLT, mas Good Friday (14/04) cai no último dia do curso e a Kaplan informa que não compensa aula de feriado público.",
    tone: "mid",
  },
  {
    title: "Cenário C · saída 17/03",
    badge: "Ainda viável",
    flight: "Sex · 17/03 à noite",
    tour: "15/04 → 23/04",
    course: "20/03 → 14/04",
    returnDate: "Dom · 23/04",
    vacation: "30 dias: 20/03 → 18/04",
    bank: "Banco estimado: 19 e 20/04; 21/04 é Tiradentes",
    holidays: "Também perde a aula de Good Friday. Em compensação, Tiradentes ajuda a fechar o bloco de turismo sem consumir mais férias.",
    tone: "mid",
  },
  {
    title: "Cenário D · saída 24/03",
    badge: "Menos eficiente",
    flight: "Sex · 24/03 à noite",
    tour: "22/04 → 30/04",
    course: "27/03 → 21/04",
    returnDate: "Dom · 30/04",
    vacation: "30 dias: 27/03 → 25/04",
    bank: "Banco estimado: 26, 27 e 28/04",
    holidays: "Good Friday (14/04) e Easter Monday (17/04) caem dentro do curso. Exige mais banco e entrega menos dias efetivos de aula.",
    tone: "warn",
  },
];

const toneClass = (tone: string) =>
  tone === "good"
    ? "border-olive/50 ring-1 ring-olive/15"
    : tone === "mid"
      ? "border-gold/50"
      : "border-border/70";

export const DateScenarios = () => (
  <section id="datas" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
    <div className="mb-8 md:mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Quando ir</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Datas que trabalham a favor da viagem</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        A comparação usa 4 semanas de Kaplan Liverpool + aproximadamente 1 semana de mochilão, saída preferencial na sexta à noite e 30 dias corridos de férias. O cenário recomendado coloca o curso primeiro para não perder aula com os feriados britânicos de Páscoa.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
      {scenarios.map((s) => (
        <article key={s.title} className={`rounded-3xl bg-card border p-5 sm:p-6 shadow-card ${toneClass(s.tone)}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${s.tone === "good" ? "bg-olive/10 text-olive" : s.tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-olive"}`}>
                {s.badge}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-ink mt-3">{s.title}</h3>
            </div>
            {s.tone === "good" ? <CheckCircle2 className="h-6 w-6 text-olive shrink-0" /> : s.tone === "warn" ? <TriangleAlert className="h-6 w-6 text-gold shrink-0" /> : <CalendarDays className="h-6 w-6 text-olive shrink-0" />}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Embarque</strong><span className="text-muted-foreground">{s.flight}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><GraduationCap className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Curso</strong><span className="text-muted-foreground">{s.course}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><CalendarDays className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Mochilão</strong><span className="text-muted-foreground">{s.tour}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Volta</strong><span className="text-muted-foreground">{s.returnDate}</span></div>
          </div>

          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p><strong className="text-ink">Férias:</strong> <span className="text-foreground/75">{s.vacation}</span></p>
            <p><strong className="text-ink">Banco:</strong> <span className="text-foreground/75">{s.bank}</span></p>
            <p className="rounded-2xl bg-gold/10 border border-gold/25 p-3 text-foreground/80">{s.holidays}</p>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-5 rounded-2xl border border-gold/30 bg-card p-4 sm:p-5 text-sm text-foreground/75 leading-relaxed">
      <strong className="text-ink">Ponto de validação:</strong> a Kaplan informa atualmente que cursos flexíveis começam às segundas (ou terça quando a segunda é feriado), fecha em feriados públicos e não compensa essas aulas. Antes de emitir passagem ou fechar a turma, vamos reconfirmar o calendário 2028 com a Kaplan/agência e a aprovação das férias/banco com a empresa.
    </div>
  </section>
);
