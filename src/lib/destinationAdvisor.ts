export type GeoPlace = {
  name: string;
  countryCode: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "curated" | "geonames";
  region?: string;
};
export type RouteStop = { city: string; country?: string | null };
export type FitLevel = "easy" | "possible" | "detour" | "difficult" | "unknown";
export type RouteFit = {
  level: FitLevel;
  title: string;
  detail: string;
  nearest?: string;
  distanceKm?: number;
};
export const COUNTRIES: ReadonlyArray<{code:string;name:string}> = [
  {code:"IT",name:"Itália"},{code:"CH",name:"Suíça"},{code:"FR",name:"França"},
  {code:"BE",name:"Bélgica"},{code:"NL",name:"Países Baixos"},
  {code:"GB",name:"Reino Unido"},{code:"DE",name:"Alemanha"},
  {code:"AT",name:"Áustria"},{code:"ES",name:"Espanha"},
  {code:"PT",name:"Portugal"},{code:"LU",name:"Luxemburgo"},
  {code:"CZ",name:"República Tcheca"},{code:"IE",name:"Irlanda"},
  {code:"DK",name:"Dinamarca"},{code:"PL",name:"Polônia"},
  {code:"HU",name:"Hungria"},{code:"SI",name:"Eslovênia"},
  {code:"HR",name:"Croácia"},{code:"SE",name:"Suécia"},
  {code:"NO",name:"Noruega"},{code:"GR",name:"Grécia"},
];
export const countryName = (code:string) => COUNTRIES.find(c=>c.code===code)?.name||code;
export const countryCodeFromName = (name:string|null|undefined) => {
  const n=normalizeLocation(name||"");
  const aliases:Record<string,string> = {
    "uk":"GB","england":"GB","great britain":"GB","united kingdom":"GB","reino unido":"GB",
    "holanda":"NL","netherlands":"NL","paises baixos":"NL",
    "switzerland":"CH","suisse":"CH","italy":"IT","belgium":"BE",
    "germany":"DE","alemania":"DE","austria":"AT","republica checa":"CZ",
    "czechia":"CZ","czech republic":"CZ"
  };
  return COUNTRIES.find(c=>normalizeLocation(c.name)===n)?.code||aliases[n]||"";
};
export function normalizeLocation(value:string):string{
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
}
type RawPlace = [string,string,number,number];
const raw:RawPlace[] = [
 ["Milão","IT",45.464,9.190],["Tirano","IT",46.216,10.167],["Como","IT",45.808,9.085],
 ["Bergamo","IT",45.698,9.677],["Verona","IT",45.439,10.992],["Veneza","IT",45.440,12.316],
 ["Bolonha","IT",44.494,11.343],["Florença","IT",43.770,11.256],["Roma","IT",41.903,12.496],
 ["Turim","IT",45.070,7.686],["Desenzano del Garda","IT",45.472,10.533],
 ["St. Moritz","CH",46.497,9.839],["Chur","CH",46.852,9.530],["Zurique","CH",47.377,8.541],
 ["Lucerna","CH",47.051,8.310],["Interlaken","CH",46.687,7.863],["Basileia","CH",47.559,7.588],
 ["Berna","CH",46.948,7.448],["Genebra","CH",46.205,6.143],["Lugano","CH",46.003,8.951],
 ["Strasbourg","FR",48.573,7.753],["Colmar","FR",48.079,7.358],["Paris","FR",48.857,2.352],
 ["Lyon","FR",45.764,4.835],["Annecy","FR",45.900,6.130],["Lille","FR",50.630,3.057],
 ["Metz","FR",49.119,6.177],["Reims","FR",49.258,4.032],["Mulhouse","FR",47.751,7.335],
 ["Bruxelas","BE",50.850,4.352],["Bruges","BE",51.209,3.224],
 ["Ghent","BE",51.054,3.717],["Antuérpia","BE",51.219,4.402],
 ["Leuven","BE",50.880,4.701],["Dinant","BE",50.260,4.910],
 ["Amsterdam","NL",52.367,4.904],["Haarlem","NL",52.387,4.647],
 ["Utrecht","NL",52.091,5.122],["Roterdã","NL",51.925,4.477],
 ["Delft","NL",52.012,4.357],["Haia","NL",52.080,4.310],
 ["Maastricht","NL",50.851,5.690],
 ["Londres","GB",51.507,-0.128],["Liverpool","GB",53.408,-2.992],
 ["Manchester","GB",53.480,-2.244],["York","GB",53.958,-1.083],
 ["Chester","GB",53.194,-2.893],["Bath","GB",51.375,-2.360],
 ["Oxford","GB",51.752,-1.255],["Cambridge","GB",52.205,0.122],
 ["Edimburgo","GB",55.953,-3.189],["Brighton","GB",50.823,-0.137],
 ["Freiburg","DE",47.999,7.842],["Baden-Baden","DE",48.762,8.240],
 ["Colônia","DE",50.938,6.960],["Aachen","DE",50.775,6.084],
 ["Frankfurt","DE",50.110,8.682],["Munique","DE",48.137,11.576],
 ["Heidelberg","DE",49.399,8.672],
 ["Innsbruck","AT",47.269,11.405],["Salzburg","AT",47.801,13.045],
 ["Viena","AT",48.208,16.374],["Bregenz","AT",47.503,9.746],
 ["Barcelona","ES",41.387,2.170],["Madri","ES",40.417,-3.703],
 ["Girona","ES",41.983,2.825],["Sevilha","ES",37.389,-5.984],
 ["Porto","PT",41.150,-8.611],["Lisboa","PT",38.722,-9.139],
 ["Luxemburgo","LU",49.612,6.131],["Praga","CZ",50.075,14.438],
 ["Dublin","IE",53.350,-6.260],["Galway","IE",53.270,-9.056],
 ["Copenhague","DK",55.676,12.568],["Cracóvia","PL",50.061,19.938],
 ["Varsóvia","PL",52.230,21.012],["Budapeste","HU",47.498,19.040],
 ["Liubliana","SI",46.056,14.506],["Zagreb","HR",45.815,15.982],
 ["Estocolmo","SE",59.329,18.069],["Oslo","NO",59.913,10.752],
 ["Atenas","GR",37.984,23.728],
];
export const CITIES:GeoPlace[]=raw.map(([name,countryCode,latitude,longitude])=>({
 name,countryCode,country:countryName(countryCode),latitude,longitude,source:"curated"
}));
const aliases:Record<string,string> = {
 "milan":"milao","milano":"milao","venice":"veneza","venezia":"veneza",
 "rome":"roma","torino":"turim","florence":"florenca","luzern":"lucerna",
 "zurich":"zurique","zuerich":"zurique","basel":"basileia",
 "bern":"berna","geneva":"genebra","geneve":"genebra",
 "brussels":"bruxelas","brussel":"bruxelas","brugge":"bruges",
 "gent":"ghent","antwerp":"antuerpia","antwerpen":"antuerpia",
 "rotterdam":"roterda","the hague":"haia","den haag":"haia",
 "london":"londres","edinburgh":"edimburgo","munich":"munique",
 "muenchen":"munique","cologne":"colonia","vienna":"viena",
 "prague":"praga","lisbon":"lisboa","warsaw":"varsovia",
 "krakow":"cracovia","copenhagen":"copenhague"
};
const normalizeAlias = (name:string):string => {
 const norm=normalizeLocation(name);
 return aliases[norm]||norm;
};
export function localCityByName(city:string,country?:string|null):GeoPlace|null{
 const pieces=city.split("/").map(x=>x.trim()).filter(Boolean);
 const cc=countryCodeFromName(country);
 for(const part of pieces){
   const match=CITIES.find(p=>normalizeAlias(p.name)===normalizeAlias(part)&&(!cc||p.countryCode===cc));
   if(match)return match;
 }
 if(normalizeLocation(city).includes("alpes")&&(!cc||cc==="CH"))
   return CITIES.find(p=>p.name==="St. Moritz")||null;
 return null;
}
export function kmBetween(a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}){
 const r=Math.PI/180,dLat=(b.latitude-a.latitude)*r,dLon=(b.longitude-a.longitude)*r;
 const h=Math.sin(dLat/2)**2+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(dLon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function evaluateFit(place:GeoPlace,stops:RouteStop[]):RouteFit{
 const anchors=stops.map(stop=>({label:stop.city,geo:localCityByName(stop.city,stop.country)}))
   .filter((x):x is {label:string;geo:GeoPlace}=>x.geo!==null);
 if(!anchors.length)return{level:"unknown",title:"Roteiro ainda sem referência",detail:"Adicione cidades confirmadas ao planejamento para avaliar se este desejo fica no caminho."};
 const order=anchors.map(x=>({...x,km:kmBetween(place,x.geo)})).sort((a,b)=>a.km-b.km);
 const closest=order[0];const km=Math.round(closest.km);
 const nearLiverpool=normalizeLocation(closest.label).includes("liverpool");
 const caveat=nearLiverpool?" É próximo da base do curso, mas os dias úteis estarão ocupados com aulas.":"";
 let level:FitLevel,title:string,detail:string;
 if(km<=80){level="easy";title="Faz sentido investigar";detail="Fica perto de uma parada já cogitada.";}
 else if(km<=200){level="possible";title="Pode encaixar no roteiro";detail="A proximidade é promissora, mas depende das conexões e de uma janela livre.";}
 else if(km<=420){level="detour";title="Possível desvio";detail="Pode exigir trocar uma cidade, antecipar um trecho ou reservar tempo extra.";}
 else{level="difficult";title="Pouco prático para a semana de passeio";detail="É distante das paradas atuais; faria mais sentido como troca de destino ou nova etapa.";}
 return{level,title,detail:`${detail} Referência: ${km} km em linha reta de ${closest.label}.${caveat} Não é quilometragem ferroviária nem previsão de tempo de viagem.`,nearest:closest.label,distanceKm:km};
}
export function rankedCityIdeas(countryCode:string,stops:RouteStop[],limit=8):GeoPlace[]{
 return CITIES.filter(p=>p.countryCode===countryCode)
  .map(p=>({p,score:evaluateFit(p,stops).distanceKm??Infinity}))
  .sort((a,b)=>a.score-b.score).slice(0,limit).map(x=>x.p);
}
