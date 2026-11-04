# Europa 2028 · Diário de bordo das amigas

> Documento-base do projeto. **Nunca substituir requisitos antigos por uma interface mais simples sem registrar a alteração.**
> Inventário reconstruído em 03/11/2026 a partir dos pedidos do projeto; cada nova implementação deve preservar as regras abaixo.

## 1. Por que este projeto existe

Planejar **juntas**, em um único site responsivo, a viagem de Vanessa, Camila e Danielle: quatro semanas de intercâmbio em Liverpool e aproximadamente uma semana percorrendo cidades europeias. Não é um roteiro estático nem um portal só de decoração. Deve ser um aplicativo leve, elegante, prático, que as três realmente consigam usar no celular.

**Decisões atuais (2028):**
- Março/abril de 2028; ordem **Europa → Liverpool** é tendência, mas **Liverpool → Europa permanece alternativa**. Não marcar uma opção como definitiva antes da decisão das três.
- Até ~5 semanas viajando, 4 semanas de curso, ~1 semana de passeio, podendo embarcar sexta à noite.
- Considerar **30 dias corridos de férias CLT**, não presumir aprovação de fracionamento, considerar banco de horas somente se necessário e autorizado, incluir feriados no cálculo.
- As turmas começam semanalmente às segundas-feiras, sujeitas à validação de calendário oficial da escola.
- Vanessa deve estar em São Paulo em 13/05/2028; reservar margem para volta antes disso.
- Ideias de rota: Milão, Tirano/Bernina, cidades suíças, Strasbourg, Bruxelas, Amsterdam, Londres e Liverpool. Não presumir viagens entre todas sem avaliar tempo e preço. Bernina é uma experiência prioritária.
- Manter cenário com entrada e saída por aeroportos diferentes (multidestino/open-jaw) para testar custo total e evitar deslocamento de volta.

## 2. Pedidos originais recuperados

**Abril 2026:**
- Dashboard, roteiro editável e mapas/GPS; comparação de transportes e logística dos trechos críticos; hospedagens, bilhetes, clima, notícias, horários Brasil/Europa, contadores.
- Tela de **Ofertas e Cupons** com radar/buscador de voos, comparador de destinos de entrada, faixas de preço, histórico, cupons, links externos, estratégias de compra e futuras APIs.
- Login individual para três amigas; área pessoal com cofrinho, metas e gastos; **rateio no estilo Splitwise** para gastos que pertencem ao grupo.
- Checklist por preparação e prazos, alertas de câmbio (EUR/GBP/CHF), passagem, hospedagem; lembretes semanais e diários quando se aproximar a viagem, com WhatsApp desejado.
- Acompanhar gastos de estudo, passeios, jiu-jitsu, Beatles e oportunidades da cidade.
- Valor-alvo histórico de passagens para o **roteiro de 2027**: teto de referência R$ 4.500 e alerta R$ 3.800 por pessoa. **Não reutilizar como preço/alerta vigente para 2028 sem nova aprovação.**

**Junho 2026 (regra crucial):**
- **Todo gasto nasce individual; só entra no coletivo quando explicitamente marcado para compartilhar.**
- O que é pessoal fica vinculado ao próprio usuário. O Rateio é apenas para despesas coletivas. Não somar gastos individuais nos saldos das amigas.

**Setembro 2026:**
- Controle financeiro com cronograma da agência, comprovantes de pagamentos reais, simulação de antecipações, saldo restante e planejamento de compras de libras e euros. Não inventar pagamento nem confundir previsão com pago.

**Novembro 2026:**
- Atualizar o ano para **2028** e trocar o domínio visível.
- Preservar as duas ordens de viagem/curso.
- Acesso mobile, sem chave compartilhada, vinculação de Vanessa como organizadora; Camila e Danielle aprovadas pelo login individual. **Não cadastrar automaticamente e-mails guardados apenas como histórico.**
- Home com o **trem como marca d'água delicada**. Recuperar a imagem antiga exata se arquivo íntegro estiver disponível; desenho em SVG é provisório.
- Visual premium com identidade pessoal da viagem, menos formulários, navegação leve e ações reais.
- Rateio tipo Splitwise com divisões iguais/desiguais, acertos, moedas, histórico, filtros e saldos.

## 3. Contrato funcional e técnico

1. Todos os cadastros em uma conta devem ser persistentes no banco, de forma coerente ao abrir em outro aparelho; não usar `localStorage` como base de dados para informação de grupo.
2. Dados pessoais e compartilhados têm permissões distintas: **somente o dono vê gastos e metas privados**; integrantes aprovadas podem ver o coletivo.
3. Cadastro de despesa pessoal **não cria** registro no rateio; apenas a ação explícita e confirmada cria. Não permitir duplicatas em tentativas repetidas.
4. Valores por moeda separados; não somar BRL, EUR, GBP e CHF como se fossem intercambiáveis; conversão exige taxa, fonte e data.
5. Saldos de Rateio levam em conta o pagador, as parcelas por pessoa e os acertos realizados; registro de acerto não movimenta dinheiro.
6. Gravação de despesas + parcelas é transacional; erros devem aparecer ao usuário sem salvar pela metade.
7. Cenário não é reserva, preço de referência não é oferta real, configuração de alerta não é alerta automático rodando.
8. Nenhuma API paga/segredo deve ser colocado no frontend; integrações com Splitwise só após OAuth/autorização e backend seguro.
9. Não há obrigação de usar Opera, APIs pagas ou contas adicionais. Uma eventual integração externa deve trazer ganho real e permitir exportação dos dados do portal.
10. Nunca anunciar login/testes end-to-end como concluídos somente porque Vercel publicou `READY`; validar ações no celular e banco.

## 4. Status em 03/11/2026

| Módulo | Estado observado | Próxima validação |
|---|---|---|
| Login individual/organizadora | Registro e sessão em conta QA demonstrados; redirecionamento Google validado até a página do Google; aprovação manual corrigida para configuração de e-mail não verificado | Testar sessão real de Vanessa e aprovações de Camila/Danielle em celulares |
| Página inicial e trem | Fotografia licenciada do Bernina Express com SVG alternativo | Imagem antiga exata não recuperada, revisar legibilidade no celular |
| Calendário/férias | Dois cenários e comparações | Revisar feriados e calendário Kaplan com fontes oficiais |
| Roteiro/hospedagens | Editáveis com banco, destinos com Google Maps/direções | Inserção real via conta QA validada; falta teste simultâneo das três contas |
| Cofrinho/metas | Banco | Testar privacidade e totais |
| Gastos pessoais | Novo módulo `personal_expenses` | Testar CRUD privado e divisão sob confirmação |
| Rateio | Despesas, divisões iguais/valor/%, acertos e exportação CSV | Cadastro e recarga persistente de despesa com divisão GBP £9/3 validado por conta descartável; falta sessão real das três |
| Passagens/radar | Histórico compartilhado `flight_price_history` | Testar entrada e links; busca automática ainda não existe |
| Cupons | Lista compartilhada `travel_coupons` | Verificar validade e confiabilidade de cada cupom |
| Câmbio/alertas | Preferências cadastradas | Implementar notificações reais verificadas |
| Clima/notícias/fusos | Conteúdo de apoio | Validar dados atuais e evitar conteúdo estático incorreto |
| Checklist | Banco | Testar marcações e separação por usuária |
| Agência/comprovantes | Implementado, validar em conta real | 19 valores conhecidos das 20 parcelas (R$ 7.930,78) e 4 pagamentos confirmados (R$ 3.104); suporta pagamentos novos, correções e comprovantes por link |
| Chat compartilhado/WhatsApp | Links do grupo implementados, chat externo não integrado | Em Grupo > Links da nossa viagem, as três podem salvar link do chat e documentos. Não confundir link compartilhado com chat sincronizado |

## 5. Referências de mercado verificadas

- [Wanderlog](https://wanderlog.com/): roteiro colaborativo, mapa, reservas e checklist.
- [Splitwise](https://dev.splitwise.com/): API oficial para grupos, despesas, saldos e acertos. Possibilidade futura de OAuth, sujeita às condições de uso e credenciais; **não conectada**.
- [Tricount](https://www.tricount.com/features): divisões multimoeda, recibos, modo offline, importação de Splitwise; alternativa externa.
- [TravelSpend](https://travel-spend.com/): orçamento, categorias, países, conversão e trabalho offline.
- [TripIt](https://www.tripit.com/): consolidação de reservas/documentos.
- [Google Flights](https://www.google.com/travel/flights/saves): rastreamento gratuito de voos e alertas reais via Google (externo).
- [Wise](https://wise.com/us/tools/exchange-rate-alerts): alertas de câmbio (externo).

**Decisão recomendada:** manter este portal como fonte única do planejamento, aprender com as melhores experiências de mercado e integrar somente serviços que efetivamente melhorarem o trabalho das três.

## 6. Critérios de entrega

Para cada mudança:
- Verificar se algum pedido antigo foi descartado ou contradito.
- Construir interface, persistência e permissões com estados vazios/erro.
- Testar caminho crítico: entrar → cadastrar → ver em outra conta → editar → atualizar → confirmar persistência.
- Conferir build, URL `https://europa-2028.vercel.app/`, rotas profundas e celular.
- Atualizar este documento e a página **Nossa essência** (`/projeto`).
- **Não inventar** cotações, tarifas, horários, pagamentos, API conectada ou notificações já enviadas.

### Controle financeiro da agência — importação original de setembro de 2026

- Parcelas conhecidas: 1/20 R$ 1.000,00; 2/20 R$ 452,00; 3/20 R$ 452,00; 15 parcelas de 4/20 a 18/20 de R$ 290,04; 20/20 R$ 1.676,18. Total conhecido: **R$ 7.930,78**. **19/20 permanece sem valor informado**, portanto não tratar como contrato total.
- Pagamentos reais confirmados: 30/01/2026 R$ 1.000,00; 27/02 R$ 452,00; 02/04 R$ 452,00; 30/06 R$ 1.200,00. **Total pago comprovado: R$ 3.104,00.** Os pagamentos não são distribuídos arbitrariamente pelas parcelas.
- Intenção de pagar R$ 1.500 em setembro de 2026 não equivale a pagamento confirmado. Não importar como quitado até haver comprovante ou confirmação.
- Datas oficiais de vencimento não confirmadas, por isso foram preservadas vazias no banco e são editáveis. Links dos comprovantes ainda podem ser anexados aos registros.
- Controle individual fica em **Minha viagem > Agência**; RLS protege as informações particulares.

## 7. Arquitetura

- GitHub: `scostavanessa-jpg/europa-2027` (nome legado; produto Europa 2028).
- Vite + React + TypeScript + Tailwind + React Router, deploy Vercel.
- Neon Auth + Neon Data API + Postgres com RLS, tabelas `participants`, `profiles`, `user_roles`, `personal_expenses`, `expenses`, `expense_shares`, `settlements`, `savings_goals`, `savings_entries`, `flight_price_history`, `travel_coupons`, `accommodations`, `route_items`, `alerts` e `checklist_items`.
- As três viajantes têm acesso individual; Vanessa é organizadora. Autorização sensível é conferida no banco, não só por botão no frontend.

## 8. Testes de regressão executados em 03/11/2026

- Criada conta de teste descartável, sem usar credenciais reais. Cadastro aceito e sessão observada no Neon. Após recarga de página, sessão reconhecida pela aplicação.
- Rateio criado por formulário real: £9,00, £3,00 por pessoa, saldos corretos e registro persistido após recarga. Despesa QA removida depois do teste.
- Inclusão de cidade no planejamento por formulário real: operação confirmada. Cidade QA removida depois do teste.
- Botão Google devolveu inicialmente sucesso sem redirecionar; fluxo restaurado para client Neon nativo e confirmado até a tela de seleção de conta Google (não testado com credenciais de usuária real).
- Criada rotina de aprovação manual da organizadora porque a configuração do Neon não exige verificação de e-mail; aprovação requer redigitação exata do e-mail que a viajante informou à organizadora.
- Conta QA, vínculos, papel, cidade e despesa de teste foram removidos; confirmada ausência de restos no banco.
- A fotografia usada como marca d'água é **substituta licenciada** (Christian Lue/Unsplash, Bernina Express); não alegar que é o original antigo.
