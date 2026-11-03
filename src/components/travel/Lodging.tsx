const places=[
  {region:"Milão",name:"Milano Centrale / Repubblica",nights:"2 noites",pros:"Facilita chegada, saída cedo para Tirano e reduz táxi",cons:"Não é a área mais charmosa da cidade",perfil:"Melhor logística para roteiro curto"},
  {region:"Alpes",name:"Pontresina ou Samedan",nights:"1 noite",pros:"Normalmente melhor custo que St. Moritz e excelente acesso ferroviário",cons:"Menos glamour que dormir no centro de St. Moritz",perfil:"Melhor custo-benefício do trecho suíço"},
  {region:"Strasbourg",name:"Gare Centrale / Petite France",nights:"1 noite",pros:"Chega de trem, deixa mala e faz o centro a pé",cons:"Uma noite só exige localização eficiente",perfil:"Cidade-bônus sem complicar a rota"},
  {region:"Bruxelas",name:"Sem hospedagem no roteiro-base",nights:"Parada longa",pros:"Economiza uma diária e uma troca de hotel",cons:"Passeio precisa ficar concentrado no centro",perfil:"Grand-Place + centro histórico antes de seguir"},
  {region:"Amsterdam",name:"Centraal ou Sloterdijk",nights:"2 noites",pros:"Centraal economiza tempo; Sloterdijk pode reduzir bastante a diária",cons:"Centro costuma ser caro",perfil:"Escolher Sloterdijk se a diferença justificar o deslocamento curto"},
  {region:"Londres",name:"King's Cross / St Pancras / Euston",nights:"2 noites",pros:"Chegada do Eurostar e trem para Liverpool ficam muito próximos",cons:"Diária alta",perfil:"Pagar pela logística pode economizar transporte e estresse"},
  {region:"Liverpool",name:"Commercial District / Moorfields",nights:"4 semanas",pros:"Kaplan fica em Old Hall Street; muita coisa é feita a pé",cons:"Comparar aluguel mensal com residência/Airbnb",perfil:"Priorizar cozinha, lavanderia e até 15–20 min da escola"},
];

export const Lodging=()=> (
  <section id="hospedagem" className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-6xl">
    <div className="mb-10 max-w-3xl">
      <p className="text-xs tracking-[0.3em] uppercase text-olive mb-3">Hospedagem</p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">Dormir onde economiza tempo também é economizar dinheiro</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">Para 2028, a regra será reservar com cancelamento grátis quando os calendários abrirem, acompanhar o preço e repricificar. Não vamos escolher hotel só pela menor diária ignorando trem, táxi e tempo perdido.</p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {places.map(p=><div key={`${p.region}-${p.name}`} className="rounded-3xl bg-card border border-border/60 p-5 sm:p-6 shadow-card flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-2"><p className="text-xs tracking-[0.2em] uppercase text-gold">{p.region}</p><span className="text-[10px] rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{p.nights}</span></div>
        <h3 className="font-display text-2xl text-ink mb-5">{p.name}</h3>
        <dl className="space-y-3 text-sm flex-1">
          <div><dt className="text-xs uppercase tracking-wider text-success/80 mb-1">Por que faz sentido</dt><dd className="text-foreground/80 leading-relaxed">{p.pros}</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-destructive/80 mb-1">Atenção</dt><dd className="text-foreground/80 leading-relaxed">{p.cons}</dd></div>
          <div className="pt-3 border-t border-border/60"><dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Decisão</dt><dd className="text-ink italic leading-relaxed">{p.perfil}</dd></div>
        </dl>
      </div>)}
    </div>

    <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4 sm:p-5 text-sm text-foreground/75 leading-relaxed">
      <strong className="text-ink">Liverpool merece outra lógica:</strong> quatro semanas mudam tudo. Cozinha, lavanderia, segurança, distância da Kaplan e mercado perto pesam mais que “hotel bonito”. É onde vamos comparar residência Kaplan, Airbnb/apartamento e hospedagem independente pelo custo total mensal.
    </div>
  </section>
);