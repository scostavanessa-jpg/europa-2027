import { CalendarDays, CheckCircle2, GraduationCap, Plane, TriangleAlert } from "lucide-react";

const scenarios = [
  {
    title: "Cenário A · melhor equilíbrio",
    badge: "Recomendado",
    flight: "Sex · 10/03 à noite",
    tour: "11/03 → 19/03",
    course: "20/03 → 14/04",
    returnDate: "15 ou 16/04",
    vacation: "30 dias: 13/03 → 11/04",
    bank: "Banco estimado: 12 e 13/04",
    holidays: "Kaplan: 14/04 é Good Friday; 17/04 já fica fora do curso. Tiradentes e 1º de maio ficam preservados no Brasil.",
    tone: "good",
  },
  {
    title: "Cenário B · planejamento anterior",
    badge: "Boa alternativa",
    flight: "Sex · 17/03 à noite",
    tour: "18/03 → 26/03",
    course: "27/03 → 21/04",
    returnDate: "23/04",
    vacation: "30 dias: 20/03 → 18/04",
    bank: "Banco estimado: 19 e 20/04; 21/04 é Tiradentes no Brasil",
    holidays: "O curso atravessa Good Friday (14/04) e Easter Monday (17/04), quando a Kaplan pode estar fechada.",
    tone: "mid",
  },
  {
    title: "Cenário C · início em abril",
    badge: "Menos eficiente",
    flight: "Sex · 24/03 à noite",
    tour: "25/03 → 02/04",
    course: "03/04 → 28/04",
    returnDate: "30/04",
    vacation: "30 dias: 27/03 → 25/04",
    bank: "Banco estimado: 26, 27 e 28/04",
    holidays: "Good Friday e Easter Monday caem durante o curso; Tiradentes fica dentro das férias.",
    tone: "warn",
  },
  {
    title: "Cenário D · mais tarde",
    badge: "Evitar",
    flight: "Sex · 31/03 à noite",
    tour: "01/04 → 09/04",
    course: "10/04 → 05/05",
    returnDate: "07/05",
    vacation: "30 dias: 03/04 → 02/05",
    bank: "Banco estimado: 03, 04 e 05/05",
    holidays: "O curso pega 14/04, 17/04 e 01/05 no Reino Unido; Tiradentes e 1º de maio também ficam engolidos pelas férias no Brasil.",
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
        A comparação usa 4 semanas de Kaplan Liverpool + 9 dias de turismo antes das aulas, saída preferencial na sexta à noite e 30 dias corridos de férias. Banco de horas é uma projeção e depende da aprovação da empresa.
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
            <div className="rounded-2xl bg-secondary/50 p-4"><CalendarDays className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Passeio</strong><span className="text-muted-foreground">{s.tour}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><GraduationCap className="h-4 w-4 text-olive mb-2" /><strong className="block text-ink">Curso</strong><span className="text-muted-foreground">{s.course}</span></div>
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
      <strong className="text-ink">Ponto de validação:</strong> a Kaplan informa que cursos flexíveis começam às segundas; quando a segunda é feriado público, começam na terça. A escola fecha em feriados públicos e a política vigente informa que não há compensação das aulas desses dias. Antes de comprar, vamos validar o calendário 2028 diretamente com a Kaplan/agência.
    </div>
  </section>
);
