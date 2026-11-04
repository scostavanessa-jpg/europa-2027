import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Link2, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type TravelLink = {id:string;title:string;url:string;kind:string;note:string|null;created_by:string};
const kinds=["Chat","Reserva","Documento","Transporte","Outros"];

export function TravelLinks(){
 const {user,isOrganizadora}=useAuth();
 const [links,setLinks]=useState<TravelLink[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [open,setOpen]=useState(false);
 const [title,setTitle]=useState("");
 const [url,setUrl]=useState("");
 const [kind,setKind]=useState("Chat");
 const [note,setNote]=useState("");
 const [error,setError]=useState("");
 const load=async()=>{
  setLoading(true);setError("");
  try{
   const {data,error:e}=await supabase.from("travel_links").select("id,title,url,kind,note,created_by").order("created_at",{ascending:false});
   if(e)throw e;
   setLinks((data||[]) as TravelLink[]);
  }catch(e:any){setError(e?.message||"Não foi possível carregar os links compartilhados.");}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[user?.id]);
 const submit=async(e:FormEvent)=>{
  e.preventDefault();if(!user?.id||busy)return;
  let safe:string;
  try{
   const u=new URL(url);
   if(!["http:","https:"].includes(u.protocol))throw Error("O link precisa usar http ou https.");
   safe=u.toString();
  }catch{return toast.error("Cole um endereço de link válido começando com https://");}
  if(!title.trim())return toast.error("Dê um nome ao link.");
  setBusy(true);
  try{
   const {error:e2}=await supabase.from("travel_links").insert({
    title:title.trim(),url:safe,kind,note:note.trim()||null,created_by:user.id
   });
   if(e2)throw e2;
   setTitle("");setUrl("");setNote("");setKind("Chat");setOpen(false);
   toast.success("Link salvo para as três.");await load();
  }catch(e:any){toast.error("Não consegui salvar o link.",{description:e?.message});}
  finally{setBusy(false);}
 };
 const remove=async(entry:TravelLink)=>{
  if(!window.confirm("Excluir este link do grupo?"))return;
  setBusy(true);
  try{
   const {error:e}=await supabase.from("travel_links").delete().eq("id",entry.id);
   if(e)throw e;
   toast.success("Link removido.");await load();
  }catch(e:any){toast.error("Não consegui remover.",{description:e?.message});}
  finally{setBusy(false);}
 };
 return <section className="mt-7 rounded-[26px] border border-[#e5e6d9] bg-card p-5 sm:p-7 shadow-card">
   <div className="flex flex-wrap justify-between gap-3 items-start">
    <div className="flex gap-3 items-center"><span className="grid place-items-center w-11 h-11 bg-[#ecf0e4] rounded-2xl"><Link2 className="w-5 h-5 text-olive"/></span>
      <div><p className="text-xs uppercase tracking-wider text-olive/75">Para encontrar rápido</p><h2 className="font-display text-3xl text-ink">Links da nossa viagem</h2></div>
    </div>
    <Button variant="outline" className="rounded-full min-h-11" onClick={()=>setOpen(o=>!o)}><Plus className="w-4 h-4 mr-1.5"/>Adicionar</Button>
   </div>
   <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Guardem aqui links de reservas, documentos, transportes e o endereço do chat que escolherem usar. Um link de conversa compartilhada do ChatGPT pode ser apenas uma visualização, não necessariamente um chat colaborativo ao vivo.</p>
   {open&&<form onSubmit={submit} className="mt-5 rounded-2xl border border-[#e3e5d9] bg-[#f8f8f3] p-4 space-y-3">
     <div><Label htmlFor="link-title">Nome do link</Label><Input id="link-title" className="mt-1 h-11" placeholder="Ex.: Nosso chat da viagem" required value={title} onChange={e=>setTitle(e.target.value)}/></div>
     <div><Label htmlFor="link-url">Endereço completo</Label><Input id="link-url" type="url" inputMode="url" className="mt-1 h-11" placeholder="https://..." required value={url} onChange={e=>setUrl(e.target.value)}/></div>
     <div className="grid sm:grid-cols-2 gap-3"><div><Label htmlFor="link-kind">Tipo</Label><select id="link-kind" value={kind} onChange={e=>setKind(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">{kinds.map(k=><option key={k}>{k}</option>)}</select></div>
      <div><Label htmlFor="link-note">Nota opcional</Label><Input id="link-note" className="mt-1 h-11" value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: Link atualizado para 2028"/></div></div>
     <Button type="submit" disabled={busy} className="h-11 w-full rounded-full">{busy?"Salvando…":"Guardar para o grupo"}</Button>
   </form>}
   {error&&<p role="alert" className="mt-4 text-sm text-destructive">{error} <button type="button" className="underline" onClick={()=>void load()}>Tentar novamente</button></p>}
   {loading?<p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Carregando…</p>:
     links.length===0?<div className="mt-5 rounded-2xl border border-dashed border-[#d5ddc8] p-6 text-center"><MessageCircle className="h-7 w-7 mx-auto text-olive/40"/><p className="text-sm mt-3 text-muted-foreground">Nenhum link guardado ainda. Adicione o primeiro para as três encontrarem aqui.</p></div>:
     <div className="grid sm:grid-cols-2 gap-3 mt-5">{links.map(item=><div key={item.id} className="flex flex-col rounded-2xl border border-[#e9e8df] bg-[#f9faf5] p-4">
      <p className="text-[10px] uppercase tracking-widest text-olive/70 font-semibold">{item.kind}</p>
      <h3 className="font-semibold text-sm text-ink mt-1 break-words">{item.title}</h3>
      {item.note&&<p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
      <div className="flex mt-auto pt-3 items-center gap-3">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 min-h-10 text-sm font-medium text-olive">Abrir link <ArrowUpRight className="h-4 w-4"/></a>
        {(item.created_by===user?.id||isOrganizadora)&&<button type="button" disabled={busy} onClick={()=>void remove(item)} className="ml-auto min-h-10 px-2 text-xs text-[#a4786d] inline-flex gap-1 items-center"><Trash2 className="h-4 w-4"/>Excluir</button>}
      </div>
     </div>)}</div>
   }
 </section>;
}
