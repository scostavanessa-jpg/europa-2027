import { Link } from "react-router-dom";
import { BedDouble, BookOpenCheck, CalendarDays, MapPinned, PiggyBank, ReceiptText, Sparkles, UsersRound } from "lucide-react";

const actions = [
  {
    to: "/planejar",
    title: "Nosso roteiro",
    text: "Editar cidades, ordem do roteiro e hospedagens que todas enxergam.",
    icon: MapPinned,
    featured: true,
  },
  {
    to: "/ferias-2028",
    title: "Datas e férias",
    text: "Comparar embarques e trocar passeio/curso sem mudar o total de dias.",
    icon: CalendarDays,
  },
  {
    to: "/minha-viagem",
    title: "Meu cofrinho",
    text: "Cofrinho, gastos privados, prioridades e metas.",
    icon: PiggyBank,
  },
  {
    to: "/rateio",
    title: "Dividir despesas",
    text: "Registrar despesas e calcular quem deve para quem.",
    icon: ReceiptText,
  },
  {
    to: "/ofertas",
    title: "Achados da viagem",
    text: "Guardar e comparar oportunidades de passagem e viagem.",
    icon: Sparkles,
  },
  {
    to: "/planejar#hospedagens",
    title: "Hospedagens",
    text: "Adicionar opções, datas, valores, links e status.",
    icon: BedDouble,
  },
  {
    to: "/grupo",
    title: "Nossa turma",
    text: "Ver seu perfil e os atalhos do planejamento privado.",
    icon: UsersRound,
  },
  {
    to: "/projeto",
    title: "Nossa essência",
    text: "Memória dos pedidos originais, prioridades e melhorias.",
    icon: BookOpenCheck,
  },
];

export const PlannerHub = () => (
  <section id="painel" className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
    <div className="rounded-[2rem] border border-gold/30 bg-card shadow-card p-5 sm:p-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-olive mb-2">Painel da viagem</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink">Um plano, três amigas.</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Escolha por onde começar. Roteiro, gastos, cofrinho e decisões ficam organizados em um único lugar.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.to}
              className={`group rounded-2xl border p-4 sm:p-5 transition-all active:scale-[0.99] ${
                action.featured
                  ? "border-olive/40 bg-olive text-primary-foreground shadow-soft"
                  : "border-border/60 bg-background/70 hover:border-gold/50 hover:shadow-card"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl grid place-items-center mb-3 ${action.featured ? "bg-white/15" : "bg-gold/15"}`}>
                <Icon className={`h-5 w-5 ${action.featured ? "text-primary-foreground" : "text-olive"}`} />
              </div>
              <h3 className={`font-display text-2xl ${action.featured ? "text-primary-foreground" : "text-ink"}`}>{action.title}</h3>
              <p className={`text-sm mt-1.5 leading-relaxed ${action.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{action.text}</p>
              <span className={`inline-block mt-4 text-xs font-medium ${action.featured ? "text-primary-foreground" : "text-olive"}`}>Abrir →</span>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);
