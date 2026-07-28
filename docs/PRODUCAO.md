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

## Persistência atual

A autenticação usa Supabase. Durante a migração para fora do Lovable, checklist, cofrinho, prioridades e preferências estão persistidos por usuário no navegador. O Rateio está persistido como dado do grupo no navegador.

Isso deixa as funções utilizáveis em produção, mas ainda não oferece sincronização multi-dispositivo/multiusuário para os dados funcionais.

## Backend definitivo já documentado

O backend definitivo deve usar as tabelas e RLS do `supabase/schema_fase2.sql`, mantendo:

- dados pessoais de cofrinho/checklist privados por participante;
- dados compartilhados de roteiro, rateio, alertas gerais e moedas visíveis às três usuárias autenticadas;
- Vanessa como organizadora/admin;
- nenhuma chave secreta no frontend.

## Bloqueio atual de infraestrutura

O projeto Supabase dedicado `Europa-2027` existe, mas está inativo. A tentativa de restaurá-lo foi recusada pelo limite de dois projetos gratuitos ativos da conta. Os dois projetos ativos existentes não devem ser pausados automaticamente porque pertencem a outros produtos.

Quando houver um slot livre ou plano que permita o terceiro projeto ativo, aplicar `supabase/schema_fase2.sql`, migrar a persistência do navegador para o banco e ativar RLS antes de considerar a sincronização em nuvem concluída.
