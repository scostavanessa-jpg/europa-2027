import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";

type Participant = { id: string; name: string };
type ExpenseRow = { id: string; description: string; expense_date: string; total_amount: number; currency: string; paid_by: string | null; notes: string | null };
type ShareRow = { id: string; expense_id: string; participant_id: string; share_amount: number; paid_back: boolean };
type PersonName = "Vanessa" | "Camila" | "Danielle";
const PEOPLE: PersonName[] = ["Vanessa", "Camila", "Danielle"];
const money = (v:number,currency:string) => new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(v||0);

export default function Rateio(){
  const [people,setPeople]=useState<Participant[]>([]);
  const [expenses,setExpenses]=useState<ExpenseRow[]>([]);
  const [shares,setShares]=useState<ShareRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);

  const[description,setDescription]=useState("");
  const[date,setDate]=useState(new Date().toISOString().slice(0,10));
  const[amount,setAmount]=useState("");
  const[currency,setCurrency]=useState("EUR");
  const[paidBy,setPaidBy]=useState<PersonName>("Vanessa");
  const[participants,setParticipants]=useState<PersonName[]>([...PEOPLE]);
  const[notes,setNotes]=useState("");

  const load=async()=>{
    setLoading(true);
    try{
      const [peopleRes,expRes,shareRes]=await Promise.all([
        supabase.from("participants").select("id,name").eq("active",true).order("name"),
        supabase.from("expenses").select("id,description,expense_date,total_amount,currency,paid_by,notes").order("expense_date",{ascending:false}),
        supabase.from("expense_shares").select("id,expense_id,participant_id,share_amount,paid_back"),
      ]);
      if(peopleRes.error) throw peopleRes.error;
      if(expRes.error) throw expRes.error;
      if(shareRes.error) throw shareRes.error;
      setPeople((peopleRes.data??[]) as Participant[]);
      setExpenses((expRes.data??[]) as ExpenseRow[]);
      setShares((shareRes.data??[]) as ShareRow[]);
    }catch(err:any){toast.error("Não consegui abrir o rateio compartilhado.",{description:err?.message});}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[]);

  const byName=(name:PersonName)=>people.find(p=>p.name===name);
  const nameById=(id:string|null)=>people.find(p=>p.id===id)?.name??"—";
  const toggle=(p:PersonName)=>setParticipants(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);

  const submit=async(e:FormEvent)=>{
    e.preventDefault();
    const value=Number(amount.replace(",","."));
    if(!description.trim()||!value||value<=0)return toast.error("Preencha descrição e valor.");
    if(!participants.length)return toast.error("Selecione quem participa da despesa.");
    const payer=byName(paidBy);
    const selected=participants.map(byName).filter(Boolean) as Participant[];
    if(!payer||selected.length!==participants.length)return toast.error("Os perfis do grupo ainda não foram carregados corretamente.");

    setBusy(true);
    try{
      const {data:expense,error}=await supabase.from("expenses").insert({
        description:description.trim(),expense_date:date,total_amount:value,currency,paid_by:payer.id,category:"viagem",notes:notes.trim()||null,status:"open"
      }).select("id,description,expense_date,total_amount,currency,paid_by,notes").single();
      if(error)throw error;
      const share=value/selected.length;
      const {data:createdShares,error:shareError}=await supabase.from("expense_shares").insert(selected.map(p=>({expense_id:expense.id,participant_id:p.id,share_amount:share}))).select("id,expense_id,participant_id,share_amount,paid_back");
      if(shareError){await supabase.from("expenses").delete().eq("id",expense.id);throw shareError;}
      setExpenses(v=>[expense as ExpenseRow,...v]);
      setShares(v=>[...v,...((createdShares??[]) as ShareRow[])]);
      setDescription("");setAmount("");setNotes("");
      toast.success("Despesa salva para as três.");
    }catch(err:any){toast.error("Não consegui salvar a despesa.",{description:err?.message});}
    finally{setBusy(false);}
  };

  const remove=async(id:string)=>{
    if(!confirm("Excluir esta despesa do rateio compartilhado?"))return;
    try{
      const shareDelete=await supabase.from("expense_shares").delete().eq("expense_id",id);
      if(shareDelete.error)throw shareDelete.error;
      const expDelete=await supabase.from("expenses").delete().eq("id",id);
      if(expDelete.error)throw expDelete.error;
      setShares(v=>v.filter(x=>x.expense_id!==id));
      setExpenses(v=>v.filter(x=>x.id!==id));
    }catch(err:any){toast.error("Não consegui excluir.",{description:err?.message});}
  };

  const summaries=useMemo(()=>{
    const byCurrency:Record<string,Record<PersonName,number>>={};
    for(const exp of expenses){
      const payer=nameById(exp.paid_by) as PersonName;
      if(!PEOPLE.includes(payer))continue;
      const net=byCurrency[exp.currency]??(byCurrency[exp.currency]={Vanessa:0,Camila:0,Danielle:0});
      net[payer]+=Number(exp.total_amount);
      for(const share of shares.filter(s=>s.expense_id===exp.id)){
        const person=nameById(share.participant_id) as PersonName;
        if(PEOPLE.includes(person))net[person]-=Number(share.share_amount);
      }
    }
    return Object.entries(byCurrency).map(([cur,net])=>({cur,settlements:settle(net)}));
  },[expenses,shares,people]);

  if(loading)return <div className="min-h-screen bg-background grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-olive"/></div>;

  return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-5xl px-5 md:px-6 py-10 md:py-14">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="h-4 w-4"/>Voltar à viagem</Link>
    <div className="mt-7 mb-8"><p className="text-xs tracking-[0.3em] uppercase text-olive">Despesas compartilhadas</p><h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Rateio da viagem</h1><p className="text-muted-foreground mt-2">Agora este rateio é realmente compartilhado: o que uma registrar, as outras enxergam.</p></div>

    <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><div className="flex items-center gap-3 mb-5"><ReceiptText className="h-5 w-5 text-olive"/><h2 className="font-display text-2xl text-ink">Nova despesa</h2></div>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <div><Label>Descrição</Label><Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: hotel em Milão" required/></div>
        <div><Label>Data</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div>
        <div><Label>Valor</Label><Input type="number" step="0.01" min="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required/></div>
        <div><Label>Moeda</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)}><option>EUR</option><option>GBP</option><option>CHF</option><option>BRL</option></select></div>
        <div><Label>Quem pagou</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={paidBy} onChange={e=>setPaidBy(e.target.value as PersonName)}>{PEOPLE.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><Label>Quem participa</Label><div className="flex flex-wrap gap-2 mt-2">{PEOPLE.map(p=><label key={p} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="checkbox" checked={participants.includes(p)} onChange={()=>toggle(p)}/>{p}</label>)}</div></div>
        <div className="md:col-span-2"><Label>Observação</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional"/></div>
        <Button className="rounded-full md:w-fit" disabled={busy}>{busy?"Salvando…":"Adicionar despesa"}</Button>
      </form>
    </div>

    <div className="grid md:grid-cols-2 gap-5 mt-6">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card"><h2 className="font-display text-2xl text-ink">Despesas</h2>{expenses.length===0?<p className="text-sm text-muted-foreground mt-3">Nenhuma despesa compartilhada registrada.</p>:<div className="mt-4 space-y-3">{expenses.map(exp=>{const expShares=shares.filter(s=>s.expense_id===exp.id);const names=expShares.map(s=>nameById(s.participant_id));return <div key={exp.id} className="rounded-2xl bg-secondary/40 p-4"><div className="flex gap-3 justify-between"><div><b className="text-ink">{exp.description}</b><p className="text-xs text-muted-foreground mt-1">{new Date(`${exp.expense_date}T12:00:00`).toLocaleDateString("pt-BR")} · pago por {nameById(exp.paid_by)}</p></div><b className="text-olive whitespace-nowrap">{money(Number(exp.total_amount),exp.currency)}</b></div><p className="text-xs text-muted-foreground mt-2">Participam: {names.join(", ") || "—"}</p>{exp.notes&&<p className="text-xs text-muted-foreground mt-1">{exp.notes}</p>}<Button size="sm" variant="ghost" className="mt-2" onClick={()=>void remove(exp.id)}>Excluir</Button></div>})}</div>}</div>
      <div className="rounded-3xl border border-gold/30 bg-gradient-warm p-6 shadow-card"><h2 className="font-display text-2xl text-ink">Quem deve a quem</h2>{summaries.length===0?<p className="text-sm text-muted-foreground mt-3">O resumo aparece assim que houver despesas.</p>:<div className="mt-4 space-y-5">{summaries.map(s=><div key={s.cur}><div className="text-xs uppercase tracking-wider text-olive mb-2">{s.cur}</div>{s.settlements.length===0?<p className="text-sm text-muted-foreground">Tudo equilibrado.</p>:<div className="space-y-2">{s.settlements.map((x,i)=><div key={i} className="rounded-2xl bg-card/80 border border-border/50 p-3 text-sm"><b>{x.from}</b> paga <b>{x.to}</b> <span className="text-olive font-semibold">{money(x.amount,s.cur)}</span></div>)}</div>}</div>)}</div>}</div>
    </div>
  </div></div>;
}

function settle(net:Record<PersonName,number>){const debtors=PEOPLE.map(p=>({p,v:net[p]})).filter(x=>x.v<-.005).sort((a,b)=>a.v-b.v);const creditors=PEOPLE.map(p=>({p,v:net[p]})).filter(x=>x.v>.005).sort((a,b)=>b.v-a.v);const out:{from:PersonName;to:PersonName;amount:number}[]=[];let i=0,j=0;while(i<debtors.length&&j<creditors.length){const amount=Math.min(-debtors[i].v,creditors[j].v);out.push({from:debtors[i].p,to:creditors[j].p,amount});debtors[i].v+=amount;creditors[j].v-=amount;if(Math.abs(debtors[i].v)<.005)i++;if(Math.abs(creditors[j].v)<.005)j++;}return out;}
