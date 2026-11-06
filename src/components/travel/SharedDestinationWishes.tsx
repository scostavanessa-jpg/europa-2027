import { FormEvent, useEffect, useState } from "react";
import { CityAdvisorField } from "@/components/travel/CityAdvisorField";
import { type GeoPlace, type RouteStop, evaluateFit, countryName } from "@/lib/destinationAdvisor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Compass, Loader2, MapPinned, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Wish={
 id:string; title:string;city:string;country:string;latitude:number|null;longitude:number|null;
 priority:string;notes:string|null;created_by:string;status:string;route_item_id:string|null;
};
export function SharedDestinationWishes({routeStops,onPromoted}:{routeStops:RouteStop[];onPromoted:()=>Promise<void>}){
 const {user,isOrganizadora}=useAuth();
 const [wishes,setWishes]=useState<Wish[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [countryCode,setCountryCode]=useState("");
 const [city,setCity]=useState("");
 const [chosen,setChosen]=useState<GeoPlace|null>(null);
 const [activity,setActivity]=useState("");
 const [priority,setPriority]=useState("Desejável");
 const [notes,setNotes]=useState("");
 const [error,setError]=useState("");

 const load=async()=>{
   setLoading(true);setError("");
   try{
     const {data,error:e}=await supabase.from("destination_wishes")
       .select("id,title,city,country,latitude,longitude,priority,notes,created_by,status,route_item_id")
       .order("created_at",{ascending:false});
     if(e)throw e;
     setWishes((data||[]) as Wish[]);
   }catch(e:any){setError(e?.message||"Não foi possível carregar os lugares de desejo.");}
   finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[]);
 const submit=async(e:FormEvent)=>{
   e.preventDefault();
   if(!user?.id||busy)return;
   if(!chosen)return toast.error("Escolha uma cidade da lista para receber avaliação do trajeto.");
   setBusy(true);
   try{
     const {error:e2}=await supabase.from("destination_wishes").insert({
       created_by:user.id,title:activity.trim()||"Conhecer "+chosen.name,
       city:chosen.name,country:chosen.country,
       latitude:chosen.latitude,longitude:chosen.longitude,priority,notes:notes.trim()||null
     });
     if(e2)throw e2;
     toast.success("Novo lugar de desejo salvo para as três. Ainda não é parada confirmada.");
     setCity("");setChosen(null);setActivity("");setNotes("");await load();
   }catch(e:any){toast.error("Não consegui guardar esse desejo.",{description:e?.message});}
   finally{setBusy(false);}
 };
 const promote=async(wish:Wish)=>{
   if(!window.confirm("Incluir "+wish.city+" no roteiro compartilhado? A cidade entrará como parada planejada, não como reserva."))return;
   setBusy(true);
   try{
     const {error:e}=await supabase.rpc("promote_destination_wish",{p_wish_id:wish.id});
     if(e)throw e;
     toast.success(wish.city+" incluída no roteiro. Ajustem a ordem e os dias.");
     await Promise.all([load(),onPromoted()]);
   }catch(e:any){toast.error("Não consegui incluir no roteiro.",{description:e?.message});}
   finally{setBusy(false);}
 };
 const remove=async(wish:Wish)=>{
   if(!window.confirm("Apagar essa sugestão do grupo? Uma parada já incluída no roteiro não será apagada automaticamente."))return;
   setBusy(true);
   try{
     const {error:e}=await supabase.from("destination_wishes").delete().eq("id",wish.id);
     if(e)throw e;
     toast.success("Desejo removido.");await load();
   }catch(e:any){toast.error("Não consegui apagar.",{description:e?.message});}
   finally{setBusy(false);}
 };
 return <div className="space-y-5">
   <section className="rounded-3xl border border-gold/25 bg-card p-5 sm:p-6 shadow-card">
     <div className="flex items-start gap-3">
       <span className="grid place-items-center h-11 w-11 bg-[#edf1e7] rounded-2xl text-olive"><Compass className="h-5 w-5"/></span>
       <div><h2 className="font-display text-3xl text-ink">Onde ainda podemos ir?</h2>
         <p className="text-sm mt-1 leading-relaxed text-muted-foreground">Escolha um país: o site indica cidades próximas das paradas já previstas e avalia se encaixá-las faz sentido. Salvar um desejo não altera o roteiro automaticamente.</p>
       </div>
     </div>
     <form onSubmit={submit} className="mt-6 space-y-4">
       <CityAdvisorField prefix="group-ideas" countryCode={countryCode} city={city} selected={chosen} stops={routeStops}
         onCountryChange={code=>{setCountryCode(code);setCity("");setChosen(null);}}
         onCityChange={value=>{setCity(value);setChosen(null);}}
         onSelect={place=>{setChosen(place);setCity(place.name);setCountryCode(place.countryCode);}}/>
       <div className="grid md:grid-cols-2 gap-3">
         <div><Label htmlFor="group-activity">O que queremos conhecer? (opcional)</Label>
           <Input id="group-activity" value={activity} onChange={e=>setActivity(e.target.value)}
             placeholder="Ex.: centro histórico, museu, passeio de trem…" className="mt-1 h-11"/></div>
         <div><Label htmlFor="group-priority">Prioridade da sugestão</Label>
           <select id="group-priority" className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
             value={priority} onChange={e=>setPriority(e.target.value)}>
             <option>Imperdível</option><option>Desejável</option><option>Opcional</option>
           </select>
         </div>
         <div className="md:col-span-2"><Label htmlFor="group-notes">Observações para as amigas</Label>
           <Input id="group-notes" value={notes} onChange={e=>setNotes(e.target.value)}
             placeholder="Por que queremos ir? Precisa de ingresso?" className="mt-1 h-11"/></div>
       </div>
       <Button type="submit" disabled={!chosen||busy} className="min-h-11 rounded-full">
         {busy?<Loader2 className="h-4 w-4 mr-2 animate-spin"/>:<Plus className="h-4 w-4 mr-2"/>}
         Guardar na lista de desejos do grupo
       </Button>
     </form>
   </section>
   <section className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-card">
     <div className="flex justify-between items-center gap-3 mb-4">
       <h2 className="font-display text-2xl text-ink">Lugares no radar</h2>
       <span className="text-xs text-muted-foreground">{wishes.length} sugestão(ões)</span>
     </div>
     {error&&<p role="alert" className="text-sm text-destructive mb-4">{error} <button type="button" className="underline" onClick={()=>void load()}>Tentar novamente</button></p>}
     {loading?<p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Carregando…</p>:
     wishes.length===0?<p className="text-sm text-muted-foreground rounded-2xl bg-secondary/40 p-6">Nenhuma sugestão ainda. Escolham um país e descubram o que fica no caminho.</p>:
     <div className="grid md:grid-cols-2 gap-3">{wishes.map(w=>{
       const geo=w.latitude!==null&&w.longitude!==null?
         {name:w.city,country:w.country,countryCode:"",latitude:w.latitude,longitude:w.longitude,source:"curated" as const}:null;
       const fit=geo?evaluateFit(geo,routeStops):null;
       return <article key={w.id} className="rounded-2xl border border-[#e8e8df] bg-[#fafaf6] p-4">
         <div className="flex items-start justify-between gap-2">
           <div><p className="text-[11px] uppercase tracking-wide text-olive/75">{w.country} · {w.priority}</p>
             <h3 className="font-display text-2xl text-ink mt-1">{w.city}</h3><p className="text-sm mt-1 font-medium">{w.title}</p>
           </div>
           {w.status==="roteiro"?<CheckCircle2 className="h-5 w-5 shrink-0 text-[#5e8869]"/>:<MapPinned className="h-5 w-5 shrink-0 text-olive/50"/>}
         </div>
         {w.notes&&<p className="text-xs leading-relaxed mt-2 text-muted-foreground">{w.notes}</p>}
         {fit&&<div className="mt-3 rounded-xl bg-[#eef1e6] p-3 text-xs text-[#5e7054]">
           <strong>{fit.title}</strong><p className="mt-1 leading-relaxed">{fit.detail}</p>
         </div>}
         <div className="mt-3 flex flex-wrap gap-2 items-center">
           {w.status!=="roteiro"?<button type="button" disabled={busy} onClick={()=>void promote(w)}
             className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-olive border border-olive/25 rounded-full px-3 bg-white">
             <Plus className="h-3.5 w-3.5"/>Incluir no roteiro
           </button>:<span className="text-xs text-[#59805c] inline-flex gap-1 items-center"><CheckCircle2 className="h-3.5 w-3.5"/>Incluído no roteiro</span>}
           {(isOrganizadora||w.created_by===user?.id)&&<button type="button" disabled={busy} onClick={()=>void remove(w)}
             className="inline-flex min-h-10 items-center gap-1 text-xs text-[#a27365] px-2"><Trash2 className="h-3.5 w-3.5"/>Excluir ideia</button>}
         </div>
       </article>;
     })}</div>}
     <p className="text-[11px] text-muted-foreground mt-5">As recomendações estimam distância em linha reta até o roteiro; não incluem horários, tarifas nem validação de trem. Confirmem trajetos antes de decidir.</p>
   </section>
 </div>;
}
