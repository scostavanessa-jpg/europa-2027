import { useChecklist } from "@/hooks/useChecklist";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
type Priority = "Urgente" | "Importante" | "Pode esperar";
const items:{id:string;label:string;priority:Priority;note?:string}[]=[
{id:"voos",label:"Passagens aéreas",priority:"Urgente",note:"Radar e metas de preço até a janela de compra"},
{id:"passaporte",label:"Passaportes e documentos",priority:"Urgente",note:"Validade e exigências do Reino Unido/Europa"},
{id:"escola",label:"Intercâmbio em Liverpool",priority:"Urgente",note:"Curso, datas, acomodação e documentação"},
{id:"hospedagem",label:"Estadias do roteiro europeu",priority:"Importante",note:"Priorizar cancelamento grátis enquanto a rota estiver aberta"},
{id:"trens",label:"Trens e deslocamentos europeus",priority:"Importante",note:"Comprar na janela certa depois da rota confirmada"},
{id:"seguro",label:"Seguro viagem",priority:"Importante"},
{id:"cambio",label:"Câmbio & cartões",priority:"Pode esperar",note:"Acompanhar EUR e GBP"},
{id:"jiu",label:"Treino de jiu-jitsu em Liverpool",priority:"Pode esperar",note:"Validar academia, horários e política de visitante"},
];
const badge=(p:Priority)=>p==="Urgente"?"bg-destructive/10 text-destructive":p==="Importante"?"bg-warning/15 text-warning":"bg-success/10 text-success";
export const CriticalBuy=()=>{const{checked,toggle}=useChecklist("critical-buy");return <section id="comprar" className="bg-secondary/40 border-y border-border/60"><div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl"><div className="mb-10 max-w-2xl"><p className="text-xs tracking-[0.3em] uppercase text-destructive mb-3">Próximas decisões</p><h2 className="font-display text-4xl md:text-5xl text-ink">O que precisa entrar no radar</h2><p className="mt-4 text-muted-foreground">Marque conforme resolver. Nesta primeira versão o estado fica salvo neste aparelho.</p></div><ul className="space-y-3">{items.map(it=>{const on=!!checked[it.id];return <li key={it.id}><button onClick={()=>toggle(it.id)} className={cn("w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-card text-left transition-all hover:border-olive/40",on&&"opacity-60")}><span className={cn("flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center",on?"bg-olive border-olive":"border-olive/40")}>{on&&<Check className="h-4 w-4 text-primary-foreground" strokeWidth={3}/>}</span><div className="flex-1 min-w-0"><p className={cn("font-medium text-ink",on&&"line-through")}>{it.label}</p>{it.note&&<p className="text-xs text-muted-foreground mt-1">{it.note}</p>}</div><span className={cn("text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap",badge(it.priority))}>{it.priority}</span></button></li>})}</ul></div></section>};