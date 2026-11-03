import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Loader2, PiggyBank, Sparkles, Target, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { PersonalExpenses } from "@/components/travel/PersonalExpenses";

type SavingGoal = { id: string; target_total_brl: number; monthly_target_brl: number; notes: string | null };
type SavingEntry = { id: string; entry_date: string; amount_brl: number; notes: string | null };
type PriorityLevel = "Imperdível" | "Desejável" | "Opcional";
type PriorityItem = { id: string; title: string; city: string | null; priority: string; notes: string | null };
type AlertPrefs = { flights: boolean; currency: boolean; checklist: boolean; lodging: boolean; events: boolean };

const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const defaultAlerts: AlertPrefs = { flights: true, currency: true, checklist: true, lodging: true, events: true };

export default function MinhaViagem() {
  const { user, profile, participant } = useAuth();
  const [loading,setLoading]=useState(true);
  const [goal,setGoal]=useState<SavingGoal | null>(null);
  const [entries,setEntries]=useState<SavingEntry[]>([]);
  const [priorities,setPriorities]=useState<PriorityItem[]>([]);
  const [alerts,setAlerts]=useState<AlertPrefs>(defaultAlerts);
  const [hasAlerts,setHasAlerts]=useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryAmount, setEntryAmount] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [priorityTitle, setPriorityTitle] = useState("");
  const [priorityCity, setPriorityCity] = useState("Liverpool");
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>("Desejável");
  const [priorityNotes, setPriorityNotes] = useState("");

  const name = profile?.display_name || participant?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Viajante";
  const targetTotal=Number(goal?.target_total_brl ?? 10220);
  const monthlyTarget=Number(goal?.monthly_target_brl ?? 600);
  const totalSaved = useMemo(() => entries.reduce((sum, item) => sum + Number(item.amount_brl || 0), 0), [entries]);
  const pending = Math.max(0, targetTotal - totalSaved);
  const progress = targetTotal > 0 ? Math.min(100, (totalSaved / targetTotal) * 100) : 0;

  const load=async()=>{
    if(!user?.id||!participant?.id){setLoading(false);return;}
    setLoading(true);
    try{
      const [goalRes,entriesRes,prioritiesRes,alertsRes]=await Promise.all([
        supabase.from("savings_goals").select("id,target_total_brl,monthly_target_brl,notes").eq("participant_id",participant.id).maybeSingle(),
        supabase.from("savings_entries").select("id,entry_date,amount_brl,notes").eq("participant_id",participant.id).order("entry_date",{ascending:false}),
        supabase.from("personal_priorities").select("id,title,city,priority,notes").eq("user_id",user.id).order("created_at",{ascending:false}),
        supabase.from("alert_preferences").select("flights,currency,checklist,lodging,events").eq("user_id",user.id).maybeSingle(),
      ]);
      if(goalRes.error)throw goalRes.error;if(entriesRes.error)throw entriesRes.error;if(prioritiesRes.error)throw prioritiesRes.error;if(alertsRes.error)throw alertsRes.error;
      setGoal(goalRes.data as SavingGoal|null);
      setEntries((entriesRes.data??[]) as SavingEntry[]);
      setPriorities((prioritiesRes.data??[]) as PriorityItem[]);
      if(alertsRes.data){setAlerts(alertsRes.data as AlertPrefs);setHasAlerts(true);}else{setAlerts(defaultAlerts);setHasAlerts(false);}
    }catch(err:any){toast.error("Não consegui carregar sua área pessoal.",{description:err?.message});}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[user?.id,participant?.id]);

  const saveGoal=async(patch:{target_total_brl?:number;monthly_target_brl?:number})=>{
    if(!participant?.id)return;
    try{
      if(goal?.id){const {data,error}=await supabase.from("savings_goals").update(patch).eq("id",goal.id).select("id,target_total_brl,monthly_target_brl,notes").single();if(error)throw error;setGoal(data as SavingGoal);}
      else{const {data,error}=await supabase.from("savings_goals").insert({participant_id:participant.id,target_total_brl:patch.target_total_brl??targetTotal,monthly_target_brl:patch.monthly_target_brl??monthlyTarget}).select("id,target_total_brl,monthly_target_brl,notes").single();if(error)throw error;setGoal(data as SavingGoal);}
    }catch(err:any){toast.error("Não consegui salvar a meta.",{description:err?.message});}
  };

  const submitSaving=async(e:FormEvent)=>{
    e.preventDefault();if(!participant?.id)return;
    const amount=Number(entryAmount.replace(",","."));if(!amount||amount<=0)return toast.error("Informe um valor válido.");
    try{
      if(editingId){const {data,error}=await supabase.from("savings_entries").update({entry_date:entryDate,amount_brl:amount,notes:entryNotes.trim()||null}).eq("id",editingId).select("id,entry_date,amount_brl,notes").single();if(error)throw error;setEntries(v=>v.map(x=>x.id===editingId?data as SavingEntry:x));}
      else{const {data,error}=await supabase.from("savings_entries").insert({participant_id:participant.id,entry_date:entryDate,amount_brl:amount,notes:entryNotes.trim()||null}).select("id,entry_date,amount_brl,notes").single();if(error)throw error;setEntries(v=>[data as SavingEntry,...v]);}
      toast.success(editingId?"Lançamento atualizado.":"Valor guardado registrado.");setEditingId(null);setEntryAmount("");setEntryNotes("");
    }catch(err:any){toast.error("Não consegui salvar o lançamento.",{description:err?.message});}
  };

  const editSaving=(item:SavingEntry)=>{setEditingId(item.id);setEntryDate(item.entry_date);setEntryAmount(String(item.amount_brl));setEntryNotes(item.notes||"");window.scrollTo({top:0,behavior:"smooth"});};
  const deleteSaving=async(id:string)=>{if(!confirm("Excluir este lançamento?"))return;const{error}=await supabase.from("savings_entries").delete().eq("id",id);if(error)return toast.error("Não consegui excluir.",{description:error.message});setEntries(v=>v.filter(x=>x.id!==id));};

  const addPriority=async(e:FormEvent)=>{
    e.preventDefault();if(!user?.id||!priorityTitle.trim())return;
    try{const{data,error}=await supabase.from("personal_priorities").insert({user_id:user.id,title:priorityTitle.trim(),city:priorityCity.trim()||null,priority:priorityLevel,notes:priorityNotes.trim()||null}).select("id,title,city,priority,notes").single();if(error)throw error;setPriorities(v=>[data as PriorityItem,...v]);setPriorityTitle("");setPriorityNotes("");toast.success("Prioridade salva.");}catch(err:any){toast.error("Não consegui salvar a prioridade.",{description:err?.message});}
  };
  const deletePriority=async(id:string)=>{if(!confirm("Excluir esta prioridade?"))return;const{error}=await supabase.from("personal_priorities").delete().eq("id",id);if(error)return toast.error("Não consegui excluir.",{description:error.message});setPriorities(v=>v.filter(x=>x.id!==id));};

  const toggleAlert=async(key:keyof AlertPrefs,value:boolean)=>{
    if(!user?.id)return;
    const next={...alerts,[key]:value};setAlerts(next);
    try{
      if(hasAlerts){const{error}=await supabase.from("alert_preferences").update({...next,updated_at:new Date().toISOString()}).eq("user_id",user.id);if(error)throw error;}
      else{const{error}=await supabase.from("alert_preferences").insert({user_id:user.id,...next});if(error)throw error;setHasAlerts(true);}
    }catch(err:any){setAlerts(alerts);toast.error("Não consegui salvar sua preferência.",{description:err?.message});}
  };

  if(loading)return <div className="min-h-screen bg-background grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-olive"/></div>;
  if(!participant)return <div className="min-h-screen bg-background grid place-items-center px-6"><div className="max-w-md text-center"><h1 className="font-display text-3xl text-ink">Seu perfil ainda não foi vinculado</h1><p className="text-sm text-muted-foreground mt-3">Saia e entre novamente para o site concluir o vínculo do seu acesso com a viajante escolhida.</p><Link to="/grupo"><Button className="rounded-full mt-5">Ir para minha conta</Button></Link></div></div>;

  return <div className="min-h-screen bg-background text-foreground"><div className="container mx-auto max-w-5xl px-5 md:px-6 py-10 md:py-14">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="h-4 w-4"/>Voltar à viagem</Link>
    <div className="mt-7 mb-8"><p className="text-xs tracking-[0.3em] uppercase text-olive">Área pessoal · salva na nuvem</p><h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Minha viagem</h1><p className="text-muted-foreground mt-2">{name} · cofrinho, gastos privados, desejos e preferências pessoais. Seus dados aparecem em qualquer aparelho em que você entrar.</p></div>

    <Tabs defaultValue="cofrinho"><TabsList className="w-full justify-start overflow-x-auto bg-secondary/60"><TabsTrigger value="cofrinho"><PiggyBank className="h-4 w-4 mr-1.5"/>Cofrinho</TabsTrigger><TabsTrigger value="gastos"><ReceiptText className="h-4 w-4 mr-1.5"/>Gastos</TabsTrigger><TabsTrigger value="prioridades"><Sparkles className="h-4 w-4 mr-1.5"/>Prioridades</TabsTrigger><TabsTrigger value="alertas"><Bell className="h-4 w-4 mr-1.5"/>Alertas</TabsTrigger></TabsList>
      <TabsContent value="cofrinho" className="mt-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-3"><Metric label="Meta total" value={money(targetTotal)}/><Metric label="Guardado" value={money(totalSaved)}/><Metric label="Pendente" value={money(pending)}/><Metric label="Progresso" value={`${progress.toFixed(1)}%`}/></div>
        <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><div className="h-2 rounded-full bg-secondary overflow-hidden mb-6"><div className="h-full bg-olive transition-all" style={{width:`${progress}%`}}/></div>
          <div className="grid sm:grid-cols-2 gap-4 mb-6"><div><Label>Meta total individual</Label><Input type="number" min="0" step="50" value={targetTotal} onChange={e=>setGoal(g=>({id:g?.id||"",notes:g?.notes||null,target_total_brl:Number(e.target.value)||0,monthly_target_brl:g?.monthly_target_brl??monthlyTarget}))} onBlur={e=>void saveGoal({target_total_brl:Number(e.target.value)||0})}/></div><div><Label>Meta mensal</Label><Input type="number" min="0" step="50" value={monthlyTarget} onChange={e=>setGoal(g=>({id:g?.id||"",notes:g?.notes||null,target_total_brl:g?.target_total_brl??targetTotal,monthly_target_brl:Number(e.target.value)||0}))} onBlur={e=>void saveGoal({monthly_target_brl:Number(e.target.value)||0})}/></div></div>
          <form onSubmit={submitSaving} className="grid md:grid-cols-[160px_160px_1fr_auto] gap-3 items-end"><div><Label>Data</Label><Input type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} required/></div><div><Label>Valor</Label><Input type="number" min="0.01" step="0.01" value={entryAmount} onChange={e=>setEntryAmount(e.target.value)} placeholder="0,00" required/></div><div><Label>Observação</Label><Input value={entryNotes} onChange={e=>setEntryNotes(e.target.value)} placeholder="Ex.: depósito de julho"/></div><div className="flex gap-2"><Button type="submit" className="rounded-full">{editingId?"Salvar":"Adicionar"}</Button>{editingId&&<Button type="button" variant="outline" className="rounded-full" onClick={()=>{setEditingId(null);setEntryAmount("");setEntryNotes("");}}>Cancelar</Button>}</div></form>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card"><h2 className="font-display text-2xl text-ink">Histórico</h2>{entries.length===0?<p className="text-sm text-muted-foreground mt-3">Nenhum lançamento ainda.</p>:<div className="mt-4 space-y-2">{entries.map(item=><div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-2xl bg-secondary/40"><div className="flex-1"><b className="text-ink">{money(Number(item.amount_brl))}</b><div className="text-xs text-muted-foreground">{new Date(`${item.entry_date}T12:00:00`).toLocaleDateString("pt-BR")}{item.notes?` · ${item.notes}`:""}</div></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>editSaving(item)}>Editar</Button><Button size="sm" variant="ghost" onClick={()=>void deleteSaving(item.id)}>Excluir</Button></div></div>)}</div>}</div>
      </TabsContent>

      <TabsContent value="gastos" className="mt-6"><PersonalExpenses/></TabsContent>

      <TabsContent value="prioridades" className="mt-6 space-y-5"><div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><div className="flex items-center gap-3 mb-5"><Target className="h-5 w-5 text-olive"/><div><h2 className="font-display text-2xl text-ink">O que importa para você</h2><p className="text-sm text-muted-foreground">Suas prioridades ficam privadas na sua conta.</p></div></div><form onSubmit={addPriority} className="grid md:grid-cols-2 gap-3"><div><Label>Quero fazer</Label><Input value={priorityTitle} onChange={e=>setPriorityTitle(e.target.value)} placeholder="Ex.: treinar jiu-jitsu" required/></div><div><Label>Cidade</Label><Input value={priorityCity} onChange={e=>setPriorityCity(e.target.value)}/></div><div><Label>Prioridade</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={priorityLevel} onChange={e=>setPriorityLevel(e.target.value as PriorityLevel)}><option>Imperdível</option><option>Desejável</option><option>Opcional</option></select></div><div><Label>Observação</Label><Input value={priorityNotes} onChange={e=>setPriorityNotes(e.target.value)} placeholder="Detalhes, horário, ideia…"/></div><Button className="rounded-full md:w-fit">Adicionar prioridade</Button></form></div>
        <div className="grid md:grid-cols-2 gap-3">{priorities.length===0?<p className="text-sm text-muted-foreground">Nenhuma prioridade ainda.</p>:priorities.map(item=><div key={item.id} className="rounded-3xl bg-card border border-border/60 p-5 shadow-card"><div className="text-[10px] uppercase tracking-wider text-olive">{item.city||"Sem cidade"}</div><h3 className="font-display text-2xl text-ink mt-1">{item.title}</h3><span className="inline-block mt-3 text-xs rounded-full px-3 py-1 bg-gold/15 border border-gold/30">{item.priority}</span>{item.notes&&<p className="text-sm text-muted-foreground mt-3">{item.notes}</p>}<Button size="sm" variant="ghost" className="mt-3" onClick={()=>void deletePriority(item.id)}>Excluir</Button></div>)}</div>
      </TabsContent>

      <TabsContent value="alertas" className="mt-6"><div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><h2 className="font-display text-2xl text-ink">O que deve chamar sua atenção</h2><p className="text-sm text-muted-foreground mt-2 mb-5">Preferências pessoais para a Central de Alertas.</p><div className="space-y-3">{([['flights','Queda de preço de voos'],['currency','Euro/libra em faixa interessante'],['checklist','Prazos do checklist'],['lodging','Hospedagem e cancelamento'],['events','Eventos e experiências locais']] as [keyof AlertPrefs,string][]).map(([key,label])=><label key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/40"><span className="text-sm text-ink">{label}</span><input type="checkbox" className="h-5 w-5" checked={alerts[key]} onChange={e=>void toggleAlert(key,e.target.checked)}/></label>)}</div></div></TabsContent>
    </Tabs>
  </div></div>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-card"><div className="text-[10px] uppercase tracking-wider text-olive">{label}</div><div className="font-display text-2xl text-ink mt-1">{value}</div></div>}
