import { ArrowRightLeft, CalendarDays, GraduationCap, Plane, TriangleAlert } from "lucide-react";
import { buildTripSchedule, defaultTripWindow, formatTripShort, type TripOrder } from "@/lib/tripSchedule2028";

const scenarios = [
  { order: "tour-first" as TripOrder, title: "Europa primeiro · curso depois", badge: "Tendência atual", tone: "good" },
  { order: "course-first" as TripOrder, title: "Curso primeiro · Europa depois", badge: "Mesmos voos, ordem invertida", tone: "mid" },
];
const toneClass = (tone: string) => tone === "good"
  ? "border-olive/50 ring-1 ring-olive/15"
  : "border-gold/50";

export const DateScenarios = () => (
  <section id="datas" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
    <div className="mb-8 md:mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Ordem da viagem</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Mesma viagem. Duas ordens possíveis.</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Uma semana aproximadamente passeando + quatro semanas consecutivas de inglês em Liverpool.
        Se mudarmos a ordem, <strong>não antecipamos o embarque nem o retorno</strong>: apenas trocamos qual bloco vem primeiro.
        O curso começa sempre na segunda-feira correspondente ao início da etapa de estudos.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
      {scenarios.map((s) => {
        const plan=buildTripSchedule(defaultTripWindow,s.order);
        return <article key={s.order} className={`rounded-3xl bg-card border p-5 sm:p-6 shadow-card ${toneClass(s.tone)}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${s.tone==="good"?"bg-olive/10 text-olive":"bg-gold/15 text-olive"}`}>
                {s.badge}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-ink mt-3">{s.title}</h3>
            </div>
            <ArrowRightLeft className="h-6 w-6 text-olive shrink-0"/>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2"/><strong className="block text-ink">Embarque · sexta à noite</strong><span className="text-muted-foreground">{formatTripShort(plan.flight)}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><CalendarDays className="h-4 w-4 text-olive mb-2"/><strong className="block text-ink">Passeios · cerca de 1 semana</strong><span className="text-muted-foreground">{formatTripShort(plan.tourismStart)} → {formatTripShort(plan.tourismEnd)}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><GraduationCap className="h-4 w-4 text-olive mb-2"/><strong className="block text-ink">Curso · 4 semanas de aulas</strong><span className="text-muted-foreground">{formatTripShort(plan.courseStart)} → {formatTripShort(plan.courseEnd)}</span></div>
            <div className="rounded-2xl bg-secondary/50 p-4"><Plane className="h-4 w-4 text-olive mb-2"/><strong className="block text-ink">Retorno · mesma data</strong><span className="text-muted-foreground">{formatTripShort(plan.returnDate)}</span></div>
          </div>

          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p><strong className="text-ink">30 dias de férias:</strong> <span className="text-foreground/75">{formatTripShort(plan.vacationStart)} → {formatTripShort(plan.vacationEnd)}</span></p>
            <p><strong className="text-ink">Banco previsto:</strong> <span className="text-foreground/75">{plan.bank.map(formatTripShort).join(" e ")}; 21/04 é feriado nacional brasileiro</span></p>
            <p className="rounded-2xl bg-gold/10 border border-gold/25 p-3 text-foreground/80">{plan.arrivalNote}</p>
          </div>
        </article>;
      })}
    </div>

    <div className="mt-5 rounded-2xl border border-olive/25 bg-card p-4 sm:p-5 text-sm text-foreground/75 leading-relaxed">
      <strong className="text-ink">O que realmente muda:</strong> o aeroporto de entrada/saída, os deslocamentos e a data de início do curso.
      O total de dias fora, o embarque, o retorno, as férias e o banco de horas são iguais nas duas alternativas.
      O calendário de férias permite também comparar outras janelas de embarque.
    </div>

    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-foreground/75 leading-relaxed">
      <TriangleAlert className="h-5 w-5 text-olive shrink-0 mt-0.5"/>
      <p><strong>Páscoa de 2028:</strong> sexta-feira 14/04 e segunda-feira 17/04 são feriados no Reino Unido.
      Dependendo da ordem, um ou dois desses dias podem cair durante as semanas de aula.
      O calendário específico de fechamento da Kaplan Liverpool para 2028 ainda precisa de confirmação.
      Nenhuma dessas datas representa reserva ou turma contratada.</p>
    </div>
  </section>
);
