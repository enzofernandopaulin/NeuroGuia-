# Supabase - etapa 2: Perfil TEA

Esta etapa cria a estrutura persistente do **perfil TEA** sem alterar ainda o fluxo de login.

## Arquivos

- `supabase/migrations/20260905_create_tea_profiles.sql`: tabela, validações, índice e RLS.
- `src/lib/database.types.ts`: tipos usados pelo frontend.
- `src/services/teaProfileService.ts`: funções de leitura, criação, atualização e exclusão.

## Tabela `tea_profiles`

Cada perfil guarda:

- nome/apelido;
- faixa etária;
- nível de suporte informado;
- preferência de comunicação;
- nível de autonomia;
- sensibilidades selecionadas;
- dificuldade com mudanças de rotina;
- configuração visual suave;
- passo a passo;
- botão "Me perdi";
- aviso de mudança de rotina.

## Segurança

A tabela já nasce com **Row Level Security (RLS)** habilitado.

Cada registro possui `responsible_id`, apontando para `auth.users.id`. As políticas permitem que somente o usuário autenticado cujo ID seja igual a `responsible_id` leia ou altere aquele perfil.

Por isso, **não vamos liberar acesso anônimo temporariamente** apenas para fazer o banco funcionar antes do login. Isso evitaria expor dados do perfil.

## Como aplicar quando o projeto Supabase estiver disponível

Abra o SQL Editor do projeto Supabase e execute o conteúdo da migration:

`supabase/migrations/20260905_create_tea_profiles.sql`

Depois configure no Vercel:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Neste momento a tabela estará pronta, mas o app ainda continuará usando o estado React até concluirmos a etapa de autenticação. Assim que o login for ligado, o onboarding poderá salvar diretamente nesta tabela.
