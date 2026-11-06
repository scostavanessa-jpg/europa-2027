import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft, CalendarDays, GraduationCap, Landmark, Plane, Sparkles, WalletCards } from "lucide-react";
import { vacationWindows, buildTripSchedule, type TripOrder, type TripSchedule } from "@/lib/tripSchedule2028";

const holidays = [
  { date: "2028-04-14", label: "Sexta-feira Santa" },
  { date: "2028-04-21", label: "Tiradentes" },
  { date: "2028-05-01", label: "Dia do Trabalho" },
];

const options = vacationWindows;

const months = [
  { year: 2028, month: 2, label: "Março" },
  { year: 2028, month: 3, label: "Abril" },
  { year: 2028, month: 4, label: "Maio" },
];

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inRange = (date: string, start: string, end: string) => date >= start && date <= end;
const fmt = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function MonthCalendar({ year, month, label, option }: { year: number; month: number; label: string; option: TripSchedule }) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array(leading).fill(null);
  for (let day = 1; day <= last.getDate(); day++) cells.push(new Date(year, month, day));
  while (cells.length % 7) cells.push(null);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="font-display text-xl text-ink mb-3">{label} 2028</h3>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">
        {weekdays.map((w) => <div key={w} className="text-center py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
          const key = iso(date);
          const holiday = holidays.find((h) => h.date === key);
          const vacation = inRange(key, option.vacationStart, option.vacationEnd);
          const course = inRange(key, option.courseStart, option.courseEnd);
          const tourism = inRange(key, option.tourismStart, option.tourismEnd);
          const bank = option.bank.includes(key as never);
          const flight = key === option.flight;
          const returning = key === option.returnDate;
          const abroad = inRange(key, option.abroadStart, option.abroadEnd);

          let cls = "border-border/40 bg-background";
          if (abroad) cls = "border-olive/20 bg-olive/5";
          if (tourism) cls = "border-gold/40 bg-gold/15";
          if (vacation) cls = "border-olive/35 bg-olive/15";
          if (course) cls += " ring-1 ring-inset ring-sky-500/35";
          if (bank) cls = "border-amber-500/40 bg-amber-100/60";
          if (holiday) cls += " outline outline-1 outline-rose-400/60";
          if (flight || returning) cls += " ring-2 ring-inset ring-violet-500/50";

          return (
            <div key={key} title={[holiday?.label, flight ? "Embarque à noite" : "", returning ? "Retorno" : "", bank ? "Banco de horas" : "", vacation ? "Férias" : "", course ? "Curso" : "", tourism ? "Passeio" : ""].filter(Boolean).join(" • ")} className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative ${cls}`}>
              <span className="text-xs font-medium text-foreground">{date.getDate()}</span>
              <div className="flex gap-0.5 mt-0.5">
                {holiday && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                {course && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                {bank && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                {(flight || returning) && <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Ferias2028() {
  const [selected, setSelected] = useState<(typeof options)[number]["id"]>("equilibrio");
  const [order,setOrder] = useState<TripOrder>("tour-first");
  const base=useMemo(()=>options.find(o=>o.id===selected)??options[0],[selected]);
  const option=useMemo(()=>buildTripSchedule(base,order),[base,order]);

  return (
    <div className="min-h-screen bg-gradient-warm text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-olive"><ArrowLeft className="h-4 w-4" /> Voltar para a viagem</Link>
          <span className="text-xs uppercase tracking-[0.2em] text-olive">Intercâmbio 2028</span>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs text-olive"><Sparkles className="h-3.5 w-3.5" /> 30 dias de férias + banco só quando valer a pena</div>
          <h1 className="font-display text-4xl md:text-6xl text-ink mt-5 leading-tight">Qual janela faz nossas férias renderem mais?</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">Objetivo: quatro semanas consecutivas de curso + cerca de uma semana passeando, embarque na sexta à noite e retorno ao Brasil antes de 13/05/2028. Ao inverter a ordem, os voos e os 30 dias de férias permanecem iguais: só trocamos o passeio e o curso.</p>
        </section>

        <section className="mt-7 rounded-3xl border border-olive/25 bg-card p-5 sm:p-6 shadow-card" aria-label="Escolha a ordem da viagem">
          <div className="flex items-center gap-2 mb-3"><ArrowRightLeft className="h-5 w-5 text-olive"/><h2 className="font-display text-2xl text-ink">O que vem primeiro?</h2></div>
          <div className="grid sm:grid-cols-2 gap-2">
            <button type="button" aria-pressed={order==="tour-first"} onClick={()=>setOrder("tour-first")}
              className={`min-h-14 text-sm px-4 py-3 rounded-2xl border text-left transition-colors ${order==="tour-first"?"bg-olive text-white border-olive":"bg-secondary/50 border-border/60 text-ink hover:border-olive/40"}`}>
              <strong className="block">Passear primeiro</strong><span className="block text-xs mt-1 opacity-85">1 semana pela Europa → 4 de curso</span>
            </button>
            <button type="button" aria-pressed={order==="course-first"} onClick={()=>setOrder("course-first")}
              className={`min-h-14 text-sm px-4 py-3 rounded-2xl border text-left transition-colors ${order==="course-first"?"bg-olive text-white border-olive":"bg-secondary/50 border-border/60 text-ink hover:border-olive/40"}`}>
              <strong className="block">Intercâmbio primeiro</strong><span className="block text-xs mt-1 opacity-85">4 semanas de curso → 1 de passeio</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">A seleção atualiza todas as datas no calendário abaixo. Não desloca o embarque e a volta para fingir que os cenários têm a mesma duração.</p>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mt-10">
          {options.map((o) => {
            const active = o.id === option.id;
            return (
              <button key={o.id} onClick={() => setSelected(o.id)} className={`text-left rounded-3xl border p-5 transition-all ${active ? "border-olive bg-card shadow-soft ring-1 ring-olive/20" : "border-border/60 bg-card/75 hover:border-gold/60"}`}>
                <div className="text-[10px] uppercase tracking-[0.2em] text-olive">{o.badge}</div>
                <h2 className="font-display text-2xl text-ink mt-2">{o.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{o.subtitle}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div className="rounded-2xl bg-secondary/60 p-3"><strong className="block text-xl text-ink">{o.totalDays}</strong><span className="text-xs text-muted-foreground">dias fora</span></div>
                  <div className="rounded-2xl bg-secondary/60 p-3"><strong className="block text-xl text-ink">{o.bankDays}</strong><span className="text-xs text-muted-foreground">dias de banco</span></div>
                </div>
              </button>
            );
          })}
        </section>

        <section className="mt-8 rounded-[2rem] border border-gold/30 bg-card p-6 md:p-8 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-olive">Cenário selecionado · {order==="tour-first"?"Passeio antes do curso":"Intercâmbio antes do passeio"}</div>
              <h2 className="font-display text-3xl text-ink mt-1">{option.title}</h2>
            </div>
            <div className="rounded-2xl bg-olive/10 px-4 py-3 text-sm"><strong>{option.totalDays} dias consecutivos fora</strong><br/><span className="text-muted-foreground">com {option.bankDays} dias de banco</span></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
            <div className="rounded-2xl border border-border/60 p-4"><Plane className="h-4 w-4 text-olive"/><div className="text-xs text-muted-foreground mt-3">Embarque</div><strong>{fmt(option.flight)} à noite</strong></div>
            <div className="rounded-2xl border border-border/60 p-4"><Landmark className="h-4 w-4 text-olive"/><div className="text-xs text-muted-foreground mt-3">Passeio</div><strong>{fmt(option.tourismStart)}–{fmt(option.tourismEnd)}</strong></div>
            <div className="rounded-2xl border border-border/60 p-4"><GraduationCap className="h-4 w-4 text-olive"/><div className="text-xs text-muted-foreground mt-3">Curso · 4 semanas</div><strong>{fmt(option.courseStart)}–{fmt(option.courseEnd)}</strong></div>
            <div className="rounded-2xl border border-border/60 p-4"><CalendarDays className="h-4 w-4 text-olive"/><div className="text-xs text-muted-foreground mt-3">Férias oficiais · 30 dias</div><strong>{fmt(option.vacationStart)}–{fmt(option.vacationEnd)}</strong></div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4"><WalletCards className="h-4 w-4 text-amber-700"/><div className="text-xs text-muted-foreground mt-3">Banco de horas</div><strong>{option.bank.map(fmt).join(", ")}</strong></div>
            <div className="rounded-2xl bg-rose-50/70 border border-rose-200/60 p-4"><div className="text-xs text-muted-foreground">Feriados dentro das férias</div><strong>{option.holidaysInside.length ? option.holidaysInside.join(", ") : "Nenhum"}</strong></div>
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-4"><div className="text-xs text-muted-foreground">Feriados preservados</div><strong>{option.holidaysSaved.join(", ")}</strong></div>
          </div>

          <div className="mt-5 rounded-2xl border border-olive/15 bg-olive/5 p-4 text-sm text-foreground/80 leading-relaxed">
            <strong className="text-ink">Encaixe das semanas:</strong> {option.arrivalNote}
            {" "}As aulas ocupam quatro semanas consecutivas de segunda a sexta. Passeio e estudos não se sobrepõem em dias de aula.
          </div>
          <div className="mt-5 text-sm text-muted-foreground">Retorno previsto: <strong className="text-foreground">{fmt(option.returnDate)}</strong> · volta ao trabalho: <strong className="text-foreground">{fmt(option.workReturn)}</strong>. Limite pessoal para estar no Brasil: <strong className="text-foreground">13/05</strong>.</div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap gap-3 text-xs mb-4">
            <span className="rounded-full bg-olive/15 px-3 py-1">Férias</span>
            <span className="rounded-full bg-gold/20 px-3 py-1">Passeio</span>
            <span className="rounded-full border border-sky-400/50 px-3 py-1">Curso</span>
            <span className="rounded-full bg-amber-100 px-3 py-1">Banco</span>
            <span className="rounded-full border border-rose-400/60 px-3 py-1">Feriado BR</span>
            <span className="rounded-full border border-violet-400/60 px-3 py-1">Embarque/retorno</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {months.map((m) => <MonthCalendar key={m.label} {...m} option={option} />)}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border/60 bg-card/80 p-5 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Ponto de atenção:</strong> a Páscoa de 2028 tem Sexta-feira Santa em 14/04 e Easter Monday em 17/04 na Inglaterra. O calendário acima organiza quatro semanas corridas de curso, mas não garante 20 dias letivos: é necessário confirmar o fechamento e eventuais compensações diretamente com a Kaplan Liverpool antes da matrícula.
        </section>
      </main>
    </div>
  );
}
