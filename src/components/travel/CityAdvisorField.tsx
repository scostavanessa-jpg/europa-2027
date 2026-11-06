import { useEffect, useMemo, useState } from "react";
import { Check, Compass, ExternalLink, Loader2, MapPin, Search, Sparkles } from "lucide-react";
import {
  CITIES, COUNTRIES, type GeoPlace, type RouteStop,
  countryName, evaluateFit, normalizeLocation, rankedCityIdeas
} from "@/lib/destinationAdvisor";

type Props = {
  prefix: string;
  countryCode: string;
  city: string;
  selected: GeoPlace | null;
  stops: RouteStop[];
  onCountryChange: (code: string) => void;
  onCityChange: (city: string) => void;
  onSelect: (place: GeoPlace) => void;
};
const fitColor:Record<string,string>={
  easy:"bg-[#e8f0e4] text-[#4a6a48]",
  possible:"bg-[#e9efdf] text-[#61744e]",
  detour:"bg-[#f7f0e1] text-[#977347]",
  difficult:"bg-[#f8e7e2] text-[#9a5f55]",
  unknown:"bg-secondary text-muted-foreground"
};
export function CityAdvisorField({
  prefix,countryCode,city,selected,stops,onCountryChange,onCityChange,onSelect
}:Props){
  const [remote,setRemote]=useState<GeoPlace[]>([]);
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState("");
  const normalized=normalizeLocation(city);
  useEffect(()=>{
    setRemote([]);
    setSearchError("");
    if(!countryCode||city.trim().length<3)return;
    const control=new AbortController();
    const timer=window.setTimeout(async()=>{
      setSearching(true);
      try{
        const url=new URL("https://geocoding-api.open-meteo.com/v1/search");
        url.searchParams.set("name",city.trim());
        url.searchParams.set("countryCode",countryCode);
        url.searchParams.set("language","pt");
        url.searchParams.set("count","12");
        const r=await fetch(url.toString(),{signal:control.signal});
        if(!r.ok)throw Error("Pesquisa indisponível.");
        const json=await r.json() as {results?:{name:string;latitude:number;longitude:number;country_code:string;admin1?:string}[]};
        const found=(json.results||[]).filter(x=>x.country_code===countryCode&&Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)).map(x=>({
          name:x.name,countryCode,country:countryName(countryCode),
          latitude:x.latitude,longitude:x.longitude,source:"geonames" as const,region:x.admin1
        }));
        if(!control.signal.aborted)setRemote(found);
      }catch(e:any){
        if(!control.signal.aborted)setSearchError("Busca online indisponível. As sugestões locais continuam disponíveis.");
      }finally{if(!control.signal.aborted)setSearching(false);}
    },420);
    return()=>{window.clearTimeout(timer);control.abort();setSearching(false);};
  },[countryCode,city]);
  const suggestions=useMemo(()=>{
    if(!countryCode)return [];
    const local=city.trim().length>=2
      ? CITIES.filter(x=>x.countryCode===countryCode&&normalizeLocation(x.name).includes(normalized)).slice(0,12)
      : rankedCityIdeas(countryCode,stops,8);
    const unique=new Map<string,GeoPlace>();
    for(const p of [...local,...remote]){
      const key=normalizeLocation(p.name)+":"+p.countryCode;
      if(!unique.has(key))unique.set(key,p);
    }
    return [...unique.values()].slice(0,8).sort((a,b)=>(evaluateFit(a,stops).distanceKm??Infinity)-(evaluateFit(b,stops).distanceKm??Infinity));
  },[countryCode,city,remote,stops,normalized]);

  const fit=selected?evaluateFit(selected,stops):null;
  const mapLink=selected?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(selected.name+", "+selected.country):"";
  return <div className="space-y-3">
    <div className="grid sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor={prefix+"-country"} className="text-sm font-medium text-ink">País de interesse</label>
        <select id={prefix+"-country"} value={countryCode} onChange={e=>onCountryChange(e.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
          <option value="">Escolha um país</option>
          {COUNTRIES.map(p=><option value={p.code} key={p.code}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={prefix+"-city"} className="text-sm font-medium text-ink">Cidade ou região</label>
        <div className="relative mt-1.5"><Search className="absolute left-3 top-3.5 h-4 w-4 text-olive/60"/>
          <input id={prefix+"-city"} value={city} onChange={e=>onCityChange(e.target.value)}
            disabled={!countryCode} placeholder="Ex.: Bruges, Colmar, Como…"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm disabled:opacity-60"/>
        </div>
      </div>
    </div>
    {countryCode&&<div className="rounded-2xl border border-olive/15 bg-[#f5f6ee] p-3 sm:p-4">
      <div className="flex justify-between items-center gap-2 mb-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-olive">
          <Sparkles className="h-4 w-4"/>
          {city.trim().length>=2?"Cidades encontradas":"Cidades deste país próximas ao roteiro"}
        </div>
        {searching&&<Loader2 className="h-4 w-4 text-olive animate-spin"/>}
      </div>
      {suggestions.length>0?<div className="grid sm:grid-cols-2 gap-2">
        {suggestions.map(p=>{
          const result=evaluateFit(p,stops);
          const active=selected?.countryCode===p.countryCode&&Math.abs((selected.latitude||0)-p.latitude)<0.0001&&Math.abs((selected.longitude||0)-p.longitude)<0.0001;
          return <button key={p.name+":"+p.countryCode+":"+p.latitude} type="button"
            onClick={()=>onSelect(p)}
            className={"flex items-start gap-2.5 text-left rounded-xl border p-3 min-h-[78px] transition-colors "+(active?"bg-white border-olive shadow-sm":"bg-white/70 border-transparent hover:border-olive/30")}>
            <span className="mt-1 grid place-items-center size-7 shrink-0 rounded-full bg-[#e9efde] text-olive">
              {active?<Check className="h-4 w-4"/>:<MapPin className="h-3.5 w-3.5"/>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{p.name}{p.region&&p.source==="geonames"?<span className="block text-[10px] font-normal text-muted-foreground">{p.region}</span>:null}</span>
              <span className="block text-[11px] mt-1 text-muted-foreground">
                {result.nearest&&typeof result.distanceKm==="number"
                  ?`≈ ${result.distanceKm} km de ${result.nearest} (linha reta)`
                  :"Sem rota de referência"}
              </span>
            </span>
          </button>;
        })}
      </div>:<p className="text-xs text-muted-foreground">Nenhuma cidade correspondente no catálogo. Tente outro nome ou uma cidade maior próxima.</p>}
      {searchError&&<p className="text-xs mt-3 text-[#9d7147]">{searchError}</p>}
      <p className="text-[11px] mt-3 leading-relaxed text-muted-foreground">
        As sugestões são ordenadas pela proximidade geográfica com as paradas já salvas. Cidades pesquisadas online: dados de <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo / GeoNames</a>.
      </p>
    </div>}
    {fit&&selected&&<div className="rounded-2xl bg-white border border-olive/20 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Compass className="h-4 w-4 text-olive"/>
        <span className="font-medium text-sm text-ink">{selected.name}, {selected.country}</span>
        <span className={"text-[11px] px-2.5 py-1 rounded-full font-semibold "+fitColor[fit.level]}>{fit.title}</span>
      </div>
      <p className="mt-2 text-sm text-[#677061] leading-relaxed">{fit.detail}</p>
      <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1.5 items-center min-h-9 mt-2 text-xs text-olive font-medium">
        Conferir no mapa <ExternalLink className="h-3.5 w-3.5"/>
      </a>
    </div>}
    {countryCode&&city.trim()&&!selected&&<p className="text-xs text-[#9e794d]">
      Escolha uma cidade sugerida para receber a avaliação de proximidade. Se salvar apenas o texto, nenhuma distância será presumida.
    </p>}
  </div>;
}
