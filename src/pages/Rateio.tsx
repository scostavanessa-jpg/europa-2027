import { TrainWatermark } from "@/components/travel/TrainWatermark";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, ArrowRightLeft, Check, ChevronDown, CircleCheck, Coffee,
  CreditCard, GraduationCap, Hotel, Loader2, MapPinned, Plus, ReceiptText,
  Search, SlidersHorizontal, Trash2, TrainFront, Wallet, X, Pencil, Copy, Download
} from "lucide-react";

type PersonName = "Vanessa" | "Camila" | "Danielle";
type Currency = "EUR" | "GBP" | "CHF" | "BRL";
type Section = "summary" | "expenses" | "settlements";
type Category = "Hospedagem" | "Transporte" | "Alimentação" | "Passeios" | "Curso" | "Compras" | "Outros";
type SplitMode = "equal" | "exact" | "percentage";
type Participant = { id: string; name: string };
type Expense = { id: string; description: string; expense_date: string; total_amount: number; currency: Currency; paid_by: string | null; category: string | null; notes: string | null };
type Share = { id: string; expense_id: string; participant_id: string; share_amount: number };
type Settlement = { id: string; payer_id: string; payee_id: string; amount: number; currency: Currency; settled_at: string; notes: string | null };
type Transfer = { from: PersonName; to: PersonName; amount: number };
const PEOPLE: PersonName[] = ["Vanessa", "Camila", "Danielle"];
const CURRENCIES: Currency[] = ["EUR", "GBP", "BRL", "CHF"];
const CATEGORIES: Category[] = ["Hospedagem", "Transporte", "Alimentação", "Passeios", "Curso", "Compras", "Outros"];
const categoryIcon: Record<Category, typeof Hotel> = {
  Hospedagem: Hotel, Transporte: TrainFront, Alimentação: Coffee, Passeios: MapPinned,
  Curso: GraduationCap, Compras: CreditCard, Outros: ReceiptText
};
const formatMoney = (value: number, currency: Currency) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value || 0);
const parseMoney = (s: string) => Number(s.trim().replace(",", "."));
const roundCents = (n: number) => Math.round(n * 100);
const shortDate = (date: string) => {
  const parts = String(date || "").split("-");
  return parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : "—";
};
const initials: Record<PersonName, string> = { Vanessa: "V", Camila: "C", Danielle: "D" };
const personStyle: Record<PersonName, string> = {
  Vanessa: "bg-[#dddcc4] text-[#4e5a39]",
  Camila: "bg-[#eddad6] text-[#87594d]",
  Danielle: "bg-[#e1dff2] text-[#675c8b]"
};
function Avatar({ name, size = "md" }: { name: PersonName; size?: "sm" | "md" }) {
  return <span className={"inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white font-semibold shadow-sm " + personStyle[name] + (size === "sm" ? " h-8 w-8 text-[11px]" : " h-11 w-11 text-sm")}>{initials[name]}</span>;
}
function settleBalances(net: Record<PersonName, number>): Transfer[] {
  const debtors = PEOPLE.map(p => ({ p, cents: roundCents(net[p]) })).filter(x => x.cents < 0).sort((a,b)=>a.cents-b.cents);
  const creditors = PEOPLE.map(p => ({ p, cents: roundCents(net[p]) })).filter(x => x.cents > 0).sort((a,b)=>b.cents-a.cents);
  const result: Transfer[] = []; let i=0, j=0;
  while(i<debtors.length && j<creditors.length) {
    const cents = Math.min(-debtors[i].cents, creditors[j].cents);
    if(cents>0) result.push({ from: debtors[i].p, to: creditors[j].p, amount: cents/100 });
    debtors[i].cents+=cents; creditors[j].cents-=cents;
    if(debtors[i].cents===0)i++; if(creditors[j].cents===0)j++;
  }
  return result;
}

export default function Rateio(){
  const [people,setPeople]=useState<Participant[]>([]);
  const [expenses,setExpenses]=useState<Expense[]>([]);
  const [shares,setShares]=useState<Share[]>([]);
  const [settlements,setSettlements]=useState<Settlement[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [busy,setBusy]=useState(false);
  const [section,setSection]=useState<Section>("summary");
  const [activeCurrency,setActiveCurrency]=useState<Currency>("EUR");
  const [search,setSearch]=useState("");
  const [filterCategory,setFilterCategory]=useState("Todas");
  const [filterPerson,setFilterPerson]=useState("Todas");
  const [editorOpen,setEditorOpen]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [description,setDescription]=useState("");
  const [date,setDate]=useState(new Date().toLocaleDateString("en-CA"));
  const [amount,setAmount]=useState("");
  const [currency,setCurrency]=useState<Currency>("EUR");
  const [category,setCategory]=useState<Category>("Outros");
  const [paidBy,setPaidBy]=useState<PersonName>("Vanessa");
  const [participants,setParticipants]=useState<PersonName[]>([...PEOPLE]);
  const [splitMode,setSplitMode]=useState<SplitMode>("equal");
  const [custom,setCustom]=useState<Record<PersonName,string>>({Vanessa:"",Camila:"",Danielle:""});
  const [notes,setNotes]=useState("");

  const personByName=(name:PersonName)=>people.find(p=>p.name===name);
  const nameById=(id:string|null):PersonName|null=>(people.find(p=>p.id===id)?.name as PersonName)||null;

  const load=async()=>{
    setLoading(true);setLoadError("");
    try {
      const [p,e,s,st]=await Promise.all([
        supabase.from("participants").select("id,name").eq("active",true),
        supabase.from("expenses").select("id,description,expense_date,total_amount,currency,paid_by,category,notes").order("expense_date",{ascending:false}),
        supabase.from("expense_shares").select("id,expense_id,participant_id,share_amount"),
        supabase.from("settlements").select("id,payer_id,payee_id,amount,currency,settled_at,notes").order("settled_at",{ascending:false}),
      ]);
      for (const res of [p,e,s,st]) if(res.error) throw res.error;
      setPeople((p.data||[]) as Participant[]);
      setExpenses((e.data||[]) as Expense[]);
      setShares((s.data||[]) as Share[]);
      setSettlements((st.data||[]) as Settlement[]);
    }catch(err:any){
      const msg=err?.message||"Não foi possível consultar os dados.";
      setLoadError(msg);toast.error("Erro ao carregar o rateio",{description:msg});
    }finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[]);

  const summaries=useMemo(()=>{
    const out:Record<Currency,{total:number;count:number;net:Record<PersonName,number>;transfers:Transfer[]}>=
      {} as Record<Currency,{total:number;count:number;net:Record<PersonName,number>;transfers:Transfer[]}>;
    CURRENCIES.forEach(cur=>out[cur]={total:0,count:0,net:{Vanessa:0,Camila:0,Danielle:0},transfers:[]});
    const nameLookup=Object.fromEntries(people.map(p=>[p.id,p.name])) as Record<string,PersonName>;
    const shareMap=new Map<string,Share[]>();
    for(const sh of shares)shareMap.set(sh.expense_id,[...(shareMap.get(sh.expense_id)||[]),sh]);
    for(const exp of expenses){
      const x=out[exp.currency];if(!x)continue;
      x.total+=Number(exp.total_amount);x.count++;
      const payer=exp.paid_by?nameLookup[exp.paid_by]:null;
      if(payer && PEOPLE.includes(payer))x.net[payer]+=Number(exp.total_amount);
      for(const sh of (shareMap.get(exp.id)||[])){
        const name=nameLookup[sh.participant_id];
        if(name && PEOPLE.includes(name))x.net[name]-=Number(sh.share_amount);
      }
    }
    for(const st of settlements){
      const x=out[st.currency];if(!x)continue;
      const from=nameLookup[st.payer_id],to=nameLookup[st.payee_id];
      if(from && to){x.net[from]+=Number(st.amount);x.net[to]-=Number(st.amount);}
    }
    CURRENCIES.forEach(cur=>out[cur].transfers=settleBalances(out[cur].net));
    return out;
  },[expenses,shares,settlements,people]);
  const current=summaries[activeCurrency];

  const openNew=()=>{setEditingId(null);setDescription("");setDate(new Date().toLocaleDateString("en-CA"));
    setAmount("");setCurrency(activeCurrency);setCategory("Outros");setPaidBy("Vanessa");setParticipants([...PEOPLE]);
    setSplitMode("equal");setCustom({Vanessa:"",Camila:"",Danielle:""});setNotes("");setEditorOpen(true);};
  const openEdit=(exp:Expense)=>{
    setEditingId(exp.id);setDescription(exp.description);setDate(exp.expense_date);setAmount(String(exp.total_amount));
    setCurrency(exp.currency);setCategory((CATEGORIES.includes(exp.category as Category)?exp.category:"Outros") as Category);
    setPaidBy(nameById(exp.paid_by)||"Vanessa");setNotes(exp.notes||"");
    const existing=shares.filter(s=>s.expense_id===exp.id);
    const selected=existing.map(s=>nameById(s.participant_id)).filter(Boolean) as PersonName[];
    setParticipants(selected.length?selected:[...PEOPLE]);setSplitMode("exact");
    setCustom(Object.fromEntries(PEOPLE.map(p=>[p, String(existing.find(s=>nameById(s.participant_id)===p)?.share_amount??"")])) as Record<PersonName,string>);
    setEditorOpen(true);
  };
  const toggleParticipant=(name:PersonName)=>setParticipants(p=>p.includes(name)?p.filter(x=>x!==name):[...p,name]);

  const makeShares=()=>{
    const cents=roundCents(parseMoney(amount));
    if(!Number.isFinite(cents)||cents<=0||Math.abs(parseMoney(amount)*100-cents)>.001) throw new Error("Informe um valor positivo com até duas casas decimais.");
    if(participants.length===0)throw new Error("Selecione ao menos uma viajante.");
    const selected=PEOPLE.filter(p=>participants.includes(p));
    let values:number[]=[];
    if(splitMode==="equal"){
      const base=Math.floor(cents/selected.length), rest=cents%selected.length;
      values=selected.map((_,i)=>base+(i<rest?1:0));
    }else if(splitMode==="exact"){
      values=selected.map(p=>roundCents(parseMoney(custom[p])));
      if(values.some((v,i)=>!Number.isFinite(v)||v<0||Math.abs(parseMoney(custom[selected[i]])*100-v)>.001))throw new Error("Preencha valores válidos, com até duas casas decimais.");
      if(values.reduce((a,b)=>a+b,0)!==cents)throw new Error("A soma das partes precisa ser exatamente "+formatMoney(cents/100,currency)+".");
    }else{
      const perc=selected.map(p=>parseMoney(custom[p]));
      if(perc.some(p=>!Number.isFinite(p)||p<0))throw new Error("Preencha os percentuais.");
      if(Math.abs(perc.reduce((a,b)=>a+b,0)-100)>.001)throw new Error("Os percentuais precisam somar 100%.");
      let allocated=0;
      values=perc.map((p,i)=>{if(i===perc.length-1)return cents-allocated;const v=Math.round(cents*p/100);allocated+=v;return v;});
    }
    return selected.map((name,i)=>({name,amount:values[i]/100}));
  };
  const saveExpense=async(e:FormEvent)=>{
    e.preventDefault();if(busy)return;
    if(!description.trim())return toast.error("Dê um nome para a despesa.");
    let split:{name:PersonName;amount:number}[];
    try{split=makeShares();}catch(err:any){toast.error(err.message);return;}
    const payer=personByName(paidBy);
    if(!payer)return toast.error("Não foi possível identificar quem pagou.");
    const list=split.map(item=>({participant_id:personByName(item.name)?.id,share_amount:item.amount}));
    if(list.some(x=>!x.participant_id))return toast.error("Uma das viajantes ainda não está cadastrada no grupo.");
    setBusy(true);
    try{
      const {error}=await supabase.rpc("save_trip_expense",{
        p_expense_id:editingId,
        p_description:description.trim(),p_expense_date:date,p_total_amount:parseMoney(amount),
        p_currency:currency,p_paid_by:payer.id,p_category:category,p_notes:notes.trim()||null,
        p_shares:list
      });
      if(error)throw error;
      toast.success(editingId?"Despesa atualizada para o grupo.":"Despesa adicionada ao grupo.");
      setEditorOpen(false);setActiveCurrency(currency);await load();
    }catch(err:any){toast.error("Não consegui salvar a despesa.",{description:err?.message});}
    finally{setBusy(false);}
  };
  const removeExpense=async(exp:Expense)=>{
    if(!window.confirm("Excluir '"+exp.description+"' para todas as viajantes?"))return;
    setBusy(true);
    try{const {error}=await supabase.from("expenses").delete().eq("id",exp.id);
      if(error)throw error;toast.success("Despesa excluída.");await load();
    }catch(err:any){toast.error("Não foi possível excluir.",{description:err?.message});}finally{setBusy(false);}
  };
  const recordSettlement=async(tr:Transfer)=>{
    if(!window.confirm("Registrar "+formatMoney(tr.amount,activeCurrency)+" pagos por "+tr.from+" a "+tr.to+"? Isso registra um pagamento já feito; não transfere dinheiro."))return;
    const from=personByName(tr.from),to=personByName(tr.to);if(!from||!to)return;
    setBusy(true);
    try{
      const {error}=await supabase.from("settlements").insert({
        payer_id:from.id,payee_id:to.id,amount:tr.amount,currency:activeCurrency,settled_at:new Date().toLocaleDateString("en-CA")
      });
      if(error)throw error;toast.success("Pagamento registrado no grupo.");await load();
    }catch(err:any){toast.error("Não consegui registrar o acerto.",{description:err?.message});}finally{setBusy(false);}
  };
  const undoSettlement=async(st:Settlement)=>{
    if(!window.confirm("Excluir o registro deste acerto? O valor voltará a aparecer no saldo."))return;
    setBusy(true);
    try{const {error}=await supabase.from("settlements").delete().eq("id",st.id);
      if(error)throw error;toast.success("Registro de acerto removido.");await load();
    }catch(err:any){toast.error("Não consegui remover o acerto.",{description:err?.message});}finally{setBusy(false);}
  };
  const filtered=expenses.filter(exp=>{
    if(exp.currency!==activeCurrency)return false;
    if(filterCategory!=="Todas"&&exp.category!==filterCategory)return false;
    if(filterPerson!=="Todas" && nameById(exp.paid_by)!==filterPerson
      && !shares.some(sh=>sh.expense_id===exp.id && nameById(sh.participant_id)===filterPerson))return false;
    return !search.trim()||(exp.description+" "+(exp.notes||"")).toLowerCase().includes(search.toLowerCase().trim());
  });
  const exportStatement = () => {
    const fields = ["Tipo","Data","Descrição","Categoria","Moeda","Valor","Pagador/Origem","Destinatário","Parcela Vanessa","Parcela Camila","Parcela Danielle","Observações"];
    const rows: (string | number)[][] = [fields];
    for(const e of expenses.filter(x=>x.currency===activeCurrency)){
      const distribution = Object.fromEntries(
        PEOPLE.map(name => [name, shares.filter(sh=>sh.expense_id===e.id && nameById(sh.participant_id)===name)
          .reduce((total,sh)=>total+Number(sh.share_amount),0)])
      );
      rows.push(["Despesa",e.expense_date,e.description,e.category||"Outros",e.currency,
        Number(e.total_amount).toFixed(2),nameById(e.paid_by)||"", "",
        ...PEOPLE.map(name=>Number(distribution[name]||0).toFixed(2)),e.notes||""]);
    }
    for(const st of settlements.filter(x=>x.currency===activeCurrency)){
      rows.push(["Acerto",st.settled_at,"Pagamento confirmado","Acerto",st.currency,
        Number(st.amount).toFixed(2),nameById(st.payer_id)||"",nameById(st.payee_id)||"","","","",st.notes||""]);
    }
    const csv = "\uFEFF" + rows.map(row=>row.map(value=>'"'+String(value??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    const anchor = document.createElement("a");
    anchor.href=url;
    anchor.download="Europa-2028-rateio-"+activeCurrency+"-"+new Date().toLocaleDateString("en-CA")+".csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast.success("Extrato exportado em CSV.");
  };

  const copyStatement=async()=>{
    const textLines=["Europa 2028 · Rateio "+activeCurrency,
      "Total de despesas: "+formatMoney(current.total,activeCurrency),
      ...current.transfers.map(t=>t.from+" paga "+t.to+": "+formatMoney(t.amount,activeCurrency))];
    try{await navigator.clipboard.writeText(textLines.join("\n"));toast.success("Resumo copiado.");}
    catch{toast.error("Não consegui copiar neste navegador.");}
  };

  if(loading && !people.length)return <div className="min-h-screen grid place-items-center bg-[#f8f6f1] text-olive"><Loader2 className="animate-spin h-7 w-7"/><span className="mt-3 text-sm">Abrindo o rateio…</span></div>;
  return <div className="min-h-screen bg-[#f8f6f1] text-[#293027] pb-28">
    <div className="relative overflow-hidden bg-[#eeeede] border-b border-[#e0dfd0]">
      <TrainWatermark className="absolute inset-0 pointer-events-none" imageClassName="opacity-[.19] object-[58%_center]" gradientClassName="bg-gradient-to-r from-[#f1f0e7]/95 via-[#f1f0e7]/80 to-[#f1f0e7]/62" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-7 pt-7 pb-9">
        <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="w-4 h-4"/> Voltar à viagem</Link>
        <div className="flex items-end justify-between gap-3 mt-5">
          <div>
            <p className="text-[11px] uppercase tracking-[.25em] text-olive/80 font-semibold">Europa 2028 · Finanças do grupo</p>
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-[.94] mt-3">Tudo dividido.<br/><span className="italic font-light text-olive">Amizade preservada.</span></h1>
            <p className="text-sm text-[#656b60] mt-4 leading-relaxed max-w-lg">O que cada uma pagou, o que falta acertar e o histórico de despesas, sem misturar moedas.</p>
          </div>
          <button type="button" onClick={copyStatement} className="hidden sm:flex min-h-10 items-center gap-2 text-sm text-olive border border-olive/25 bg-white/65 rounded-full px-4"><Copy className="h-4 w-4"/>Copiar resumo</button>
        </div>
      </div>
    </div>

    <main className="mx-auto max-w-6xl px-4 sm:px-7 -mt-1 pt-6">
      {loadError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-5 text-sm text-red-800">Não foi possível carregar os dados: {loadError}<Button variant="outline" onClick={()=>void load()} className="ml-2">Tentar novamente</Button></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5 rounded-full bg-[#eae8db] p-1">
          {CURRENCIES.map(cur=><button key={cur} type="button" onClick={()=>setActiveCurrency(cur)} className={"min-h-10 min-w-[63px] px-4 rounded-full text-xs font-semibold transition-all "+(cur===activeCurrency?"bg-white text-olive shadow-sm":"text-[#74796b] hover:text-olive")}>{cur}</button>)}
        </div>
        <button type="button" onClick={openNew} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-olive px-5 text-white font-medium text-sm shadow-soft transition-transform active:scale-[.98]"><Plus className="h-4 w-4"/> Nova despesa</button>
      </div>

      <div className="flex items-center justify-end gap-2 mb-5">
        <button type="button" onClick={copyStatement} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dadfd0] bg-white px-4 text-xs font-medium text-olive">
          <Copy className="h-4 w-4"/> Copiar resumo
        </button>
        <button type="button" onClick={exportStatement} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dadfd0] bg-white px-4 text-xs font-medium text-olive">
          <Download className="h-4 w-4"/> Exportar CSV
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-[22px] border border-[#e8e4d9] bg-white px-5 py-5 shadow-card">
          <p className="text-xs text-[#777b71]">Total registrado</p><p className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">{formatMoney(current.total,activeCurrency)}</p>
        </div>
        <div className="rounded-[22px] border border-[#e8e4d9] bg-white px-5 py-5 shadow-card">
          <p className="text-xs text-[#777b71]">Despesas</p><p className="text-3xl font-semibold mt-2">{current.count}</p>
        </div>
        <div className="rounded-[22px] border border-[#e8e4d9] bg-white px-5 py-5 shadow-card">
          <p className="text-xs text-[#777b71]">Acertos pendentes</p><p className="text-3xl font-semibold mt-2">{current.transfers.length}</p>
        </div>
        <div className="rounded-[22px] bg-[#536342] px-5 py-5 text-white shadow-card">
          <p className="text-xs text-white/75">Grupo da viagem</p>
          <div className="flex items-center -space-x-2 mt-2">{PEOPLE.map(p=><Avatar key={p} name={p}/>)}</div>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl bg-[#eae8db] p-1.5 mb-6 overflow-x-auto">
        {([["summary","Visão geral"],["expenses","Despesas"],["settlements","Acertar contas"]] as [Section,string][]).map(([key,label])=><button type="button" key={key} onClick={()=>setSection(key)} className={"min-h-11 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-all "+(section===key?"bg-white shadow-sm text-olive":"text-[#707668]")}>{label}</button>)}
      </div>

      {section==="summary" && <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-5">
        <section className="rounded-[26px] bg-white border border-[#e8e4d9] p-5 sm:p-7 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-6"><div><p className="text-[11px] tracking-widest uppercase text-olive/70">Seu grupo</p><h2 className="font-display text-3xl mt-1">Saldo por viajante</h2></div><Wallet className="w-5 h-5 text-olive"/></div>
          <div className="space-y-3">
            {PEOPLE.map(name=>{const bal=current.net[name];return <div key={name} className="flex items-center gap-3 rounded-2xl bg-[#f8f7f2] p-3.5">
              <Avatar name={name}/><div className="min-w-0 flex-1"><p className="font-semibold text-sm">{name}</p><p className="text-xs text-[#858a7e]">{Math.abs(bal)<.005?"Tudo equilibrado":bal>0?"Tem a receber":"Tem a pagar"}</p></div>
              <strong className={"text-sm tabular-nums "+(bal<-.005?"text-[#b36858]":bal>.005?"text-[#55765a]":"text-[#72796c]")}>{formatMoney(Math.abs(bal)<.005?0:bal,activeCurrency)}</strong>
            </div>})}
          </div>
          <p className="text-xs text-[#899083] leading-relaxed mt-5">Saldos líquidos considerando despesas e acertos já registrados, somente em {activeCurrency}. Não há conversão de câmbio automática.</p>
        </section>
        <section className="rounded-[26px] bg-[#edf0e7] border border-[#dfe5d8] p-5 sm:p-7 shadow-card">
          <div className="flex items-center justify-between mb-5"><div><p className="text-[11px] uppercase tracking-widest text-olive/70">Dívidas simplificadas</p><h2 className="font-display text-3xl mt-1">Quem paga quem</h2></div><ArrowRightLeft className="w-5 h-5 text-olive"/></div>
          {current.transfers.length===0?<div className="rounded-2xl border border-dashed border-olive/25 p-7 text-center"><CircleCheck className="h-9 w-9 mx-auto text-olive/70"/><p className="font-medium mt-3">Tudo em dia por aqui</p><p className="text-xs text-[#777d6e] mt-2">Quando houver despesas a dividir, os acertos aparecem automaticamente.</p></div>:
            <div className="space-y-3">{current.transfers.map((tr,i)=><div key={i} className="bg-white/80 rounded-2xl p-4">
              <div className="flex gap-2.5 items-center"><Avatar name={tr.from} size="sm"/><div className="flex-1 min-w-0"><p className="text-xs text-[#757b70]">{tr.from} paga {tr.to}</p><p className="text-xl font-semibold tabular-nums text-[#414e39] mt-0.5">{formatMoney(tr.amount,activeCurrency)}</p></div><ArrowRight className="h-4 w-4 text-olive/50"/><Avatar name={tr.to} size="sm"/></div>
              <button type="button" disabled={busy} onClick={()=>void recordSettlement(tr)} className="w-full mt-3 min-h-10 text-sm font-semibold rounded-full bg-[#536342] text-white">Registrar pagamento realizado</button>
            </div>)}</div>}
          <button type="button" onClick={()=>setSection("settlements")} className="mt-5 text-sm font-medium text-olive inline-flex items-center gap-2">Ver histórico de acertos <ArrowRight className="h-4 w-4"/></button>
        </section>
      </div>}

      {section==="expenses" && <section className="rounded-[26px] bg-white border border-[#e8e4d9] p-4 sm:p-7 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><h2 className="font-display text-3xl">Despesas do grupo</h2><span className="text-xs text-[#8a8d83]">{filtered.length} registro(s)</span></div>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mb-6">
          <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-[#7d8375]"/><Input aria-label="Buscar despesa" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar despesa…" className="h-11 rounded-xl pl-10 bg-[#f8f7f2] border-[#e7e5dd]"/></label>
          <label className="relative"><SlidersHorizontal className="absolute left-3 top-3 h-4 w-4 text-[#7d8375]"/><select aria-label="Filtrar categoria" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="h-11 w-full sm:w-auto rounded-xl border border-[#e7e5dd] bg-[#f8f7f2] pl-10 pr-7 text-sm"><option>Todas</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
          <select aria-label="Filtrar viajante" value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} className="h-11 w-full sm:w-auto rounded-xl border border-[#e7e5dd] bg-[#f8f7f2] px-3 text-sm"><option>Todas</option>{PEOPLE.map(p=><option key={p}>{p}</option>)}</select>
        </div>
        {filtered.length===0?<div className="py-14 text-center"><ReceiptText className="h-10 w-10 text-olive/40 mx-auto"/><h3 className="font-display text-2xl mt-3">Nada por aqui ainda</h3><p className="mt-1 text-sm text-[#7a7f74]">Adicione a primeira despesa ou altere os filtros.</p><Button onClick={openNew} className="mt-5 rounded-full"><Plus className="h-4 w-4 mr-1"/> Adicionar despesa</Button></div>:
          <div className="space-y-3">{filtered.map(exp=>{const CategoryIcon=categoryIcon[(exp.category as Category)||"Outros"]||ReceiptText;
            const split=shares.filter(s=>s.expense_id===exp.id);
            return <article key={exp.id} className="rounded-2xl border border-[#ece9df] p-4 sm:p-5 hover:border-[#c6cbb7] transition-colors">
              <div className="flex gap-3 items-start">
                <span className="shrink-0 grid place-items-center h-11 w-11 rounded-2xl bg-[#eff1e6]"><CategoryIcon className="h-5 w-5 text-olive"/></span>
                <div className="flex-1 min-w-0"><p className="font-semibold leading-snug">{exp.description}</p>
                  <p className="text-xs mt-1 text-[#808679]">{shortDate(exp.expense_date)} · Pago por {nameById(exp.paid_by)||"—"}</p>
                  <p className="text-xs mt-1 text-[#9a9c94]">{exp.category||"Outros"} · Dividido entre {split.map(x=>nameById(x.participant_id)).filter(Boolean).join(", ")||"—"}</p>
                </div>
                <strong className="whitespace-nowrap text-sm sm:text-base tabular-nums">{formatMoney(Number(exp.total_amount),exp.currency)}</strong>
              </div>
              {exp.notes&&<p className="mt-3 text-xs text-[#788173] leading-relaxed pl-1">{exp.notes}</p>}
              <div className="mt-3 flex flex-wrap gap-2">{split.map(sh=>{const name=nameById(sh.participant_id);return name?<span key={sh.id} className="inline-flex items-center gap-1 text-[11px] bg-[#f8f7f2] rounded-full px-2.5 py-1 text-[#62695d]">{name}: {formatMoney(Number(sh.share_amount),exp.currency)}</span>:null})}</div>
              <div className="mt-3 pt-3 border-t border-[#f0eee7] flex gap-4">
                <button type="button" onClick={()=>openEdit(exp)} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-olive"><Pencil className="h-3.5 w-3.5"/>Editar</button>
                <button type="button" disabled={busy} onClick={()=>void removeExpense(exp)} className="inline-flex min-h-9 items-center gap-1.5 text-xs text-[#a06b60]"><Trash2 className="h-3.5 w-3.5"/>Excluir</button>
              </div>
            </article>})}</div>}
      </section>}

      {section==="settlements" && <section className="grid md:grid-cols-2 gap-5">
        <div className="rounded-[26px] bg-white border border-[#e8e4d9] p-5 sm:p-7 shadow-card">
          <h2 className="font-display text-3xl">Acertos pendentes</h2><p className="mt-2 text-sm text-[#787e74]">Registre aqui depois de fazer o Pix ou a transferência. O site não movimenta dinheiro.</p>
          <div className="space-y-3 mt-6">{current.transfers.length?current.transfers.map((tr,i)=><div key={i} className="rounded-2xl bg-[#f6f7f1] p-4">
            <div className="flex items-center justify-between gap-3 text-sm"><span><strong>{tr.from}</strong> → {tr.to}</span><strong>{formatMoney(tr.amount,activeCurrency)}</strong></div>
            <button disabled={busy} onClick={()=>void recordSettlement(tr)} type="button" className="inline-flex mt-3 min-h-10 items-center gap-2 text-xs font-medium text-olive"><Check className="h-4 w-4"/> Marcar como pago</button>
          </div>):<p className="mt-3 rounded-2xl p-5 text-sm text-[#7a8175] bg-[#f8f7f2]">Sem acertos pendentes nesta moeda.</p>}</div>
        </div>
        <div className="rounded-[26px] bg-white border border-[#e8e4d9] p-5 sm:p-7 shadow-card">
          <h2 className="font-display text-3xl">Histórico de pagamentos</h2>
          <div className="space-y-3 mt-6">{settlements.filter(s=>s.currency===activeCurrency).length?settlements.filter(s=>s.currency===activeCurrency).map(st=><div key={st.id} className="flex items-start gap-3 rounded-2xl bg-[#f8f7f2] p-4">
            <CircleCheck className="w-5 h-5 shrink-0 text-[#55765a] mt-0.5"/><div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{nameById(st.payer_id)||"—"} → {nameById(st.payee_id)||"—"}</p>
              <p className="text-xs text-[#858b80] mt-1">{shortDate(st.settled_at)}</p>
            </div><div className="text-right"><strong className="text-sm">{formatMoney(Number(st.amount),st.currency)}</strong>
              <button type="button" disabled={busy} onClick={()=>void undoSettlement(st)} className="block ml-auto mt-2 text-[11px] text-[#aa766b]">Desfazer registro</button></div>
          </div>):<p className="rounded-2xl p-5 text-sm text-[#7a8175] bg-[#f8f7f2]">Nenhum pagamento registrado nesta moeda.</p>}</div>
        </div>
      </section>}

      <div className="mt-7 rounded-[22px] border border-[#dedfcf] bg-[#f0f1e8] p-5 text-xs text-[#6f7966] leading-relaxed">
        <strong className="text-olive">Rateio independente, inspirado no Splitwise.</strong> As despesas, divisões, saldos e acertos são salvos no próprio portal da viagem. Não há sincronização automática com o Splitwise neste momento. A conexão oficial depende de autorizar uma aplicação na API do serviço.
      </div>
    </main>

    {editorOpen && <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-[#1d261c]/50 p-0 sm:p-5" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setEditorOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-label={editingId?"Editar despesa":"Nova despesa"} className="flex max-h-[94dvh] w-full sm:max-w-xl flex-col overflow-hidden rounded-t-[28px] sm:rounded-[26px] bg-[#fbfaf6] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e7e4db] px-5 sm:px-7 py-4">
          <div><p className="text-[10px] tracking-[.2em] uppercase text-olive/70">Rateio compartilhado</p><h2 className="font-display text-3xl">{editingId?"Editar despesa":"Nova despesa"}</h2></div>
          <button type="button" aria-label="Fechar" disabled={busy} onClick={()=>setEditorOpen(false)} className="grid place-items-center size-10 rounded-full bg-[#e9e9df] text-olive"><X className="w-4 h-4"/></button>
        </div>
        <form id="expense-form" onSubmit={saveExpense} className="overflow-y-auto flex-1 p-5 sm:px-7 space-y-4">
          <div><Label htmlFor="desc">Descrição</Label><Input id="desc" className="h-12 bg-white rounded-xl" placeholder="Ex.: hotel de Londres" required value={description} onChange={e=>setDescription(e.target.value)}/></div>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="value">Valor</Label><Input id="value" className="h-12 bg-white rounded-xl" type="number" inputMode="decimal" step=".01" min=".01" required value={amount} onChange={e=>setAmount(e.target.value)}/></div>
            <div><Label htmlFor="currency">Moeda</Label><select id="currency" className="w-full h-12 rounded-xl bg-white border border-input px-3" value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>{CURRENCIES.map(cur=><option key={cur}>{cur}</option>)}</select></div></div>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="date">Data</Label><Input id="date" className="h-12 bg-white rounded-xl" type="date" value={date} required onChange={e=>setDate(e.target.value)}/></div>
            <div><Label htmlFor="category">Categoria</Label><select id="category" value={category} onChange={e=>setCategory(e.target.value as Category)} className="h-12 w-full rounded-xl bg-white border border-input px-3 text-sm">{CATEGORIES.map(cat=><option key={cat}>{cat}</option>)}</select></div></div>
          <div><Label>Quem pagou?</Label><div className="flex flex-wrap gap-2 mt-2">{PEOPLE.map(p=><button key={p} type="button" onClick={()=>setPaidBy(p)} className={"flex items-center min-h-10 gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors "+(paidBy===p?"border-olive bg-olive text-white":"border-[#dedfd2] bg-white text-olive")}>{p}{paidBy===p&&<Check className="w-3 h-3"/>}</button>)}</div></div>
          <div><Label>Dividir entre</Label><div className="flex flex-wrap gap-2 mt-2">{PEOPLE.map(p=><button key={p} type="button" aria-pressed={participants.includes(p)} onClick={()=>toggleParticipant(p)} className={"flex items-center gap-2 min-h-11 px-3 rounded-xl border text-sm "+(participants.includes(p)?"border-[#8b9b73] bg-[#edf0e7]":"border-[#e3e1d9] bg-white")}><span className={"grid place-items-center w-4 h-4 rounded border "+(participants.includes(p)?"bg-olive border-olive text-white":"border-[#b8bdae]")}>{participants.includes(p)&&<Check className="h-3 w-3"/>}</span>{p}</button>)}</div></div>
          <div><Label>Como dividir?</Label><div className="grid grid-cols-3 rounded-xl bg-[#eae9df] p-1 mt-2 gap-1">{([["equal","Igualmente"],["exact","Por valor"],["percentage","Por %"]] as [SplitMode,string][]).map(([mode,label])=><button key={mode} type="button" onClick={()=>setSplitMode(mode)} className={"text-[11px] sm:text-xs min-h-10 rounded-lg "+(mode===splitMode?"bg-white shadow-sm text-olive font-semibold":"text-[#778070]")}>{label}</button>)}</div></div>
          {splitMode!=="equal"&&<div className="space-y-2 rounded-xl bg-[#f0f0e9] p-3">{PEOPLE.filter(p=>participants.includes(p)).map(p=><label key={p} className="flex items-center gap-3"><span className="text-sm flex-1">{p}</span><Input className="h-11 w-28 bg-white" type="number" min="0" step={splitMode==="percentage"?"0.01":"0.01"} inputMode="decimal" placeholder={splitMode==="percentage"?"0 %":"0,00"} value={custom[p]} onChange={e=>setCustom(v=>({...v,[p]:e.target.value}))}/><span className="text-xs text-[#868b80]">{splitMode==="percentage"?"%":currency}</span></label>)}
            <p className="text-xs text-[#838a7c]">Os valores precisam somar o total; os percentuais, 100%.</p></div>}
          <div><Label htmlFor="notes">Observações (opcional)</Label><Input id="notes" value={notes} onChange={e=>setNotes(e.target.value)} className="h-11 bg-white rounded-xl" placeholder="Ex.: reserva reembolsável"/></div>
        </form>
        <div className="px-5 sm:px-7 py-4 border-t border-[#e7e4db] bg-[#fbfaf6]"><Button type="submit" form="expense-form" disabled={busy} className="w-full h-12 rounded-full text-sm">{busy?<><Loader2 className="h-4 w-4 animate-spin mr-2"/>Salvando…</>:editingId?"Salvar alterações":"Adicionar despesa"}</Button></div>
      </section>
    </div>}
  </div>;
}
