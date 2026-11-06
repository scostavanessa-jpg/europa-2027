/**
 * Europa 2028 — fonte única das datas de planejamento.
 *
 * Trocar a ordem muda os blocos de passeio/curso, NÃO a janela de voos,
 * as férias da CLT, o retorno ou os 4 ciclos semanais de aula.
 *
 * Aula: segunda a sexta, durante 4 semanas consecutivas. Fins de semana
 * entre as semanas são livres, e o passeio pode começar no sábado após
 * a última sexta de aula. As turmas e feriados dependem de confirmação com a Kaplan.
 */
export type TripOrder = "tour-first" | "course-first";
export type VacationWindow = {
  id: "equilibrio" | "abril" | "feriados";
  badge: string;
  title: string;
  subtitle: string;
  vacationStart: string;
  vacationEnd: string;
  flight: string;
  abroadStart: string;
  abroadEnd: string;
  bank: readonly string[];
  returnDate: string;
  workReturn: string;
  totalDays: number;
  bankDays: number;
  holidaysInside: readonly string[];
  holidaysSaved: readonly string[];
};

export const vacationWindows: readonly VacationWindow[] = [
  {
    id: "equilibrio",
    badge: "Recomendação a validar",
    title: "Melhor equilíbrio",
    subtitle: "Mesmos voos nas duas ordens: viagem em março e abril, com pouco banco.",
    vacationStart: "2028-03-20",
    vacationEnd: "2028-04-18",
    flight: "2028-03-17",
    abroadStart: "2028-03-18",
    abroadEnd: "2028-04-23",
    bank: ["2028-04-19", "2028-04-20"],
    returnDate: "2028-04-23",
    workReturn: "2028-04-24",
    totalDays: 37,
    bankDays: 2,
    holidaysInside: ["14/04"],
    holidaysSaved: ["21/04", "01/05"],
  },
  {
    id: "abril",
    badge: "Mais abril",
    title: "Viagem mais tarde",
    subtitle: "Preserva a possibilidade de passear ou estudar primeiro sem mudar os voos.",
    vacationStart: "2028-03-27",
    vacationEnd: "2028-04-25",
    flight: "2028-03-24",
    abroadStart: "2028-03-25",
    abroadEnd: "2028-05-01",
    bank: ["2028-04-26", "2028-04-27", "2028-04-28"],
    returnDate: "2028-05-01",
    workReturn: "2028-05-02",
    totalDays: 38,
    bankDays: 3,
    holidaysInside: ["14/04", "21/04"],
    holidaysSaved: ["01/05"],
  },
  {
    id: "feriados",
    badge: "Preservar feriados",
    title: "Viagem mais cedo",
    subtitle: "Menos impacto dos feriados brasileiros nos 30 dias de férias.",
    vacationStart: "2028-03-13",
    vacationEnd: "2028-04-11",
    flight: "2028-03-10",
    abroadStart: "2028-03-11",
    abroadEnd: "2028-04-16",
    bank: ["2028-04-12", "2028-04-13"],
    returnDate: "2028-04-16",
    workReturn: "2028-04-17",
    totalDays: 37,
    bankDays: 2,
    holidaysInside: [],
    holidaysSaved: ["14/04", "21/04", "01/05"],
  },
];

const addDays = (date: string, days: number) => {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month-1, day + days));
  return d.toISOString().slice(0, 10);
};

const differenceDays = (start: string, end: string) =>
  Math.round((Date.parse(end+"T00:00:00Z")-Date.parse(start+"T00:00:00Z"))/86400000);

export type TripSchedule = VacationWindow & {
  order: TripOrder;
  tourismStart: string;
  tourismEnd: string;
  courseStart: string;
  courseEnd: string;
  tourismDays: number;
  courseWeeks: 4;
  arrivalNote: string;
};

export function buildTripSchedule(window: VacationWindow, order: TripOrder): TripSchedule {
  // Boarding is Friday evening; arrival is Saturday; course starts Monday.
  const firstMonday = addDays(window.abroadStart, 2);
  const courseStart = order === "course-first" ? firstMonday : addDays(firstMonday,7);
  // Four teaching weeks: Monday-Friday, weeks 1–4, last Friday is +25d.
  const courseEnd = addDays(courseStart,25);
  const tourismStart = order === "tour-first" ? window.abroadStart : addDays(courseEnd,1);
  const tourismEnd = order === "tour-first" ? addDays(courseStart,-1) : window.returnDate;
  const tourismDays = differenceDays(tourismStart,tourismEnd)+1;

  const firstDay=new Date(courseStart+"T00:00:00Z").getUTCDay();
  const lastDay=new Date(courseEnd+"T00:00:00Z").getUTCDay();
  const blocksTouch=order==="tour-first"?
    addDays(tourismEnd,1)===courseStart:addDays(courseEnd,1)===tourismStart;
  if (new Date(firstMonday+"T00:00:00Z").getUTCDay()!==1 ||
      firstDay!==1 || lastDay!==5 || differenceDays(courseStart,courseEnd)!==25 ||
      !blocksTouch || tourismDays<7 || tourismEnd<tourismStart ||
      courseEnd>window.returnDate) {
    throw Error("Janela de viagem inconsistente. Confira os limites antes de publicar.");
  }
  return {
    ...window,order,tourismStart,tourismEnd,courseStart,courseEnd,
    tourismDays,courseWeeks:4,
    arrivalNote:order === "course-first"
      ? "Chegada no sábado; fim de semana para instalação em Liverpool. Curso começa na segunda-feira imediatamente seguinte."
      : "Chegada no sábado; passeio antes do curso, que começa na segunda-feira após a semana de turismo."
  };
}
export const formatTripDate = (date: string) => {
  const [y,m,d] = date.split("-");
  return `${d}/${m}/${y}`;
};
export const formatTripShort = (date: string) => {
  const [,m,d] = date.split("-");
  return `${d}/${m}`;
};
export const defaultTripWindow = vacationWindows[0];
