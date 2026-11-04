import { TrainWatermark } from "@/components/travel/TrainWatermark";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, CalendarClock, ExternalLink, Loader2, Plane, Plus, Search, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Price = {
 id:string; origin:string; destination:string; departure_date:string; adults:number;
 price_per_person_brl:number|null; total_price_brl:number|null; airline:string|null;
 source:string|null; offer_url:string|null; searched_at:string;
};
type Coupon = {id:string;title:string;merchant:string|null;code:string|null;url:string|null;expires_at:string|null;notes:string|null};
type Tab="radar"|"history"|"coupons";
type Scenario="europa"|"curso";
const scenarios:Record<Scenario,{label:string;summary:string;routes:{from:string;to:string;date:string;label:string;note:string}[]}>={
 europa:{label:"Europa primeiro",summary:"Hipótese mais recente: passeio antes da Kaplan em Liverpool",routes:[
  {from:"SAO",to:"MXP",date:"2028-03-17",label:"Chegada pelo continente",note:"São Paulo → Milão · somente data de referência"},
  {from:"LHR",to:"SAO",date:"2028-04-23",label:"Volta depois do curso",note:"Londres → São Paulo · comparar Manchester como alternativa"},
 ]},
 curso:{label:"Curso primeiro",summary:"Alternativa mantida em aberto: Liverpool antes do passeio",routes:[
  {from:"SAO",to:"LHR",date:"2028-03-10",label:"Chegada pelo Reino Unido",note:"São Paulo → Londres · comparar Manchester"},
  {from:"MXP",to:"SAO",date:"2028-04-16",label:"Volta pelo continente",note:"Milão → São Paulo · evita refazer todo o roteiro"}
 ]}
};
const brl=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const today=()=>new Date().toLocaleDateString("en-CA");
const validUrl=(value:string)=>{if(!value.trim())return null;try{const u=new URL(value);if(u.protocol==="http:"||u.protocol==="https:")return u.toString();}catch{}throw new Error("Informe um link http ou https válido.");};
const linkFlights=(from:string,to:string,date:string)=>"https://www.google.com/travel/flights?q="+encodeURIComponent("Flights from "+from+" to "+to+" on "+date);
export default function Ofertas(){
 const [tab,setTab]=useState<Tab>("radar");
 const [scenario,setScenario]=useState<Scenario>("europa");
 const [prices,setPrices]=useState<Price[]>([]);
 const [coupons,setCoupons]=useState<Coupon[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [origin,setOrigin]=useState("SAO");
 const [dest,setDest]=useState("MXP");
 const [depart,setDepart]=useState("2028-03-17");
 const [value,setValue]=useState("");
 const [airline,setAirline]=useState("");
 const [source,setSource]=useState("");
 const [offerUrl,setOfferUrl]=useState("");
 const [couponTitle,setCouponTitle]=useState("");
 const [couponMerchant,setCouponMerchant]=useState("");
 const [couponCode,setCouponCode]=useState("");
 const [couponUrl,setCouponUrl]=useState("");
 const [couponExpiry,setCouponExpiry]=useState("");
 const [couponNotes,setCouponNotes]=useState("");
 const [query,setQuery]=useState("");

 const load=async()=>{
  setLoading(true);setError("");
  try{
   const [flight,coupon]=await Promise.all([
    supabase.from("flight_price_history").select("id,origin,destination,departure_date,adults,price_per_person_brl,total_price_brl,airline,source,offer_url,searched_at").order("searched_at",{ascending:false}),
    supabase.from("travel_coupons").select("id,title,merchant,code,url,expires_at,notes").order("created_at",{ascending:false})
   ]);
   if(flight.error||coupon.error)throw flight.error||coupon.error;
   setPrices((flight.data||[]) as Price[]);
   setCoupons((coupon.data||[]) as Coupon[]);
  }catch(e:any){setError(e?.message||"Não foi possível consultar os registros.");}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[]);

 const best=useMemo(()=>prices.filter(p=>Number(p.price_per_person_brl)>0).sort((a,b)=>Number(a.price_per_person_brl)-Number(b.price_per_person_brl))[0], [prices]);
 const matching=prices.filter(p=>[p.origin,p.destination,p.airline,p.source].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
 const savePrice=async(e:FormEvent)=>{
  e.preventDefault();
  const amount=Number(value.trim().replace(",","."));
  if(!Number.isFinite(amount)||amount<=0||Math.abs(amount*100-Math.round(amount*100))>.001)return toast.error("Informe o preço real por pessoa.");
  if(origin.trim().length<3||dest.trim().length<3)return toast.error("Informe origem e destino.");
  let url:string|null=null;
  try{url=validUrl(offerUrl);}catch(e:any){return toast.error(e.message);}
  setBusy(true);
  try{
   const {error}=await supabase.from("flight_price_history").insert({
     origin:origin.trim().toUpperCase(),destination:dest.trim().toUpperCase(),departure_date:depart,
     adults:3,price_per_person_brl:amount,total_price_brl:Math.round(amount*300)/100,
     airline:airline.trim()||null,source:source.trim()||null,offer_url:url
   });
   if(error)throw error;
   toast.success("Tarifa registrada no histórico das três.");
   setValue("");setAirline("");setSource("");setOfferUrl("");await load();setTab("history");
  }catch(e:any){toast.error("Não foi possível registrar a tarifa.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const saveCoupon=async(e:FormEvent)=>{
  e.preventDefault();if(!couponTitle.trim())return;
  let url:string|null=null;
  try{url=validUrl(couponUrl);}catch(e:any){return toast.error(e.message);}
  setBusy(true);
  try{
   const {error}=await supabase.from("travel_coupons").insert({
     title:couponTitle.trim(),merchant:couponMerchant.trim()||null,code:couponCode.trim()||null,
     url,expires_at:couponExpiry||null,notes:couponNotes.trim()||null
   });if(error)throw error;
   toast.success("Cupom ou link guardado. Verifique as condições antes de comprar.");
   setCouponTitle("");setCouponMerchant("");setCouponCode("");setCouponUrl("");setCouponExpiry("");setCouponNotes("");await load();
  }catch(e:any){toast.error("Não foi possível salvar o cupom.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const remove=async(table:"flight_price_history"|"travel_coupons",id:string)=>{
  if(!window.confirm("Excluir este registro para as três viajantes?"))return;
  setBusy(true);
  try{const {error}=await supabase.from(table).delete().eq("id",id);if(error)throw error;toast.success("Registro excluído.");await load();}
  catch(e:any){toast.error("Não foi possível excluir.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const chooseRoute=(route:{from:string;to:string;date:string})=>{setOrigin(route.from);setDest(route.to);setDepart(route.date);setTab("history");};

 return <div className="min-h-screen bg-[#f8f6f1] pb-24 text-[#2c3328]">
  <header className="bg-[#eeefe6] relative overflow-hidden border-b border-[#e2e4d8]">
   <TrainWatermark className="absolute inset-0 pointer-events-none" imageClassName="opacity-[.24] object-center" gradientClassName="bg-gradient-to-r from-[#f1f2e9]/96 via-[#f1f2e9]/83 to-[#f1f2e9]/67" />
   <div className="relative mx-auto max-w-6xl px-5 sm:px-7 py-8 sm:py-12">
    <Link to="/" className="inline-flex items-center min-h-10 gap-2 text-sm text-olive"><ArrowLeft className="h-4 w-4"/>Voltar à viagem</Link>
    <p className="mt-7 text-[11px] uppercase tracking-[.25em] text-olive/80 font-semibold">Passagens · promoções · memória de preços</p>
    <h1 className="font-display text-5xl md:text-6xl mt-3">Achados para <em className="font-light text-olive">2028</em></h1>
    <p className="max-w-2xl text-sm leading-relaxed text-[#676e62] mt-3">Uma central compartilhada de oportunidades, sem confundir preço real com estimativa. A ordem entre Europa e curso continua em análise.</p>
   </div>
  </header>

  <main className="mx-auto max-w-6xl px-4 sm:px-7 py-7">
   {error&&<div role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 mb-6 text-sm">{error} <button onClick={()=>void load()} className="underline ml-2">Tentar novamente</button></div>}
   <div className="grid sm:grid-cols-3 gap-3 mb-7">
    <Stat label="Tarifas registradas" value={String(prices.length)} sub="Preços informados pelo grupo"/>
    <Stat label="Menor valor registrado" value={best?brl(Number(best.price_per_person_brl)):"—"} sub={best?best.origin+" → "+best.destination:"Ainda não há tarifa validada"}/>
    <Stat label="Cupons e links" value={String(coupons.length)} sub="A conferir antes da compra"/>
   </div>

   <div className="flex gap-1 p-1.5 rounded-2xl bg-[#e9e9de] overflow-x-auto">
    {([["radar","Radar",Plane],["history","Histórico",CalendarClock],["coupons","Cupons",Tag]] as const).map(([id,label,Icon])=><button type="button" key={id} onClick={()=>setTab(id)} className={"flex flex-1 gap-2 items-center justify-center rounded-xl min-h-11 px-3 whitespace-nowrap text-sm transition-colors "+(tab===id?"bg-white text-olive shadow-sm font-semibold":"text-[#6f756a]")}><Icon className="h-4 w-4"/>{label}</button>)}
   </div>

   {tab==="radar"&&<div className="space-y-6 mt-6">
    <div className="rounded-3xl bg-white border border-[#e8e5dc] p-5 sm:p-7 shadow-card">
     <p className="text-xs uppercase tracking-widest text-olive/70">Duas possibilidades, nenhuma decisão forçada</p>
     <div className="grid sm:grid-cols-2 gap-3 mt-4">
      {(["europa","curso"] as Scenario[]).map(id=><button type="button" key={id} onClick={()=>setScenario(id)} className={"text-left rounded-2xl p-4 border min-h-24 transition-all "+(scenario===id?"bg-[#edf1e6] border-olive/35":"bg-[#faf9f6] border-[#eceade]")}><strong className="block text-sm text-ink">{scenarios[id].label}</strong><span className="block mt-1.5 text-xs leading-relaxed text-[#798070]">{scenarios[id].summary}</span></button>)}
     </div>
     <div className="grid sm:grid-cols-2 gap-3 mt-5">
      {scenarios[scenario].routes.map(route=><div key={route.label} className="rounded-2xl bg-[#f8f8f3] p-4 border border-[#eeeadd]">
       <div className="flex justify-between items-start gap-3"><p className="text-[11px] tracking-wide uppercase text-olive/80">{route.label}</p><Plane className="h-4 w-4 text-olive/60"/></div>
       <h3 className="font-display text-2xl mt-2 text-ink">{route.from} → {route.to}</h3>
       <p className="mt-2 text-sm text-muted-foreground">{route.date.split("-").reverse().join("/")} · {route.note}</p>
       <div className="mt-4 flex flex-wrap gap-3">
        <a href={linkFlights(route.from,route.to,route.date)} target="_blank" rel="noreferrer" className="min-h-10 inline-flex items-center gap-1 text-xs font-semibold text-olive"><ExternalLink className="h-3.5 w-3.5"/>Pesquisar Google Flights</a>
        <button type="button" onClick={()=>chooseRoute(route)} className="min-h-10 inline-flex items-center gap-1 text-xs text-olive/75"><Plus className="h-3.5 w-3.5"/>Registrar preço</button>
       </div>
      </div>)}
     </div>
     <p className="mt-4 text-xs text-[#85897d]">Datas e aeroportos são hipóteses para comparação, não reservas nem decisão final. Busque também multidestino, bagagem e custo de chegar ao hotel.</p>
    </div>
    <div className="rounded-3xl bg-[#e8ece3] border border-[#dfe5d9] p-5 sm:p-7">
     <div className="flex items-start gap-3"><Bell className="h-5 w-5 mt-1 shrink-0 text-olive"/><div>
      <h3 className="font-display text-2xl">Alertas de verdade</h3>
      <p className="text-sm leading-relaxed mt-2 text-[#6c7868]">O Google Flights permite ativar notificações reais por e-mail. Nosso site registra e compara preços que vocês adicionarem, mas <strong>não faz busca automática de tarifas neste momento</strong>.</p>
      <a className="inline-flex mt-3 min-h-10 items-center gap-1 text-sm font-semibold text-olive" target="_blank" rel="noreferrer" href="https://www.google.com/travel/flights/saves">Configurar alertas no Google Flights <ExternalLink className="h-3.5 w-3.5"/></a>
     </div></div>
    </div>
   </div>}

   {tab==="history"&&<div className="mt-6 grid lg:grid-cols-[.9fr_1.1fr] gap-5 items-start">
    <form onSubmit={savePrice} className="rounded-3xl border border-[#e8e5dc] bg-white p-5 sm:p-6 shadow-card space-y-4">
     <h2 className="font-display text-3xl">Registrar preço real</h2><p className="text-xs text-muted-foreground">Preço por pessoa em reais; todas verão o registro, com fonte e data.</p>
     <div className="grid grid-cols-2 gap-3">
      <div><Label htmlFor="origem">Origem</Label><Input id="origem" required value={origin} onChange={e=>setOrigin(e.target.value.toUpperCase())} maxLength={10} className="h-11 mt-1" placeholder="SAO"/></div>
      <div><Label htmlFor="destino">Destino</Label><Input id="destino" required value={dest} onChange={e=>setDest(e.target.value.toUpperCase())} maxLength={10} className="h-11 mt-1" placeholder="MXP"/></div>
      <div><Label htmlFor="data-voo">Data do voo</Label><Input id="data-voo" type="date" required value={depart} onChange={e=>setDepart(e.target.value)} className="h-11 mt-1"/></div>
      <div><Label htmlFor="valor-voo">R$ por pessoa</Label><Input id="valor-voo" type="number" min=".01" step=".01" required value={value} onChange={e=>setValue(e.target.value)} className="h-11 mt-1" placeholder="0,00"/></div>
     </div>
     <div><Label htmlFor="cia">Companhia aérea (opcional)</Label><Input id="cia" value={airline} onChange={e=>setAirline(e.target.value)} className="h-11 mt-1"/></div>
     <div><Label htmlFor="fonte">Fonte / observação</Label><Input id="fonte" value={source} onChange={e=>setSource(e.target.value)} className="h-11 mt-1" placeholder="Ex.: Google Flights, bagagem incluída"/></div>
     <div><Label htmlFor="link-voo">Link da tarifa (opcional)</Label><Input id="link-voo" inputMode="url" value={offerUrl} onChange={e=>setOfferUrl(e.target.value)} className="h-11 mt-1" placeholder="https://..."/></div>
     <Button type="submit" disabled={busy} className="w-full h-12 rounded-full">{busy?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:null}Salvar no histórico das três</Button>
    </form>
    <section className="rounded-3xl border border-[#e8e5dc] bg-white p-5 sm:p-6 shadow-card">
     <div className="flex justify-between items-center gap-3"><h2 className="font-display text-3xl">Histórico compartilhado</h2><span className="text-xs text-muted-foreground">{matching.length} registro(s)</span></div>
     <label className="relative block mt-4"><Search className="absolute left-3 top-3.5 h-4 w-4 text-olive/50"/><Input aria-label="Filtrar preços" className="pl-10 h-11" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar rota, fonte ou companhia"/></label>
     {loading?<p className="mt-6 flex gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Consultando tarifas…</p>:matching.length===0?<p className="mt-6 text-sm text-muted-foreground">Nenhuma tarifa registrada. Os dados antigos salvos apenas no navegador não foram importados automaticamente.</p>:
      <div className="space-y-3 mt-5">{matching.map(p=><article key={p.id} className="rounded-2xl bg-[#f7f7f2] p-4 border border-[#eceade]">
       <div className="flex justify-between gap-3 items-start"><div><p className="font-semibold text-sm">{p.origin} → {p.destination}</p><p className="text-xs mt-1 text-muted-foreground">{p.departure_date.split("-").reverse().join("/")} · {p.airline||"Companhia não informada"}</p></div>
       <strong className="text-sm text-olive text-right">{brl(Number(p.price_per_person_brl))}<span className="block text-[10px] font-normal">por pessoa</span></strong></div>
       <p className="text-[11px] mt-3 text-muted-foreground">Registrado em {new Date(p.searched_at).toLocaleDateString("pt-BR")} · {p.source||"Fonte não informada"}</p>
       <div className="flex flex-wrap items-center gap-4 mt-2">{p.offer_url&&<a href={p.offer_url} target="_blank" rel="noreferrer" className="min-h-9 flex items-center gap-1 text-xs text-olive">Abrir link <ExternalLink className="h-3 w-3"/></a>}
       <button type="button" disabled={busy} onClick={()=>void remove("flight_price_history",p.id)} className="min-h-9 flex gap-1 items-center text-xs text-[#ae7365]"><Trash2 className="h-3 w-3"/>Excluir</button></div>
      </article>)}</div>}
    </section>
   </div>}

   {tab==="coupons"&&<div className="mt-6 grid lg:grid-cols-[.9fr_1.1fr] gap-5 items-start">
    <form onSubmit={saveCoupon} className="rounded-3xl border border-[#e8e5dc] bg-white p-5 sm:p-6 shadow-card space-y-4">
     <h2 className="font-display text-3xl">Guardar cupom ou link</h2><p className="text-xs text-muted-foreground">Só registrar: o site não confirma automaticamente se um cupom está ativo.</p>
     <div><Label htmlFor="cupom-title">Oportunidade</Label><Input id="cupom-title" required value={couponTitle} onChange={e=>setCouponTitle(e.target.value)} className="h-11 mt-1" placeholder="Ex.: desconto em hotel"/></div>
     <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="cupom-merchant">Loja / empresa</Label><Input id="cupom-merchant" value={couponMerchant} onChange={e=>setCouponMerchant(e.target.value)} className="h-11 mt-1"/></div>
      <div><Label htmlFor="cupom-code">Código (se houver)</Label><Input id="cupom-code" value={couponCode} onChange={e=>setCouponCode(e.target.value)} className="h-11 mt-1"/></div></div>
     <div><Label htmlFor="cupom-url">Link</Label><Input id="cupom-url" inputMode="url" value={couponUrl} onChange={e=>setCouponUrl(e.target.value)} className="h-11 mt-1" placeholder="https://..."/></div>
     <div><Label htmlFor="cupom-expires">Validade informada (opcional)</Label><Input id="cupom-expires" type="date" value={couponExpiry} onChange={e=>setCouponExpiry(e.target.value)} className="h-11 mt-1"/></div>
     <div><Label htmlFor="cupom-notes">Condições / observações</Label><Input id="cupom-notes" value={couponNotes} onChange={e=>setCouponNotes(e.target.value)} className="h-11 mt-1" placeholder="Ex.: conferir desconto no checkout"/></div>
     <Button type="submit" disabled={busy} className="w-full h-12 rounded-full"><Plus className="h-4 w-4 mr-2"/>Guardar para o grupo</Button>
    </form>
    <section className="rounded-3xl border border-[#e8e5dc] bg-white p-5 sm:p-6 shadow-card">
     <h2 className="font-display text-3xl">Oportunidades salvas</h2>
     {loading?<p className="mt-5 text-sm">Carregando…</p>:coupons.length===0?<p className="mt-5 text-sm text-muted-foreground">Nenhum cupom ou link salvo ainda.</p>:
      <div className="space-y-3 mt-5">{coupons.map(c=><div key={c.id} className="rounded-2xl bg-[#f7f7f2] p-4 border border-[#eceade]">
       <p className="font-semibold text-sm">{c.title}</p><p className="text-xs text-muted-foreground mt-1">{c.merchant||"Fornecedor não informado"}{c.expires_at?" · validade informada: "+c.expires_at.split("-").reverse().join("/"):""}</p>
       {c.code&&<p className="mt-2 text-xs text-olive font-semibold">Código: {c.code}</p>}{c.notes&&<p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>}
       <p className="text-[11px] text-[#a17a58] mt-2">Status: condições não verificadas automaticamente</p>
       <div className="flex gap-4 mt-2">{c.url&&<a href={c.url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-xs text-olive"><ExternalLink className="h-3 w-3"/>Abrir oferta</a>}
       <button type="button" disabled={busy} onClick={()=>void remove("travel_coupons",c.id)} className="inline-flex min-h-9 gap-1 items-center text-xs text-[#ae7365]"><Trash2 className="h-3 w-3"/>Excluir</button></div>
      </div>)}</div>}
    </section>
   </div>}

   <div className="mt-7 rounded-2xl border border-[#e0e3d4] bg-[#eff1e9] p-5 text-xs text-[#6b7567] leading-relaxed">
    <strong className="text-olive">Critério de compra:</strong> preço real com bagagem, conexões, hospedagem extra e transporte terrestre. O teto de R$ 4.500 e o alerta de R$ 3.800 eram referências do planejamento de 2027 e precisam ser revisados para 2028. Não são preços atuais.
   </div>
  </main>
 </div>;
}
function Stat({label,value,sub}:{label:string;value:string;sub:string}){return <div className="rounded-[22px] bg-white border border-[#e9e6df] p-4 shadow-card"><p className="text-[11px] text-[#848a7e]">{label}</p><p className="font-display text-2xl md:text-3xl leading-tight mt-2 text-ink">{value}</p><p className="text-[11px] text-[#868c80] mt-1">{sub}</p></div>;}
