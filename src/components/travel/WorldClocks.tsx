import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
const ZONES = [
  { city: "Brasília", tz: "America/Sao_Paulo", flag: "🇧🇷" },
  { city: "Milão", tz: "Europe/Rome", flag: "🇮🇹" },
  { city: "St. Moritz", tz: "Europe/Zurich", flag: "🇨🇭" },
  { city: "Liverpool", tz: "Europe/London", flag: "🇬🇧" },
];
const fmt = (tz:string) => new Intl.DateTimeFormat("pt-BR",{timeZone:tz,hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());
const fmtDate = (tz:string) => new Intl.DateTimeFormat("pt-BR",{timeZone:tz,weekday:"short",day:"2-digit",month:"short"}).format(new Date());
export const WorldClocks = () => { const [,force]=useState(0); useEffect(()=>{const t=setInterval(()=>force(n=>n+1),60000);return()=>clearInterval(t)},[]); return <section className="container mx-auto px-6 max-w-6xl pt-6 no-print"><div className="flex items-center gap-2 mb-3"><Clock className="h-4 w-4 text-olive"/><span className="text-xs uppercase tracking-[0.3em] text-olive">Hora ao vivo</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">{ZONES.map(z=><div key={z.tz} className="rounded-2xl bg-card border border-border/60 p-3 shadow-card"><div className="text-xs text-foreground/70 flex items-center gap-1"><span>{z.flag}</span><span>{z.city}</span></div><div className="font-display text-2xl text-ink tabular-nums leading-none mt-1">{fmt(z.tz)}</div><div className="text-[10px] text-muted-foreground mt-1 capitalize">{fmtDate(z.tz)}</div></div>)}</div></section>; };