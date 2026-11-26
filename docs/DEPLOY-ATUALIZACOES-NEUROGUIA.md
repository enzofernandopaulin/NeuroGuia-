# Implantação das atualizações do NeuroGuia

Branch: `atualizações-neuroguia`. Estas mudanças ainda não autorizam executar SQL nem publicar em produção.

## Ordem de implantação

1. Fazer backup do banco Supabase `tsqjfldwlliaohpifuzl` e conferir que as migrações anteriores (`20260921_neuroguia_methodology`, `20260922_complete_mvp`, `20261001_add_arasaac_pictograms`) já estão presentes no **esquema real**. O histórico de migrações no painel estava vazio; não reaplicar arquivos antigos em lote.
2. Executar somente [`20261126_daily_task_completions.sql`](../supabase/migrations/20261126_daily_task_completions.sql) pelo SQL Editor do projeto ou ferramenta de migração, numa transação. A tabela é aditiva; o `completed` legado é migrado apenas na data original, pois o banco anterior não guardava datas das conclusões.
3. Verificar no SQL Editor: `select count(*) from public.routine_task_completions;` e `select policyname from pg_policies where schemaname='public' and tablename='routine_task_completions';`. Conferir políticas para responsável, tutor e estudante com contas reais de teste.
4. Criar implantação de prévia da branch no Vercel com as variáveis de ambiente já usadas pelo projeto (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Testar cadastro/login, onboarding completo, seleção e troca de pictograma, criação/edição/exclusão de tarefa, recorrência em dias diferentes, conclusão independente por dia, acesso estudante, tutor e convites.
5. Após validação e autorização, integrar a branch à main e publicar a versão de produção no Vercel. Conferir o domínio e os logs de implantação.

## Pictogramas múltiplos (26/11/2026)

Antes de publicar a atualização da branch, aplicar `supabase/migrations/20261126_multiple_task_pictograms.sql` no mesmo projeto. A migração adiciona `routine_tasks.pictograms` (lista ordenada de até oito), copia o pictograma atual de cada tarefa e mantém os campos `pictogram_*` antigos para o primeiro item. Verificar `select count(*) from public.routine_tasks where pictogram_id is not null and jsonb_array_length(pictograms) = 0;` (esperado: zero) e testar a seleção, reordenação e remoção na prévia. A cópia interna anterior das tarefas permanece em `neuroguia_backup_20261126.routine_tasks`.

## Recuperação

Se a interface falhar, reverter a implantação Vercel para a anterior. A nova tabela pode permanecer sem afetar a versão anterior. Não apagar a tabela ou a cópia das conclusões; usar backup para recuperação se necessário. Clientes antigos continuam a usar `routine_tasks.completed` e podem mostrar estado diferente durante uma implantação mista, portanto concluir a troca de versão sem demora.

## Limites da validação

TypeScript, build e testes locais não substituem um teste integrado com as três contas em produção. A migração SQL não foi executada no Supabase e nenhuma publicação Vercel foi feita nesta branch. O diagnóstico anterior de avisos do Security Advisor requer avaliação separada, pois estas alterações não cobrem todos os 37 avisos.
