import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, Edit3, Loader2, LockKeyhole, Plus, ReceiptText, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

type Cur = "BRL" | "EUR" | "GBP" | "CHF";
type Expense = {
  id: string;
  description: string;
  expense_date: string;
  amount: number;
  currency: Cur;
  category: string;
  notes: string | null;
  shared_expense_id: string | null;
};
const CURRENCIES: Cur[] = ["BRL","EUR","GBP","CHF"];
const CATEGORIES = ["Transporte","Alimentação","Hospedagem","Curso","Compras","Passeios","Outros"];
const money=(n:number,c:Cur)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:c}).format(n||0);
const today=()=>new Date().toLocaleDateString("en-CA");

export function PersonalExpenses(){
  const {user}=useAuth();
  const [entries,setEntries]=useState<Expense[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [currency,setCurrency]=useState<Cur>("BRL");
  const [description,setDescription]=useState("");
  const [amount,setAmount]=useState("");
  const [category,setCategory]=useState("Outros");
  const [date,setDate]=useState(today());
  const [notes,setNotes]=useState("");
  const [editing,setEditing]=useState<string|null>(null);
  const [showForm,setShowForm]=useState(false);
  const [failure,setFailure]=useState("");

  const load=async()=>{
    if(!user?.id){setLoading(false);return;}
    setLoading(true);setFailure("");
    try{
      const {data,error}=await supabase.from("personal_expenses")
        .select("id,description,expense_date,amount,currency,category,notes,shared_expense_id")
        .eq("user_id",user.id).order("expense_date",{ascending:false});
      if(error)throw error;
      setEntries((data||[]) as Expense[]);
    }catch(e:any){
      setFailure(e?.message||"Não foi possível consultar os gastos.");
    }finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[user?.id]);

  const summary=useMemo(()=>{
    const group:Record<Cur,{total:number;private:number;shared:number}> = {
      BRL:{total:0,private:0,shared:0},EUR:{total:0,private:0,shared:0},
      GBP:{total:0,private:0,shared:0},CHF:{total:0,private:0,shared:0}
    };
    entries.forEach(x=>{
      const value=Number(x.amount);
      if(!group[x.currency])return;
      group[x.currency].total+=value;
      if(x.shared_expense_id)group[x.currency].shared+=value;
      else group[x.currency].private+=value;
    });
    return group;
  },[entries]);
  const clear=()=>{setDescription("");setAmount("");setCategory("Outros");setDate(today());setNotes("");setEditing(null);setShowForm(false);};
  const edit=(x:Expense)=>{
    if(x.shared_expense_id)return;
    setDescription(x.description);setAmount(String(x.amount));setCurrency(x.currency);
    setCategory(x.category);setDate(x.expense_date);setNotes(x.notes||"");setEditing(x.id);setShowForm(true);
  };
  const submit=async(e:FormEvent)=>{
    e.preventDefault();
    if(!user?.id||busy)return;
    const value=Number(amount.trim().replace(",","."));
    if(!description.trim()||!Number.isFinite(value)||value<=0||Math.abs(value*100-Math.round(value*100))>.001)
      return toast.error("Informe a descrição e um valor válido com até 2 casas decimais.");
    setBusy(true);
    try{
      const input={
        description:description.trim(),amount:value,currency,category,expense_date:date,notes:notes.trim()||null
      };
      const query=editing
        ? supabase.from("personal_expenses").update(input).eq("id",editing).eq("user_id",user.id).is("shared_expense_id",null)
        : supabase.from("personal_expenses").insert({...input,user_id:user.id});
      const {error}=await query;
      if(error)throw error;
      toast.success(editing?"Gasto pessoal atualizado.":"Gasto salvo só na sua conta.");
      clear();await load();
    }catch(e:any){toast.error("Erro ao salvar gasto pessoal.",{description:e?.message});}
    finally{setBusy(false);}
  };
  const remove=async(x:Expense)=>{
    if(x.shared_expense_id)return toast.error("Este gasto já está no rateio. Consulte a área de despesas compartilhadas.");
    if(!window.confirm("Excluir este gasto da sua lista pessoal?"))return;
    setBusy(true);
    try{
      const {error}=await supabase.from("personal_expenses").delete().eq("id",x.id).eq("user_id",user?.id);
      if(error)throw error;
      toast.success("Gasto pessoal excluído.");await load();
    }catch(e:any){toast.error("Não consegui excluir o gasto.",{description:e?.message});}
    finally{setBusy(false);}
  };
  const share=async(x:Expense)=>{
    if(!window.confirm(`Compartilhar "${x.description}" (${money(Number(x.amount),x.currency)}) no rateio? A divisão será igual entre Vanessa, Camila e Danielle. Você poderá ajustar os valores na tela Rateio depois.`))return;
    setBusy(true);
    try{
      const {error}=await supabase.rpc("share_personal_expense",{p_personal_expense_id:x.id});
      if(error)throw error;
      toast.success("Gasto compartilhado no rateio das três.");await load();
    }catch(e:any){toast.error("Não consegui compartilhar este gasto.",{description:e?.message});}
    finally{setBusy(false);}
  };

  return <div className="space-y-5">
    <div className="rounded-[24px] border border-[#e8e5d9] bg-[#f1f3e9] p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid place-items-center h-11 w-11 bg-white rounded-2xl text-olive"><LockKeyhole className="h-5 w-5"/></span>
        <div><h2 className="font-display text-2xl sm:text-3xl text-ink">Seu dinheiro, suas escolhas</h2>
        <p className="text-sm mt-2 leading-relaxed text-[#707c6b]">Tudo começa privado na sua conta. Somente você pode escolher compartilhar uma despesa com as outras viajantes.</p></div>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5 bg-[#e9eadf] rounded-full p-1">
        {CURRENCIES.map(cur=><button key={cur} onClick={()=>setCurrency(cur)} type="button"
          className={"rounded-full min-h-10 px-4 text-xs font-semibold transition-all "+(currency===cur?"bg-white shadow-sm text-olive":"text-muted-foreground")}>{cur}</button>)}
      </div>
      <Button onClick={()=>{clear();setShowForm(true);}} className="min-h-11 rounded-full"><Plus className="h-4 w-4 mr-2"/>Lançar gasto</Button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <Metric title="Total registrado" value={money(summary[currency].total,currency)}/>
      <Metric title="Apenas pessoal" value={money(summary[currency].private,currency)}/>
      <Metric title="Compartilhado" value={money(summary[currency].shared,currency)}/>
    </div>
    {showForm&&<form onSubmit={submit} className="rounded-[24px] border border-gold/30 bg-card p-5 sm:p-6 space-y-4 shadow-card">
      <div className="flex justify-between gap-3 items-center"><h3 className="font-display text-2xl">{editing?"Editar gasto pessoal":"Novo gasto pessoal"}</h3>
        <button type="button" onClick={clear} className="min-h-10 px-3 text-sm text-muted-foreground">Cancelar</button></div>
      <div><Label htmlFor="personal-desc">Descrição</Label><Input id="personal-desc" required value={description} onChange={e=>setDescription(e.target.value)} className="h-12 mt-1" placeholder="Ex.: museu, almoço, seguro"/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="personal-amount">Valor</Label><Input id="personal-amount" required type="number" min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)} className="h-12 mt-1"/></div>
        <div><Label htmlFor="personal-cur">Moeda</Label><select id="personal-cur" value={currency} onChange={e=>setCurrency(e.target.value as Cur)} className="h-12 mt-1 border border-input bg-background rounded-xl w-full px-3">{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><Label htmlFor="personal-date">Data</Label><Input id="personal-date" type="date" required value={date} onChange={e=>setDate(e.target.value)} className="h-12 mt-1"/></div>
        <div><Label htmlFor="personal-category">Categoria</Label><select id="personal-category" value={category} onChange={e=>setCategory(e.target.value)} className="h-12 mt-1 border border-input bg-background rounded-xl w-full px-2 text-sm">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      </div>
      <div><Label htmlFor="personal-notes">Observação (opcional)</Label><Input id="personal-notes" value={notes} onChange={e=>setNotes(e.target.value)} className="h-11 mt-1" placeholder="Detalhes para lembrar depois"/></div>
      <Button type="submit" disabled={busy} className="w-full h-12 rounded-full">{busy?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:null}{editing?"Salvar alterações":"Salvar como pessoal"}</Button>
      <p className="text-xs text-muted-foreground">Registrar aqui não gera dívida no Rateio.</p>
    </form>}
    {failure&&<div role="alert" className="border border-destructive/25 rounded-xl p-4 text-sm text-destructive">{failure}<Button variant="outline" className="mt-3" onClick={()=>void load()}>Tentar novamente</Button></div>}
    {loading?<div className="flex gap-2 items-center text-sm text-muted-foreground py-5"><Loader2 className="h-4 w-4 animate-spin"/>Atualizando seus gastos…</div>:(
      <div className="rounded-[24px] border border-[#e7e4da] bg-card p-4 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-4"><h3 className="font-display text-2xl">Meus lançamentos</h3><span className="text-xs text-muted-foreground">{entries.filter(x=>x.currency===currency).length} nesta moeda</span></div>
        <div className="space-y-3">
          {entries.filter(x=>x.currency===currency).map(x=><div key={x.id} className="rounded-2xl border border-border/60 p-4">
            <div className="flex items-start gap-3 justify-between">
              <div className="min-w-0"><p className="font-medium text-sm text-ink">{x.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{x.expense_date.split("-").reverse().join("/")} · {x.category}</p>
              </div>
              <div className="shrink-0 text-right"><strong className="text-sm tabular-nums">{money(Number(x.amount),x.currency)}</strong>
                <p className={"text-[11px] mt-1 flex gap-1 justify-end items-center "+(x.shared_expense_id?"text-olive":"text-muted-foreground")}>{x.shared_expense_id?<><Users className="h-3 w-3"/>No Rateio</>:<><LockKeyhole className="h-3 w-3"/>Privado</>}</p>
              </div>
            </div>
            {x.notes&&<p className="text-xs text-muted-foreground mt-2">{x.notes}</p>}
            <div className="flex gap-3 flex-wrap border-t border-border/50 pt-2 mt-3 text-xs">
              {!x.shared_expense_id?<><button type="button" disabled={busy} className="inline-flex min-h-9 items-center gap-1.5 text-olive" onClick={()=>void share(x)}><Users className="h-3.5 w-3.5"/>Compartilhar no Rateio</button>
                <button type="button" onClick={()=>edit(x)} className="inline-flex min-h-9 items-center gap-1.5"><Edit3 className="h-3.5 w-3.5"/>Editar</button>
                <button type="button" disabled={busy} onClick={()=>void remove(x)} className="inline-flex min-h-9 items-center gap-1.5 text-[#a36c60]"><Trash2 className="h-3.5 w-3.5"/>Excluir</button></>:
                <Link to="/rateio" className="inline-flex items-center gap-2 min-h-9 text-olive">Ver no Rateio <ArrowRight className="h-3.5 w-3.5"/></Link>}
            </div>
          </div>)}
          {entries.filter(x=>x.currency===currency).length===0&&<div className="py-10 text-center text-muted-foreground"><ReceiptText className="h-8 w-8 mx-auto text-olive/35"/><p className="text-sm mt-3">Nenhum gasto pessoal nesta moeda.</p></div>}
        </div>
      </div>
    )}
  </div>;
}
function Metric({title,value}:{title:string;value:string}){
  return <div className="rounded-2xl bg-card border border-border/60 p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-2 font-display text-xl sm:text-2xl text-ink break-words">{value}</p></div>;
}
