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

### Lançamentos do cofrinho
Cada lançamento deve ter:
- participante
- data
- valor
- observação
- botão editar
- botão excluir
- confirmação antes de excluir

### Dashboard
Mostrar:
- total geral do grupo
- total guardado pelo grupo
- total pendente do grupo
- card individual para Vanessa
- card individual para Camila
- card individual para Danielle

Cada card individual deve mostrar meta, guardado, pendente e progresso.

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

### Banco de dados
Usar Supabase corretamente com estas tabelas:

participants: id, name, email, whatsapp, color, active
savings_goals: id, participant_id, target_total_brl, monthly_target_brl, scenario
savings_entries: id, participant_id, entry_date, amount_brl, notes
expenses: id, description, expense_date, total_amount, currency, paid_by, split_type, status, category, notes
expense_shares: id, expense_id, participant_id, share_amount, paid_back
checklist_items: id, title, category, due_date, assigned_to, completed, notes
alerts: id, title, alert_type, target_date, frequency, channel, message, status
currency_targets: id, currency, usage_notes, planning_rate_brl, buy_some_below_brl, buy_strong_below_brl, status

### Login
Manter somente e-mail e senha. Não incluir Google. Não incluir Apple.

### Mobile
Garantir funcionamento em Android e iPhone.

### Visual
Não remover o visual bonito. Ajustar a lógica sem destruir a interface.

Prioridade: funcionalidade estável, cofrinho individual, edição/exclusão, dashboard individual e consolidado.
