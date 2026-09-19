# Fase 2 — acesso do estudante: entrega para o Enzo

O código desta fase está no GitHub. **Enzo**, que já administra o projeto Supabase e a publicação no Vercel, é a pessoa que executa as configurações externas. Não é necessário convidar Ruan ao Vercel ou ao Supabase, compartilhar credenciais ou contratar um assento para ele.

## Ordem de aplicação por Enzo

1. Revise esta branch e confira que as variáveis públicas já usadas pelo site (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) apontam para o projeto Supabase correto. Não inclua a chave `service_role` no frontend ou no GitHub.
2. No SQL Editor do projeto, execute `supabase/migrations/20260920_student_access.sql` **após** `20260919_rebuild_core.sql`. Confirme a criação de `student_credentials`, `student_sessions` e das funções RPC.
3. Em Supabase Auth, ative **Anonymous Sign-Ins**. Trata-se de uma identidade técnica temporária para a sessão do estudante; o estudante continua vinculado ao perfil criado pelo responsável, sem precisar de e-mail próprio.
4. Publique a branch pelo projeto Vercel sob a conta que Enzo já utiliza. O GitHub pode registrar `Deployment was blocked` para um commit criado por um autor que não integra a equipe do projeto Vercel. Nesse caso, Enzo pode publicar a revisão pelo próprio acesso ou criar um commit próprio com o conteúdo revisado, sem precisar adicionar Ruan como membro pago.

## Verificação após a configuração

- Um responsável entra, cadastra um estudante e define um PIN numérico de seis dígitos no painel. O código de acesso aparece para ele.
- Após sair, o estudante consegue entrar com código e PIN; os dados de outro perfil não aparecem.
- PIN incorreto não libera acesso; após cinco tentativas incorretas consecutivas, o código fica bloqueado por 15 minutos.
- Redefinir o PIN invalida as sessões anteriores; o estudante pode sair da própria área.

`npm run build` e a análise de sintaxe SQL não substituem essa verificação integrada. O commit GitHub não executa migrações, não altera Auth e não publica o site.
