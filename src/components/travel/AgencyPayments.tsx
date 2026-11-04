import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, CheckCircle2, ExternalLink, FileText, Loader2, Plus, ReceiptText, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

type Installment = { id:string; installment_number:number; amount:number; due_date:string|null; description:string|null };
type Payment = { id:string; paid_on:string; amount:number; receipt_url:string|null; notes:string|null };
const brl=(amount:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(amount||0);
const today=()=>new Date().toLocaleDateString("en-CA");
const parseAmount=(text:string)=>Number(text.trim().replace(",","."));
const safeUrl=(text:string)=>{
 if(!text.trim())return null;
 const url=new URL(text);
 if(!["http:","https:"].includes(url.protocol))throw new Error("Use um link http ou https válido.");
 return url.toString();
};
function Metric({title,value,sub}:{title:string;value:string;sub?:string}){
 return <div className="rounded-[20px] bg-white border border-[#e5e5db] p-4 shadow-card">
   <p className="text-xs text-muted-foreground">{title}</p>
   <strong className="block font-display text-2xl sm:text-3xl leading-tight text-ink mt-2">{value}</strong>
   {sub&&<p className="text-[11px] mt-1 text-[#828c7b]">{sub}</p>}
 </div>;
}

export function AgencyPayments(){
 const {user}=useAuth();
 const [installments,setInstallments]=useState<Installment[]>([]);
 const [payments,setPayments]=useState<Payment[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [panel,setPanel]=useState<"plan"|"paid">("paid");
 const [installmentEditing,setInstallmentEditing]=useState<Installment|null>(null);
 const [showInstallmentForm,setShowInstallmentForm]=useState(false);
 const [installmentNo,setInstallmentNo]=useState(19);
 const [installmentAmount,setInstallmentAmount]=useState("");
 const [installmentDue,setInstallmentDue]=useState("");
 const [formOpen,setFormOpen]=useState(false);
 const [payDate,setPayDate]=useState(today());
 const [payAmount,setPayAmount]=useState("");
 const [receipt,setReceipt]=useState("");
 const [notes,setNotes]=useState("");

 const load=async()=>{
  if(!user?.id){setLoading(false);return;}
  setLoading(true);setError("");
  try{
   const [a,b]=await Promise.all([
     supabase.from("agency_installments").select("id,installment_number,amount,due_date,description").eq("owner_id",user.id).order("installment_number"),
     supabase.from("agency_payments").select("id,paid_on,amount,receipt_url,notes").eq("owner_id",user.id).order("paid_on",{ascending:false})
   ]);
   if(a.error||b.error)throw a.error||b.error;
   setInstallments((a.data||[]) as Installment[]);
   setPayments((b.data||[]) as Payment[]);
  }catch(e:any){setError(e?.message||"Não foi possível consultar os pagamentos da agência.");}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[user?.id]);
 const totalPlanned=useMemo(()=>installments.reduce((a,b)=>a+Number(b.amount),0),[installments]);
 const totalPaid=useMemo(()=>payments.reduce((a,b)=>a+Number(b.amount),0),[payments]);
 const missing=useMemo(()=>Array.from({length:20},(_,i)=>i+1).filter(n=>!installments.some(x=>x.installment_number===n)),[installments]);
 const remaining=Math.max(0,totalPlanned-totalPaid);
 const progress=totalPlanned>0?Math.min(100,(totalPaid/totalPlanned)*100):0;
 const startEdit=(item?:Installment)=>{
   setShowInstallmentForm(true);
   setInstallmentEditing(item||null);
   setInstallmentNo(item?.installment_number||missing[0]||19);
   setInstallmentAmount(item?String(item.amount):"");
   setInstallmentDue(item?.due_date||"");
 };
 const saveInstallment=async(e:FormEvent)=>{
  e.preventDefault();if(!user?.id||busy)return;
  const v=parseAmount(installmentAmount);
  if(!Number.isFinite(v)||v<=0||Math.abs(v*100-Math.round(v*100))>.001)
    return toast.error("Informe um valor válido com duas casas decimais.");
  setBusy(true);
  try{
    const record={owner_id:user.id,installment_number:installmentNo,amount:v,due_date:installmentDue||null,
      description:"Registro conferido ou informado no portal"};
    const {error:dbError}=installmentEditing
      ?await supabase.from("agency_installments").update(record).eq("id",installmentEditing.id).eq("owner_id",user.id)
      :await supabase.from("agency_installments").insert(record);
    if(dbError)throw dbError;
    toast.success("Parcela atualizada no seu cronograma.");setInstallmentEditing(null);setShowInstallmentForm(false);setInstallmentAmount("");setInstallmentDue("");await load();
  }catch(e:any){toast.error("Erro ao salvar parcela.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const savePayment=async(e:FormEvent)=>{
  e.preventDefault();if(!user?.id||busy)return;
  const v=parseAmount(payAmount);
  if(!Number.isFinite(v)||v<=0||Math.abs(v*100-Math.round(v*100))>.001)
    return toast.error("Digite o valor realmente pago.");
  let url:string|null;
  try{url=safeUrl(receipt);}catch(e:any){return toast.error(e.message);}
  setBusy(true);
  try{
   const {error:dbError}=await supabase.from("agency_payments").insert({
    owner_id:user.id,paid_on:payDate,amount:v,receipt_url:url,notes:notes.trim()||null
   });
   if(dbError)throw dbError;
   toast.success("Pagamento efetivamente realizado registrado.");
   setPayAmount("");setPayDate(today());setReceipt("");setNotes("");setFormOpen(false);await load();
  }catch(e:any){toast.error("Não foi possível registrar o pagamento.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const removePayment=async(p:Payment)=>{
  if(!user?.id||!window.confirm(`Excluir o pagamento de ${brl(Number(p.amount))} de ${p.paid_on.split("-").reverse().join("/")}? Esta ação altera o total pago.`))return;
  setBusy(true);
  try{
   const {error:dbError}=await supabase.from("agency_payments").delete().eq("owner_id",user.id).eq("id",p.id);
   if(dbError)throw dbError;
   toast.success("Registro de pagamento excluído.");await load();
  }catch(e:any){toast.error("Não foi possível excluir.",{description:e?.message});}
  finally{setBusy(false);}
 };
 if(loading)return <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/>Conferindo o controle da agência…</div>;

 return <div className="space-y-5">
  <div className="rounded-3xl border border-[#e1e4d4] bg-[#edf0e6] p-5 sm:p-7">
   <p className="text-xs tracking-[.22em] uppercase font-semibold text-olive/80">Agência · organização financeira pessoal</p>
   <h2 className="font-display text-3xl sm:text-4xl text-ink mt-2">Previsto não é pago.</h2>
   <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6a7465]">O que está no contrato, o que você efetivamente desembolsou e o que falta conferir. Importei apenas os quatro pagamentos confirmados por comprovantes. Previsões de pagamentos futuros não contam como quitadas.</p>
  </div>
  {error&&<div role="alert" className="rounded-2xl p-4 border border-red-200 bg-red-50 text-sm text-red-800">{error} <Button variant="outline" onClick={()=>void load()}>Tentar novamente</Button></div>}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
   <Metric title="Parcelas conhecidas" value={brl(totalPlanned)} sub={installments.length+" de 20 valores cadastrados"}/>
   <Metric title="Pagamentos confirmados" value={brl(totalPaid)} sub={payments.length+" comprovante(s)/registro(s)"}/>
   <Metric title="Saldo mínimo conhecido" value={brl(remaining)} sub={missing.length?"Não inclui parcela(s) sem valor":"Conforme os valores cadastrados"}/>
   <Metric title="Progresso parcial" value={progress.toFixed(1)+"%"} sub="Sobre as parcelas com valor informado"/>
  </div>
  <div className="rounded-2xl border border-[#e5e3d9] bg-white p-4">
    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0e5]"><div className="h-full rounded-full bg-[#687a53] transition-all" style={{width:progress+"%"}}/></div>
    {missing.length>0&&<p className="mt-3 text-xs text-[#956d52] leading-relaxed">Atenção: falta informar {missing.map(n=>n+"/20").join(", ")}. O saldo calculado é parcial, não o saldo definitivo do contrato.</p>}
  </div>
  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#e9eadd] p-1">
   <button type="button" onClick={()=>setPanel("paid")} className={"min-h-11 rounded-lg flex items-center justify-center gap-2 text-sm "+(panel==="paid"?"bg-white text-olive shadow-sm font-semibold":"text-[#7a8172]")}><ReceiptText className="h-4 w-4"/>O que paguei</button>
   <button type="button" onClick={()=>setPanel("plan")} className={"min-h-11 rounded-lg flex items-center justify-center gap-2 text-sm "+(panel==="plan"?"bg-white text-olive shadow-sm font-semibold":"text-[#7a8172]")}><CalendarClock className="h-4 w-4"/>Cronograma</button>
  </div>

  {panel==="paid"&&<section className="rounded-[24px] border border-[#e7e6dc] bg-white p-4 sm:p-6 shadow-card">
   <div className="flex justify-between items-center gap-3 flex-wrap"><div><p className="text-[11px] text-olive/70 uppercase tracking-widest">Livro-caixa</p><h3 className="font-display text-3xl mt-1">Pagamentos realizados</h3></div>
   <Button onClick={()=>setFormOpen(v=>!v)} className="min-h-11 rounded-full"><Plus className="w-4 h-4 mr-2"/>Registrar pagamento</Button></div>
   {formOpen&&<form onSubmit={savePayment} className="rounded-2xl border border-[#e3e5d9] bg-[#f7f8f2] p-4 mt-5 space-y-3">
     <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="paid-on">Dia em que paguei</Label><Input id="paid-on" type="date" required className="h-11 mt-1" value={payDate} onChange={e=>setPayDate(e.target.value)}/></div>
     <div><Label htmlFor="paid-amount">Valor realmente pago</Label><Input id="paid-amount" type="number" min=".01" step=".01" required className="h-11 mt-1" value={payAmount} onChange={e=>setPayAmount(e.target.value)}/></div></div>
     <div><Label htmlFor="paid-receipt">Link do comprovante (opcional)</Label><Input id="paid-receipt" type="url" inputMode="url" className="h-11 mt-1" placeholder="https://drive.google.com/..." value={receipt} onChange={e=>setReceipt(e.target.value)}/></div>
     <div><Label htmlFor="paid-notes">Observação</Label><Input id="paid-notes" className="h-11 mt-1" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex.: antecipação de várias parcelas"/></div>
     <Button type="submit" disabled={busy} className="w-full h-11 rounded-full">{busy?"Salvando…":"Salvar pagamento confirmado"}</Button>
     <p className="text-xs text-muted-foreground">Não registre uma previsão aqui; o valor entra imediatamente no total pago.</p>
   </form>}
   <div className="space-y-3 mt-5">{payments.map(p=><article key={p.id} className="flex gap-3 rounded-2xl bg-[#f7f8f3] border border-[#edeee6] p-4 items-start">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#63846b] mt-0.5"/>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink">{brl(Number(p.amount))}</p><p className="mt-1 text-xs text-muted-foreground">{p.paid_on.split("-").reverse().join("/")}</p>
        {p.notes&&<p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.notes}</p>}
        {p.receipt_url&&<a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-olive"><ExternalLink className="h-3.5 w-3.5"/>Abrir comprovante</a>}
      </div>
      <button type="button" disabled={busy} onClick={()=>void removePayment(p)} aria-label="Excluir pagamento" className="min-h-9 px-2 text-[#aa796a]"><Trash2 className="h-4 w-4"/></button>
   </article>)}
   {payments.length===0&&<p className="text-sm text-muted-foreground py-8 text-center">Nenhum pagamento efetivamente confirmado.</p>}</div>
  </section>}

  {panel==="plan"&&<section className="rounded-[24px] border border-[#e7e6dc] bg-white p-4 sm:p-6 shadow-card">
   <div className="flex justify-between items-center flex-wrap gap-3"><div><p className="text-[11px] text-olive/70 uppercase tracking-widest">Projeção contratual</p><h3 className="font-display text-3xl mt-1">Parcelas previstas</h3></div>
   {missing.length>0&&<Button variant="outline" className="rounded-full min-h-11" onClick={()=>startEdit()}><Plus className="h-4 w-4 mr-1.5"/>Informar parcela {missing[0]}</Button>}</div>
   <p className="mt-3 text-xs text-muted-foreground">Os valores foram transcritos do cronograma informado. As datas oficiais de vencimento ainda precisam ser conferidas. Esta lista não significa que a parcela foi paga.</p>
   <div className="space-y-2 mt-5">{installments.map(x=><div key={x.id} className="rounded-xl border border-[#ebebe2] p-3 flex items-center gap-3">
     <div className="h-10 w-11 rounded-xl bg-[#edf0e5] text-olive grid place-items-center text-sm font-semibold">{x.installment_number}/20</div>
     <div className="flex-1"><p className="font-medium text-sm">{brl(Number(x.amount))}</p><p className="text-[11px] text-muted-foreground mt-0.5">{x.due_date?"Vencimento: "+x.due_date.split("-").reverse().join("/"):"Data a conferir"}</p></div>
     <button type="button" onClick={()=>startEdit(x)} className="min-h-10 px-3 text-xs text-olive">Editar</button>
   </div>)}
   {missing.map(number=><div key={number} className="rounded-xl border border-dashed border-[#c8cebd] p-3 flex items-center gap-3">
     <div className="h-10 w-11 rounded-xl bg-[#f5f2e8] text-[#9b8154] grid place-items-center text-sm font-semibold">{number}/20</div><p className="flex-1 text-sm text-[#977954]">Valor não informado</p>
     <button type="button" onClick={()=>{startEdit();setInstallmentNo(number);}} className="min-h-10 px-3 text-xs text-olive">Preencher</button>
   </div>)}</div>
   {showInstallmentForm && (
     <form onSubmit={saveInstallment} className="mt-5 rounded-2xl bg-[#f7f8f2] p-4 space-y-3">
       <h4 className="font-semibold text-sm">Editar parcela {installmentNo}/20</h4>
       <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="installment-amount">Valor previsto</Label><Input id="installment-amount" type="number" step=".01" min=".01" required value={installmentAmount} onChange={e=>setInstallmentAmount(e.target.value)} className="mt-1 h-11"/></div>
       <div><Label htmlFor="installment-date">Vencimento (opcional)</Label><Input id="installment-date" type="date" value={installmentDue} onChange={e=>setInstallmentDue(e.target.value)} className="mt-1 h-11"/></div></div>
       <div className="flex gap-2"><Button type="submit" disabled={busy} className="rounded-full flex-1 min-h-11">Salvar valor previsto</Button><Button variant="outline" type="button" className="rounded-full min-h-11" onClick={()=>{setShowInstallmentForm(false);setInstallmentEditing(null);setInstallmentAmount("");setInstallmentDue("");}}>Cancelar</Button></div>
     </form>
   )}
  </section>}
  <p className="text-xs leading-relaxed text-muted-foreground flex gap-2"><FileText className="h-4 w-4 shrink-0"/>Os comprovantes antigos foram considerados como pagamentos efetivos; os links dos arquivos não estavam associados aos registros. Você pode registrar novos comprovantes por link sem substituir o histórico.</p>
 </div>;
}
