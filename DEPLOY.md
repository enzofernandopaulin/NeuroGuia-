# Deploy do NeuroGuia

## 1. Vercel

O projeto já está preparado como uma aplicação Vite.

Configuração esperada no Vercel:

- Framework Preset: **Vite**
- Build Command: **npm run build**
- Output Directory: **dist**
- Install Command: **npm install**

O arquivo `vercel.json` já contém a configuração de build e um fallback para `index.html`, permitindo que futuras rotas do frontend funcionem ao atualizar a página.

## 2. Variáveis de ambiente

O frontend usa somente variáveis iniciadas com `VITE_`.

No desenvolvimento, crie um arquivo `.env.local` com base em `.env.example`.

No Vercel, adicione:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_OU_PUBLISHABLE
VITE_APP_URL=https://SEU-PROJETO.vercel.app
```

Depois de alterar variáveis no Vercel, faça um novo deploy.

## 3. Supabase

O cliente está preparado em:

`src/lib/supabase.ts`

Enquanto as variáveis não estiverem configuradas, o aplicativo continua iniciando normalmente e `supabase` será `null`. Assim podemos colocar o frontend no Vercel primeiro e conectar autenticação e banco depois.

### Segurança

Nunca coloque no frontend:

- `service_role`
- secret key administrativa
- senha do banco
- tokens privados

Variáveis `VITE_*` ficam disponíveis no bundle do navegador. Use somente a chave pública/anon/publishable e proteja as tabelas com **Row Level Security (RLS)**.

## 4. Próxima etapa do banco

Quando o projeto Supabase for criado, a integração deverá ser feita em etapas:

1. autenticação do responsável;
2. tabela de perfis TEA vinculada ao responsável;
3. tabela de tarefas;
4. etapas das tarefas;
5. preferências sensoriais e de acessibilidade;
6. políticas RLS para que cada responsável veja apenas os perfis vinculados à própria conta.

O acesso do TEA pode ser implementado depois com um vínculo seguro ao responsável, evitando expor credenciais administrativas no dispositivo.
