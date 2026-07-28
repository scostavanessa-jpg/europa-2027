# Europa até Liverpool 2027 — status de produção

## Ativo em produção

- Rotas privadas protegidas por autenticação.
- Login por e-mail e senha, cadastro e recuperação de senha.
- Checklist pessoal com marcar/desmarcar e progresso.
- Cofrinho individual: meta total, meta mensal, guardado, pendente, percentual e histórico.
- Lançamentos do cofrinho: adicionar, editar, excluir com confirmação e cancelar edição.
- Prioridades pessoais: Imperdível, Desejável e Opcional, com cidade e observação.
- Preferências individuais de alerta.
- Rateio: despesa, pagador, participantes, moeda, divisão igual e cálculo de quem deve a quem.
- Cards de Combinados do Grupo ligados às áreas funcionais.
- Ofertas, roteiro, mapa, hospedagem e demais áreas preservadas no visual editorial premium.

## Backend oficial

O backend oficial passa a ser **Neon PostgreSQL + Neon Auth + Neon Data API**, mantendo Vercel como hospedagem e GitHub como fonte do código.

A aplicação já contém o cliente Neon e troca automaticamente para Neon quando estas variáveis existirem no deploy:

- `VITE_NEON_AUTH_URL`
- `VITE_NEON_DATA_API_URL`

Enquanto a infraestrutura Neon ainda não estiver conectada à Vercel, o Supabase anterior permanece apenas como fallback temporário para evitar indisponibilidade do login.

## Schema e segurança

O schema de produção está em `neon/schema.sql` e inclui:

- perfis e papéis;
- Vanessa como organizadora após o primeiro login;
- vínculo de Vanessa, Camila e Danielle aos participantes;
- cofrinho individual;
- prioridades pessoais;
- preferências de alerta;
- checklist individual;
- Rateio compartilhado;
- roteiro, hospedagens e alertas;
- histórico de preços de voos;
- Row Level Security usando `auth.user_id()` do Neon Data API.

Dados pessoais ficam privados por usuária. Dados do grupo ficam colaborativos somente para usuárias autenticadas.

## Persistência durante a transição

Checklist, cofrinho, prioridades, preferências e Rateio ainda preservam a persistência local atual até a conexão Neon ser concluída. Isso impede perda de funcionalidade durante a troca de provedor.

Após ativar Neon Auth + Data API e aplicar `neon/schema.sql`, a próxima etapa é mover esses módulos para as tabelas Neon e então remover completamente `@supabase/supabase-js` e o fallback antigo.

## Pendência externa

A criação/conexão do recurso Neon precisa ser autorizada na conta Vercel/Neon da proprietária. Nenhuma chave secreta deve ser colocada no repositório ou no frontend.
