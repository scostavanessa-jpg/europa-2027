import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGroupLocalStore } from "@/hooks/useUserLocalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { toast } from "sonner";

type Person = "Vanessa" | "Camila" | "Danielle";
type Expense = { id: string; description: string; date: string; amount: number; currency: string; paidBy: Person; participants: Person[]; notes: string };
const PEOPLE: Person[] = ["Vanessa", "Camila", "Danielle"];
const money = (v:number,currency:string) => new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(v||0);

export default function Rateio(){
  const store=useGroupLocalStore<Expense[]>("rateio",[]);
  const[description,setDescription]=useState(""); const[date,setDate]=useState(new Date().toISOString().slice(0,10)); const[amount,setAmount]=useState(""); const[currency,setCurrency]=useState("EUR"); const[paidBy,setPaidBy]=useState<Person>("Vanessa"); const[participants,setParticipants]=useState<Person[]>([...PEOPLE]); const[notes,setNotes]=useState("");

  const submit=(e:FormEvent)=>{e.preventDefault();const value=Number(amount.replace(",","."));if(!description.trim()||!value||value<=0)return toast.error("Preencha descrição e valor.");if(!participants.length)return toast.error("Selecione quem participa da despesa.");store.setValue(v=>[{id:crypto.randomUUID(),description:description.trim(),date,amount:value,currency,paidBy,participants,notes:notes.trim()},...v]);setDescription("");setAmount("");setNotes("");toast.success("Despesa adicionada ao Rateio.");};
  const toggle=(p:Person)=>setParticipants(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);

  const summaries=useMemo(()=>{
    const byCurrency:Record<string,Record<Person,number>>={};
    for(const exp of store.value){const net=byCurrency[exp.currency]??(byCurrency[exp.currency]={Vanessa:0,Camila:0,Danielle:0});const share=exp.amount/exp.participants.length;net[exp.paidBy]+=exp.amount;for(const p of exp.participants)net[p]-=share;}
    return Object.entries(byCurrency).map(([cur,net])=>({cur,net,settlements:settle(net)}));
  },[store.value]);

  return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-5xl px-5 md:px-6 py-10 md:py-14"><Link to="/" className="inline-flex items-center gap-2 text-sm text-olive hover:underline"><ArrowLeft className="h-4 w-4"/>Voltar à viagem</Link><div className="mt-7 mb-8"><p className="text-xs tracking-[0.3em] uppercase text-olive">Despesas compartilhadas</p><h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Rateio da viagem</h1><p className="text-muted-foreground mt-2">Quem pagou, quem participou e quem precisa acertar com quem.</p></div>
  <div className="rounded-3xl border border-gold/30 bg-card p-6 shadow-card"><div className="flex items-center gap-3 mb-5"><ReceiptText className="h-5 w-5 text-olive"/><h2 className="font-display text-2xl text-ink">Nova despesa</h2></div><form onSubmit={submit} className="grid md:grid-cols-2 gap-4"><div><Label>Descrição</Label><Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: hotel em Milão" required/></div><div><Label>Data</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div><div><Label>Valor</Label><Input type="number" step="0.01" min="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required/></div><div><Label>Moeda</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)}><option>EUR</option><option>GBP</option><option>CHF</option><option>BRL</option></select></div><div><Label>Quem pagou</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={paidBy} onChange={e=>setPaidBy(e.target.value as Person)}>{PEOPLE.map(p=><option key={p}>{p}</option>)}</select></div><div><Label>Quem participa</Label><div className="flex flex-wrap gap-2 mt-2">{PEOPLE.map(p=><label key={p} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><input type="checkbox" checked={participants.includes(p)} onChange={()=>toggle(p)}/>{p}</label>)}</div></div><div className="md:col-span-2"><Label>Observação</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional"/></div><Button className="rounded-full md:w-fit">Adicionar despesa</Button></form></div>

  <div className="grid md:grid-cols-2 gap-5 mt-6"><div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card"><h2 className="font-display text-2xl text-ink">Despesas</h2>{store.value.length===0?<p className="text-sm text-muted-foreground mt-3">Nenhuma despesa compartilhada registrada.</p>:<div className="mt-4 space-y-3">{store.value.map(exp=><div key={exp.id} className="rounded-2xl bg-secondary/40 p-4"><div className="flex gap-3 justify-between"><div><b className="text-ink">{exp.description}</b><p className="text-xs text-muted-foreground mt-1">{new Date(`${exp.date}T12:00:00`).toLocaleDateString("pt-BR")} · pago por {exp.paidBy}</p></div><b className="text-olive whitespace-nowrap">{money(exp.amount,exp.currency)}</b></div><p className="text-xs text-muted-foreground mt-2">Participam: {exp.participants.join(", ")} · {money(exp.amount/exp.participants.length,exp.currency)} por pessoa</p>{exp.notes&&<p className="text-xs text-muted-foreground mt-1">{exp.notes}</p>}<Button size="sm" variant="ghost" className="mt-2" onClick={()=>{if(confirm("Excluir esta despesa?"))store.setValue(v=>v.filter(x=>x.id!==exp.id));}}>Excluir</Button></div>)}</div>}</div>
  <div className="rounded-3xl border border-gold/30 bg-gradient-warm p-6 shadow-card"><h2 className="font-display text-2xl text-ink">Quem deve a quem</h2>{summaries.length===0?<p className="text-sm text-muted-foreground mt-3">O resumo aparece assim que houver despesas.</p>:<div className="mt-4 space-y-5">{summaries.map(s=><div key={s.cur}><div className="text-xs uppercase tracking-wider text-olive mb-2">{s.cur}</div>{s.settlements.length===0?<p className="text-sm text-muted-foreground">Tudo equilibrado.</p>:<div className="space-y-2">{s.settlements.map((x,i)=><div key={i} className="rounded-2xl bg-card/80 border border-border/50 p-3 text-sm"><b>{x.from}</b> paga <b>{x.to}</b> <span className="text-olive font-semibold">{money(x.amount,s.cur)}</span></div>)}</div>}</div>)}</div>}</div></div>
  </div></div>;
}

function settle(net:Record<Person,number>){const debtors=PEOPLE.map(p=>({p,v:net[p]})).filter(x=>x.v<-.005).sort((a,b)=>a.v-b.v);const creditors=PEOPLE.map(p=>({p,v:net[p]})).filter(x=>x.v>.005).sort((a,b)=>b.v-a.v);const out:{from:Person;to:Person;amount:number}[]=[];let i=0,j=0;while(i<debtors.length&&j<creditors.length){const amount=Math.min(-debtors[i].v,creditors[j].v);out.push({from:debtors[i].p,to:creditors[j].p,amount});debtors[i].v+=amount;creditors[j].v-=amount;if(Math.abs(debtors[i].v)<.005)i++;if(Math.abs(creditors[j].v)<.005)j++;}return out;}
