# Integração ARASAAC — protótipo

Esta integração permite pesquisar pictogramas públicos do ARASAAC e associá-los às tarefas da rotina do NeuroGuia.

## Escopo

- Pesquisa em português, com espera de 450 ms para evitar requisições a cada tecla.
- Até 24 resultados por pesquisa.
- Pictograma opcional: falhas do ARASAAC não impedem a criação da tarefa.
- Persistência somente do provedor, identificador e rótulo. A imagem não é copiada para o Supabase.
- Exibição na área do responsável e na rotina do estudante.
- Sem chave de API e sem variável nova na Vercel.

## Implantação pelo Enzo

1. Confirmar que o deploy atual está baseado na mesma branch e migration anteriores.
2. Abrir o SQL Editor do projeto Supabase correto.
3. Executar `supabase/migrations/20261001_add_arasaac_pictograms.sql`.
4. Confirmar as colunas `pictogram_provider`, `pictogram_id` e `pictogram_label` em `public.routine_tasks`.
5. Somente depois, publicar o commit do frontend na Vercel.
6. Criar uma tarefa com pictograma, atualizar a página e entrar na visualização do estudante.
7. Confirmar que uma tarefa sem pictograma também continua funcionando.

Não é necessário configurar variável de ambiente para o ARASAAC.

## Reversão

Se for necessário remover a funcionalidade, primeiro reverta o frontend e depois execute manualmente:

`supabase/rollback/20261001_remove_arasaac_pictograms.sql`

O rollback elimina as seleções de pictogramas gravadas nas tarefas.

## Privacidade

A pesquisa envia ao ARASAAC apenas o termo digitado. Não devem ser utilizados nomes, diagnósticos, e-mails ou outras informações pessoais como termos de busca.

## Licença

Uso planejado somente para prototipação e testes. Os créditos são exibidos na interface:

> Pictogramas: Sergio Palao — ARASAAC (Governo de Aragão), licença CC BY-NC-SA.

Antes de qualquer comercialização, a equipe deve revisar os termos atuais do ARASAAC e obter autorização quando necessária.
