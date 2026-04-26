# Prompt para Lovable — Ajuste funcional

O visual ficou bonito, mas agora preciso priorizar funcionalidade real. Corrija o app para funcionar de ponta a ponta com Supabase.

## Regras principais

### Cofrinho individual
O cofrinho precisa ser individual, não uma conta única do grupo.

Participantes:
- Vanessa
- Camila
- Danielle

Cada participante precisa ter:
- meta total individual
- meta mensal individual
- total guardado individual
- valor pendente individual
- histórico individual de lançamentos
- progresso em porcentagem

### Telas completas de cofrinho individual
Adicionar telas completas de cofrinho individual para Vanessa, Camila e Danielle com meta total, meta mensal, guardado, pendente, progresso em porcentagem e histórico de lançamentos.

### Dashboard
Atualizar o dashboard para mostrar totais do grupo e cards individuais de Vanessa, Camila e Danielle com metas, guardado, pendente e progresso em porcentagem.

Mostrar no dashboard:
- total geral do grupo
- total guardado pelo grupo
- total pendente do grupo
- card individual para Vanessa
- card individual para Camila
- card individual para Danielle

Cada card individual deve mostrar:
- meta da pessoa
- guardado
- pendente
- progresso em porcentagem

### Cálculo do valor pendente
Calcular e exibir corretamente o valor pendente individual no cofrinho usando:

valor pendente individual = meta total individual - total guardado individual

Permitir atualização em tempo real após adicionar, editar ou excluir lançamentos.

### Lançamentos do cofrinho
Cada lançamento deve ter:
- participante
- data
- valor
- observação
- botão editar
- botão excluir
- confirmação antes de excluir

Implementar botões editar e excluir nos lançamentos do cofrinho com confirmação antes de excluir.

O botão cancelar precisa funcionar sem perder alterações já salvas.

### Racha da viagem
Manter como despesa compartilhada, mas não confundir com cofrinho.

Cofrinho = dinheiro que cada uma está guardando.
Racha = despesas pagas por alguém e divididas entre as participantes.

### Funcionalidade
Todos os botões precisam funcionar:
- adicionar
- salvar
- editar
- excluir
- cancelar
- marcar checklist como concluído
- desmarcar checklist

### Login e privacidade dos dados
Implementar login por e-mail e senha.

Cada usuária deve visualizar seus próprios dados individuais do cofrinho, lançamentos e checklist pessoal.

Dados compartilhados do grupo, como participantes, roteiro, moedas, alertas gerais e despesas compartilhadas, podem aparecer para todas as usuárias autenticadas.

Não incluir Google.
Não incluir Apple.

### Banco de dados
Usar Supabase corretamente com estas tabelas:

participants: id, name, email, whatsapp, color, active, user_id
savings_goals: id, participant_id, target_total_brl, monthly_target_brl, scenario
savings_entries: id, participant_id, entry_date, amount_brl, notes
expenses: id, description, expense_date, total_amount, currency, paid_by, split_type, status, category, notes
expense_shares: id, expense_id, participant_id, share_amount, paid_back
checklist_items: id, title, category, due_date, assigned_to, completed, notes
alerts: id, title, alert_type, target_date, frequency, channel, message, status
currency_targets: id, currency, usage_notes, planning_rate_brl, buy_some_below_brl, buy_strong_below_brl, status

### Login
Manter somente e-mail e senha.

Mensagem na tela de criação de senha:
Use uma senha com pelo menos 6 caracteres. Se o cadastro pedir confirmação, abra o e-mail recebido antes de tentar entrar.

### Mobile
Garantir funcionamento em Android e iPhone.

No iPhone, orientar abrir pelo Safari e evitar navegador interno do WhatsApp/Instagram.

### Visual
Não remover o visual bonito. Ajustar a lógica sem destruir a interface.

Prioridade:
- funcionalidade estável
- cofrinho individual
- dashboard individual e consolidado
- edição e exclusão
- login por e-mail e senha
