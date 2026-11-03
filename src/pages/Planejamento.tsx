import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowLeft, ArrowUp, BedDouble, ExternalLink, Loader2, MapPinned, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type RouteItem = {
  id: string;
  city: string;
  country: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  priority: string | null;
  notes: string | null;
};

type Accommodation = {
  id: string;
  city: string;
  name: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  booking_link: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  currency: string | null;
  status: string | null;
  notes: string | null;
};

const routeBase = [
  ["Milão", "Itália"],
  ["Tirano", "Itália"],
  ["Alpes suíços", "Suíça"],
  ["Strasbourg", "França"],
  ["Bruxelas / Bruges", "Bélgica"],
  ["Amsterdam", "Países Baixos"],
  ["Londres", "Reino Unido"],
  ["Liverpool", "Reino Unido"],
];

export default function Planejamento() {
  const [route, setRoute] = useState<RouteItem[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRoute, setSavingRoute] = useState(false);
  const [savingStay, setSavingStay] = useState(false);

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [priority, setPriority] = useState("desejável");
  const [routeNotes, setRouteNotes] = useState("");

  const [stayCity, setStayCity] = useState("Liverpool");
  const [stayName, setStayName] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [status, setStatus] = useState("pesquisando");
  const [bookingLink, setBookingLink] = useState("");
  const [stayNotes, setStayNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [routeRes, staysRes] = await Promise.all([
        supabase.from("route_items").select("id,city,country,starts_at,ends_at,sort_order,priority,notes").order("sort_order", { ascending: true }),
        supabase.from("accommodations").select("id,city,name,checkin_date,checkout_date,booking_link,estimated_cost,actual_cost,currency,status,notes").order("checkin_date", { ascending: true, nullsFirst: false }),
      ]);
      if (routeRes.error) throw routeRes.error;
      if (staysRes.error) throw staysRes.error;
      setRoute((routeRes.data ?? []) as RouteItem[]);
      setAccommodations((staysRes.data ?? []) as Accommodation[]);
    } catch (err: any) {
      toast.error("Não consegui carregar o planejamento compartilhado.", { description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const addRoute = async (e: FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setSavingRoute(true);
    try {
      const { data, error } = await supabase.from("route_items").insert({
        city: city.trim(),
        country: country.trim() || null,
        sort_order: route.length ? Math.max(...route.map((x) => x.sort_order)) + 1 : 0,
        priority,
        notes: routeNotes.trim() || null,
      }).select("id,city,country,starts_at,ends_at,sort_order,priority,notes").single();
      if (error) throw error;
      setRoute((current) => [...current, data as RouteItem]);
      setCity(""); setCountry(""); setRouteNotes("");
      toast.success("Parada adicionada. Todas passam a enxergar.");
    } catch (err: any) {
      toast.error("Não consegui adicionar a parada.", { description: err?.message });
    } finally {
      setSavingRoute(false);
    }
  };

  const seedRoute = async () => {
    if (route.length) return toast.info("O roteiro compartilhado já tem itens.");
    setSavingRoute(true);
    try {
      const payload = routeBase.map(([baseCity, baseCountry], index) => ({
        city: baseCity,
        country: baseCountry,
        sort_order: index,
        priority: baseCity === "Liverpool" ? "imperdível" : "desejável",
        notes: baseCity === "Liverpool" ? "4 semanas de curso" : null,
      }));
      const { data, error } = await supabase.from("route_items").insert(payload).select("id,city,country,starts_at,ends_at,sort_order,priority,notes");
      if (error) throw error;
      setRoute((data ?? []) as RouteItem[]);
      toast.success("Roteiro-base criado no planejamento compartilhado.");
    } catch (err: any) {
      toast.error("Não consegui criar o roteiro-base.", { description: err?.message });
    } finally {
      setSavingRoute(false);
    }
  };

  const updateRoute = async (item: RouteItem, patch: Partial<RouteItem>) => {
    try {
      const { data, error } = await supabase.from("route_items").update(patch).eq("id", item.id).select("id,city,country,starts_at,ends_at,sort_order,priority,notes").single();
      if (error) throw error;
      setRoute((current) => current.map((x) => x.id === item.id ? data as RouteItem : x).sort((a,b) => a.sort_order-b.sort_order));
    } catch (e: any) {
      toast.error("Não foi possível salvar a edição.", { description: e?.message });
      void load();
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= route.length) return;
    const a = route[index], b = route[target];
    const next = [...route];
    next[index] = { ...b, sort_order: a.sort_order };
    next[target] = { ...a, sort_order: b.sort_order };
    next.sort((x,y) => x.sort_order-y.sort_order);
    setRoute(next);
    try {
      const [first, second] = await Promise.all([
        supabase.from("route_items").update({ sort_order: b.sort_order }).eq("id", a.id),
        supabase.from("route_items").update({ sort_order: a.sort_order }).eq("id", b.id),
      ]);
      if (first.error || second.error) throw first.error || second.error;
    } catch (e: any) {
      toast.error("Não foi possível reordenar o roteiro.", { description: e?.message });
      void load();
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm("Excluir esta parada do roteiro compartilhado?")) return;
    const { error } = await supabase.from("route_items").delete().eq("id", id);
    if (error) return toast.error("Não consegui excluir.", { description: error.message });
    setRoute((current) => current.filter((x) => x.id !== id));
  };

  const addStay = async (e: FormEvent) => {
    e.preventDefault();
    if (!stayCity.trim()) return;
    setSavingStay(true);
    try {
      const value = estimatedCost ? Number(estimatedCost.replace(",", ".")) : null;
      const { data, error } = await supabase.from("accommodations").insert({
        city: stayCity.trim(),
        name: stayName.trim() || null,
        checkin_date: checkin || null,
        checkout_date: checkout || null,
        booking_link: bookingLink.trim() || null,
        estimated_cost: value,
        currency,
        status,
        notes: stayNotes.trim() || null,
      }).select("id,city,name,checkin_date,checkout_date,booking_link,estimated_cost,actual_cost,currency,status,notes").single();
      if (error) throw error;
      setAccommodations((current) => [...current, data as Accommodation]);
      setStayName(""); setCheckin(""); setCheckout(""); setEstimatedCost(""); setBookingLink(""); setStayNotes("");
      toast.success("Hospedagem salva para o grupo.");
    } catch (err: any) {
      toast.error("Não consegui salvar a hospedagem.", { description: err?.message });
    } finally {
      setSavingStay(false);
    }
  };

  const deleteStay = async (id: string) => {
    if (!confirm("Excluir esta hospedagem?")) return;
    const { error } = await supabase.from("accommodations").delete().eq("id", id);
    if (error) return toast.error("Não consegui excluir.", { description: error.message });
    setAccommodations((current) => current.filter((x) => x.id !== id));
  };

  const totalEstimated = useMemo(() => {
    const totals: Record<string,number> = {};
    for (const item of accommodations) {
      const currency = item.currency || "EUR";
      totals[currency] = (totals[currency] || 0) + Number(item.estimated_cost || 0);
    }
    return Object.entries(totals).map(([currency,value]) => `${currency} ${value.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`).join(" · ") || "—";
  }, [accommodations]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="h-4 w-4"/>Voltar</Link>
          <span className="rounded-full bg-olive/10 px-3 py-1.5 text-xs text-olive">Compartilhado</span>
        </div>

        <div className="mt-5 mb-7">
          <p className="text-xs tracking-[0.3em] uppercase text-olive">Painel editável</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Planejamento compartilhado</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">Tudo que for salvo aqui fica no banco da viagem. Vanessa, Camila e Danielle passam a trabalhar sobre a mesma informação.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-olive"/></div>
        ) : (
          <Tabs defaultValue={window.location.hash === "#hospedagens" ? "hospedagens" : "roteiro"}>
            <TabsList className="w-full justify-start overflow-x-auto bg-secondary/60">
              <TabsTrigger value="roteiro"><MapPinned className="h-4 w-4 mr-1.5"/>Roteiro</TabsTrigger>
              <TabsTrigger value="hospedagens"><BedDouble className="h-4 w-4 mr-1.5"/>Hospedagens</TabsTrigger>
            </TabsList>

            <TabsContent value="roteiro" className="mt-6 space-y-5">
              <div className="rounded-3xl border border-gold/30 bg-card p-5 sm:p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div><h2 className="font-display text-2xl text-ink">Editar o roteiro</h2><p className="text-sm text-muted-foreground">Adicione cidades e mude a ordem pelas setas.</p></div>
                  {!route.length && <Button type="button" variant="outline" className="rounded-full" onClick={seedRoute} disabled={savingRoute}>Usar roteiro-base</Button>}
                </div>
                <form onSubmit={addRoute} className="grid md:grid-cols-2 gap-3">
                  <div><Label>Cidade / parada</Label><Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Ex.: Bruges" required/></div>
                  <div><Label>País</Label><Input value={country} onChange={(e)=>setCountry(e.target.value)} placeholder="Ex.: Bélgica"/></div>
                  <div><Label>Prioridade</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(e)=>setPriority(e.target.value)}><option value="imperdível">Imperdível</option><option value="desejável">Desejável</option><option value="opcional">Opcional</option></select></div>
                  <div><Label>Observação</Label><Input value={routeNotes} onChange={(e)=>setRouteNotes(e.target.value)} placeholder="Ex.: 2 noites"/></div>
                  <Button className="rounded-full md:w-fit" disabled={savingRoute}><Plus className="h-4 w-4 mr-1"/>{savingRoute ? "Salvando…" : "Adicionar parada"}</Button>
                </form>
              </div>

              <div className="space-y-3">
                {route.length === 0 ? <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">Ainda não há um roteiro compartilhado salvo. Use “roteiro-base” ou adicione a primeira parada.</div> : route.map((item,index)=>(
                  <div key={item.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="icon" variant="outline" className="h-8 w-8" disabled={index===0} onClick={()=>void move(index,-1)}><ArrowUp className="h-3.5 w-3.5"/></Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" disabled={index===route.length-1} onClick={()=>void move(index,1)}><ArrowDown className="h-3.5 w-3.5"/></Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] uppercase tracking-wider text-olive">Parada {index+1}</span><span className="text-[10px] rounded-full bg-gold/15 px-2 py-0.5 text-olive">{item.priority || "desejável"}</span></div>
                        <h3 className="font-display text-2xl text-ink mt-1">{item.city}</h3>
                        <p className="text-sm text-muted-foreground">{item.country || "País a definir"}{item.notes ? ` · ${item.notes}` : ""}</p>
                        <div className="mt-3 grid sm:grid-cols-2 gap-2">
                          <Input value={item.city} aria-label="Cidade" onChange={(e)=>setRoute((cur)=>cur.map((x)=>x.id===item.id?{...x,city:e.target.value}:x))} onBlur={(e)=>void updateRoute(item,{city:e.target.value.trim() || item.city})}/>
                          <Input value={item.notes || ""} aria-label="Observação" placeholder="Observação" onChange={(e)=>setRoute((cur)=>cur.map((x)=>x.id===item.id?{...x,notes:e.target.value}:x))} onBlur={(e)=>void updateRoute(item,{notes:e.target.value.trim() || null})}/>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={()=>void deleteRoute(item.id)} aria-label={`Excluir ${item.city}`}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hospedagens" id="hospedagens" className="mt-6 space-y-5">
              <div className="rounded-3xl border border-gold/30 bg-card p-5 sm:p-6 shadow-card">
                <h2 className="font-display text-2xl text-ink">Adicionar hospedagem</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-5">Pode ser opção em pesquisa, reserva feita ou apenas referência.</p>
                <form onSubmit={addStay} className="grid md:grid-cols-2 gap-3">
                  <div><Label>Cidade</Label><Input value={stayCity} onChange={(e)=>setStayCity(e.target.value)} required/></div>
                  <div><Label>Hotel / acomodação</Label><Input value={stayName} onChange={(e)=>setStayName(e.target.value)} placeholder="Nome ou descrição"/></div>
                  <div><Label>Check-in</Label><Input type="date" value={checkin} onChange={(e)=>setCheckin(e.target.value)}/></div>
                  <div><Label>Check-out</Label><Input type="date" value={checkout} onChange={(e)=>setCheckout(e.target.value)}/></div>
                  <div><Label>Valor estimado</Label><Input type="number" min="0" step="0.01" value={estimatedCost} onChange={(e)=>setEstimatedCost(e.target.value)} placeholder="0,00"/></div>
                  <div><Label>Moeda</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={currency} onChange={(e)=>setCurrency(e.target.value)}><option>GBP</option><option>EUR</option><option>CHF</option><option>BRL</option></select></div>
                  <div><Label>Status</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="pesquisando">Pesquisando</option><option value="favorito">Favorito</option><option value="reservado">Reservado</option><option value="pago">Pago</option><option value="descartado">Descartado</option></select></div>
                  <div><Label>Link</Label><Input type="url" value={bookingLink} onChange={(e)=>setBookingLink(e.target.value)} placeholder="https://..."/></div>
                  <div className="md:col-span-2"><Label>Observação</Label><Input value={stayNotes} onChange={(e)=>setStayNotes(e.target.value)} placeholder="Cancelamento, café, bairro, quarto…"/></div>
                  <Button className="rounded-full md:w-fit" disabled={savingStay}><Plus className="h-4 w-4 mr-1"/>{savingStay ? "Salvando…" : "Salvar hospedagem"}</Button>
                </form>
              </div>

              <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl text-ink">Opções salvas</h2><span className="text-xs text-muted-foreground">Estimado: {totalEstimated}</span></div>
              
              <div className="grid md:grid-cols-2 gap-3">
                {accommodations.length===0 ? <div className="md:col-span-2 rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">Nenhuma hospedagem compartilhada salva ainda.</div> : accommodations.map((item)=><div key={item.id} className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] uppercase tracking-wider text-olive">{item.city} · {item.status || "pendente"}</div><h3 className="font-display text-2xl text-ink mt-1">{item.name || "Acomodação sem nome"}</h3></div><Button size="icon" variant="ghost" onClick={()=>void deleteStay(item.id)}><Trash2 className="h-4 w-4"/></Button></div>
                  <p className="text-sm text-muted-foreground mt-2">{item.checkin_date || "check-in a definir"} → {item.checkout_date || "check-out a definir"}</p>
                  {item.estimated_cost != null && <p className="text-sm text-ink mt-2">Estimativa: <b>{Number(item.estimated_cost).toLocaleString("pt-BR",{minimumFractionDigits:2})} {item.currency}</b></p>}
                  {item.notes && <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>}
                  {item.booking_link && <a href={item.booking_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-olive mt-4 hover:underline">Abrir link <ExternalLink className="h-3.5 w-3.5"/></a>}
                </div>)}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
