import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plane, Bell, Scale, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalList } from "@/hooks/useLocalList";

type Alert = { id: string; destination: string; price: number; airline: string; date: string; status: string };

type FlightTarget = { label: string; route: string; origin: string; destination: string; date: string; flag: string; note: string };
const targets: FlightTarget[] = [
  { label: "Entrada por Londres", route: "São Paulo → Londres", origin: "SAO", destination: "LHR", date: "2028-03-10", flag: "🇬🇧", note: "Melhor encaixe ferroviário para chegar em Liverpool antes da Kaplan." },
  { label: "Alternativa de entrada", route: "São Paulo → Manchester", origin: "SAO", destination: "MAN", date: "2028-03-10", flag: "🇬🇧", note: "Comparar apenas pelo custo total: voo + bagagem + conexão/trem até Liverpool." },
  { label: "Volta pelo fim da rota", route: "Milão → São Paulo", origin: "MXP", destination: "SAO", date: "2028-04-16", flag: "🇮🇹", note: "Evita voltar ao Reino Unido só para pegar o voo de retorno." },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const Ofertas = () => {
  const [tab, setTab] = useState("radar");
  const list = useLocalList<Alert>("price-alerts");
  const [dest, setDest] = useState(targets[0].route);
  const [price, setPrice] = useState("");
  const [airline, setAirline] = useState("");
  const best = useMemo(() => list.items.filter(a => a.price > 0).sort((a, b) => a.price - b.price)[0], [list.items]);

  const add = () => {
    const p = Number(price);
    if (!p) return;
    list.add({ destination: dest, price: p, airline, date: new Date().toISOString().slice(0, 10), status: "Preço registrado" } as Omit<Alert, "id">);
    setPrice("");
    setAirline("");
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex min-h-11 items-center gap-2 text-sm text-foreground/70 hover:text-olive"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
          <div className="font-display text-base sm:text-lg text-ink whitespace-nowrap">Radar <span className="text-gold">·</span> 2028</div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
        <p className="text-xs tracking-[0.3em] uppercase text-olive">Europa 2028</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Passagens <span className="italic text-olive">& decisões</span></h1>
        <p className="text-foreground/70 mt-3 max-w-3xl leading-relaxed">O roteiro recomendado pede uma passagem multidestino/open jaw: entrar no Reino Unido em 10/03 e voltar de Milão em 16/04. Como a venda de 2028 ainda não está aberta, o site não inventa preço-alvo: vamos registrar tarifas reais quando elas aparecerem.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          <Stat label="Melhor registrado" value={best ? brl(best.price) : "—"} sub={best ? best.destination : "Nenhuma tarifa real salva"} />
          <Stat label="Ida-base" value="10/03/2028" sub="Brasil → Reino Unido" />
          <Stat label="Volta-base" value="16/04/2028" sub="Milão → Brasil" />
          <Stat label="Estratégia" value="Open jaw" sub="comparar com bilhetes separados" />
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {[["radar", Plane, "Radar"], ["alertas", Bell, "Histórico"], ["comparador", Scale, "Como comparar"]].map(([id, Icon, label]: any) => (
            <button key={id} onClick={() => setTab(id)} className={`min-h-11 px-4 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap ${tab === id ? "bg-olive text-primary-foreground" : "bg-secondary text-ink"}`}><Icon className="h-4 w-4" /> {label}</button>
          ))}
        </div>

        {tab === "radar" && (
          <section className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map(t => (
              <div key={t.route} className="rounded-3xl bg-card border border-gold/30 p-5 sm:p-6 shadow-card">
                <p className="text-[10px] uppercase tracking-wider text-olive">{t.label}</p>
                <h2 className="font-display text-2xl text-ink mt-1">{t.flag} {t.route}</h2>
                <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{t.note}</p>
                <p className="text-xs text-muted-foreground mt-3">Data-base: {new Date(`${t.date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                <a href={`https://www.google.com/travel/flights?q=Flights%20from%20${t.origin}%20to%20${t.destination}%20on%20${t.date}`} target="_blank" rel="noreferrer" className="mt-4 min-h-11 inline-flex items-center gap-2 text-sm text-olive hover:underline"><ExternalLink className="h-4 w-4" /> Abrir pesquisa</a>
              </div>
            ))}
          </section>
        )}

        {tab === "alertas" && (
          <section className="mt-4 rounded-3xl bg-card border border-border/60 p-5 sm:p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5"><div className="h-10 w-10 rounded-xl bg-gold/15 grid place-items-center shrink-0"><Bell className="h-5 w-5 text-olive" /></div><div><h2 className="font-display text-2xl text-ink">Registrar tarifa real</h2><p className="text-xs text-muted-foreground">Para comparar histórico sem depender da memória</p></div></div>
            <div className="grid sm:grid-cols-4 gap-3">
              <select value={dest} onChange={e => setDest(e.target.value)} className="h-12 rounded-xl border border-input bg-background px-3 text-base">{targets.map(t => <option key={t.route} value={t.route}>{t.route}</option>)}</select>
              <Input className="h-12 text-base rounded-xl" type="number" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço por pessoa" />
              <Input className="h-12 text-base rounded-xl" value={airline} onChange={e => setAirline(e.target.value)} placeholder="Companhia / fonte" />
              <Button onClick={add} className="h-12 rounded-xl">Salvar preço</Button>
            </div>
            <div className="mt-6 space-y-2">{list.items.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma tarifa registrada ainda.</p> : list.items.map(a => <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/40 p-4"><div className="flex-1 min-w-[180px]"><strong className="text-ink">{a.destination} · {brl(a.price)}</strong><p className="text-xs text-muted-foreground">{a.airline || "Fonte não informada"} · {a.date}</p></div><button onClick={() => list.remove(a.id)} className="min-h-9 px-2 text-xs text-destructive">Excluir</button></div>)}</div>
          </section>
        )}

        {tab === "comparador" && (
          <section className="mt-4 rounded-3xl bg-card border border-border/60 p-5 sm:p-6 shadow-card">
            <div className="flex gap-3"><Scale className="h-5 w-5 text-olive mt-1 shrink-0" /><div><h2 className="font-display text-2xl text-ink">O menor preço não vence sozinho</h2><p className="text-sm text-foreground/70 mt-2 max-w-2xl leading-relaxed">Comparar o total de: passagem + bagagem + transporte do aeroporto + eventual hotel extra + horas perdidas. Manchester só vence Londres se a economia continuar existindo depois do trem até Liverpool. E voltar de Milão evita pagar para refazer a rota.</p><div className="mt-5 rounded-2xl bg-gold/10 border border-gold/30 p-4 text-sm"><Sparkles className="h-4 w-4 text-olive inline mr-2" />Quando as tarifas 2028 abrirem, registrar no histórico o preço <strong>multidestino</strong> e a soma de <strong>dois one-way</strong> para comparar maçã com maçã.</div></div></div>
          </section>
        )}
      </main>
    </div>
  );
};

const Stat = ({ label, value, sub }: { label: string; value: string; sub: string }) => <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-card"><p className="text-[10px] uppercase tracking-wider text-olive">{label}</p><p className="font-display text-xl md:text-2xl text-ink mt-1 leading-tight">{value}</p><p className="text-[11px] text-muted-foreground mt-1">{sub}</p></div>;

export default Ofertas;