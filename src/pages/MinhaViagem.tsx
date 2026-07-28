import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserLocalStore } from "@/hooks/useUserLocalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, PiggyBank, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

type SavingEntry = { id: string; date: string; amount: number; notes: string };
type SavingsState = { targetTotal: number; monthlyTarget: number; entries: SavingEntry[] };
type PriorityLevel = "Imperdível" | "Desejável" | "Opcional";
type PriorityItem = { id: string; title: string; city: string; level: PriorityLevel; notes: string };
type AlertPrefs = { flights: boolean; currency: boolean; checklist: boolean; lodging: boolean; events: boolean };

const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function MinhaViagem() {
  const { user, profile } = useAuth();
  const savings = useUserLocalStore<SavingsState>("savings", { targetTotal: 10220, monthlyTarget: 600, entries: [] });
  const priorities = useUserLocalStore<PriorityItem[]>("priorities", []);
  const alerts = useUserLocalStore<AlertPrefs>("alert-preferences", { flights: true, currency: true, checklist: true, lodging: true, events: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryAmount, setEntryAmount] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [priorityTitle, setPriorityTitle] = useState("");
  const [priorityCity, setPriorityCity] = useState("Liverpool");
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>("Desejável");
  const [priorityNotes, setPriorityNotes] = useState("");

  const totalSaved = useMemo(() => savings.value.entries.reduce((sum, item) => sum + Number(item.amount || 0), 0), [savings.value.entries]);
  const pending = Math.max(0, savings.value.targetTotal - totalSaved);
  const progress = savings.value.targetTotal > 0 ? Math.min(100, (totalSaved / savings.value.targetTotal) * 100) : 0;
  const name = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Viajante";

  const submitSaving = (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(entryAmount.replace(",", "."));
    if (!amount || amount <= 0) return toast.error("Informe um valor válido.");
    savings.setValue((current) => {
      const entry: SavingEntry = { id: editingId || crypto.randomUUID(), date: entryDate, amount, notes: entryNotes.trim() };
      const entries = editingId ? current.entries.map((item) => item.id === editingId ? entry : item) : [entry, ...current.entries];
      return { ...current, entries };
    });
    setEditingId(null); setEntryAmount(""); setEntryNotes("");
    toast.success(editingId ? "Lançamento atualizado." : "Valor guardado registrado.");
  };

  const editSaving = (item: SavingEntry) => {
    setEditingId(item.id); setEntryDate(item.date); setEntryAmount(String(item.amount)); setEntryNotes(item.notes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSaving = (id: string) => {
    if (!confirm("Excluir este lançamento?")) return;
    savings.setValue((current) => ({ ...current, entries: current.entries.filter((item) => item.id !== id) }));
  };

  const addPriority = (e: FormEvent) => {
    e.preventDefault();
    if (!priorityTitle.trim()) return;
    priorities.setValue((items) => [{ id: crypto.randomUUID(), title: priorityTitle.trim(), city: priorityCity.trim(), level: priorityLevel, notes: priorityNotes.trim() }, ...items]);
    setPriorityTitle(""); setPriorityNotes("");
    toast.success("Prioridade adicionada ao seu planejamento.");
  };

  return <div className="min-h-screen bg-background text-foreground">
    <div className="container mx-auto max-w-5xl px-5 md:px-6 py-10 md:py-14">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="h-4 w-4"/>Voltar à viagem</Link>
      <div className="mt-7 mb-8"><p className="text-xs tracking-[0.3em] uppercase text-olive">Área privada</p><h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Minha viagem</h1><p className="text-muted-foreground mt-2">{name} · cofrinho, desejos e preferências pessoais.</p></div>

      <Tabs defaultValue="cofrinho">
        <TabsList className="w-full justify-start overflow-x-auto bg-secondary/60">
          <TabsTrigger value="cofrinho"><PiggyBank className="h-4 w-4 mr-1.5"/>Cofrinho</TabsTrigger>
          <TabsTrigger value="prioridades"><Sparkles className="h-4 w-4 mr-1.5"/>Prioridades</TabsTrigger>
          <TabsTrigger value="alertas"><Bell className="h-4 w-4 mr-1.5"/>Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="cofrinho" className="mt-6 space-y-5">
          <div className="grid sm:grid-cols-4 gap-3">
            <Metric label="Meta total" value={money(savings.value.targetTotal)} />
            <Metric label="Guardado" value={money(totalSaved)} />
            <Metric label="Pendente" value={money(pending)} />
            <Metric label="Progresso" value={`${progress.toFixed(1)}%`} />
          </div>
          <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card">
            <div className="h-2 rounded-full bg-secondary overflow-hidden mb-6"><div className="h-full bg-olive transition-all" style={{ width: `${progress}%` }}/></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div><Label>Meta total individual</Label><Input type="number" min="0" step="50" value={savings.value.targetTotal} onChange={(e)=>savings.setValue((c)=>({...c,targetTotal:Number(e.target.value)||0}))}/></div>
              <div><Label>Meta mensal</Label><Input type="number" min="0" step="50" value={savings.value.monthlyTarget} onChange={(e)=>savings.setValue((c)=>({...c,monthlyTarget:Number(e.target.value)||0}))}/></div>
            </div>
            <form onSubmit={submitSaving} className="grid md:grid-cols-[160px_160px_1fr_auto] gap-3 items-end">
              <div><Label>Data</Label><Input type="date" value={entryDate} onChange={(e)=>setEntryDate(e.target.value)} required/></div>
              <div><Label>Valor</Label><Input type="number" min="0.01" step="0.01" value={entryAmount} onChange={(e)=>setEntryAmount(e.target.value)} placeholder="0,00" required/></div>
              <div><Label>Observação</Label><Input value={entryNotes} onChange={(e)=>setEntryNotes(e.target.value)} placeholder="Ex.: depósito de julho"/></div>
              <div className="flex gap-2"><Button type="submit" className="rounded-full">{editingId ? "Salvar" : "Adicionar"}</Button>{editingId&&<Button type="button" variant="outline" className="rounded-full" onClick={()=>{setEditingId(null);setEntryAmount("");setEntryNotes("");}}>Cancelar</Button>}</div>
            </form>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
            <h2 className="font-display text-2xl text-ink">Histórico</h2>
            {savings.value.entries.length===0?<p className="text-sm text-muted-foreground mt-3">Nenhum lançamento ainda.</p>:<div className="mt-4 space-y-2">{savings.value.entries.map((item)=><div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-2xl bg-secondary/40"><div className="flex-1"><b className="text-ink">{money(item.amount)}</b><div className="text-xs text-muted-foreground">{new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")}{item.notes?` · ${item.notes}`:""}</div></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>editSaving(item)}>Editar</Button><Button size="sm" variant="ghost" onClick={()=>deleteSaving(item.id)}>Excluir</Button></div></div>)}</div>}
          </div>
        </TabsContent>

        <TabsContent value="prioridades" className="mt-6 space-y-5">
          <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5"><Target className="h-5 w-5 text-olive"/><div><h2 className="font-display text-2xl text-ink">O que importa para você</h2><p className="text-sm text-muted-foreground">O futuro otimizador de rota deve preservar os itens marcados como imperdíveis.</p></div></div>
            <form onSubmit={addPriority} className="grid md:grid-cols-2 gap-3">
              <div><Label>Quero fazer</Label><Input value={priorityTitle} onChange={(e)=>setPriorityTitle(e.target.value)} placeholder="Ex.: treinar jiu-jitsu" required/></div>
              <div><Label>Cidade</Label><Input value={priorityCity} onChange={(e)=>setPriorityCity(e.target.value)} /></div>
              <div><Label>Prioridade</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={priorityLevel} onChange={(e)=>setPriorityLevel(e.target.value as PriorityLevel)}><option>Imperdível</option><option>Desejável</option><option>Opcional</option></select></div>
              <div><Label>Observação</Label><Input value={priorityNotes} onChange={(e)=>setPriorityNotes(e.target.value)} placeholder="Detalhes, horário, ideia…"/></div>
              <Button className="rounded-full md:w-fit">Adicionar prioridade</Button>
            </form>
          </div>
          <div className="grid md:grid-cols-2 gap-3">{priorities.value.map((item)=><div key={item.id} className="rounded-3xl bg-card border border-border/60 p-5 shadow-card"><div className="text-[10px] uppercase tracking-wider text-olive">{item.city || "Sem cidade"}</div><h3 className="font-display text-2xl text-ink mt-1">{item.title}</h3><span className="inline-block mt-3 text-xs rounded-full px-3 py-1 bg-gold/15 border border-gold/30">{item.level}</span>{item.notes&&<p className="text-sm text-muted-foreground mt-3">{item.notes}</p>}<Button size="sm" variant="ghost" className="mt-3" onClick={()=>{if(confirm("Excluir esta prioridade?"))priorities.setValue((v)=>v.filter((x)=>x.id!==item.id));}}>Excluir</Button></div>)}</div>
        </TabsContent>

        <TabsContent value="alertas" className="mt-6">
          <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><h2 className="font-display text-2xl text-ink">O que deve chamar sua atenção</h2><p className="text-sm text-muted-foreground mt-2 mb-5">Preferências pessoais para a Central de Alertas.</p><div className="space-y-3">{([['flights','Queda de preço de voos'],['currency','Euro/libra em faixa interessante'],['checklist','Prazos do checklist'],['lodging','Hospedagem e cancelamento'],['events','Eventos e experiências locais']] as [keyof AlertPrefs,string][]).map(([key,label])=><label key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/40"><span className="text-sm text-ink">{label}</span><input type="checkbox" className="h-5 w-5" checked={alerts.value[key]} onChange={(e)=>alerts.setValue((v)=>({...v,[key]:e.target.checked}))}/></label>)}</div></div>
        </TabsContent>
      </Tabs>
    </div>
  </div>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-card"><div className="text-[10px] uppercase tracking-wider text-olive">{label}</div><div className="font-display text-2xl text-ink mt-1">{value}</div></div>}
