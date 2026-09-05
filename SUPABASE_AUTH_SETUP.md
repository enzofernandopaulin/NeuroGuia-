# Supabase Auth — tópico 1

O NeuroGuia agora usa autenticação real do Supabase para o perfil **Responsável**.

## O que foi implementado

- cadastro por e-mail e senha;
- nome do responsável salvo em `user_metadata.full_name`;
- login por e-mail e senha;
- sessão persistente;
- restauração automática da sessão após atualizar a página;
- logout real;
- envio de e-mail de recuperação de senha;
- tela para definir nova senha ao abrir o link de recuperação;
- tratamento para projetos Supabase que exigem confirmação de e-mail.

## Configuração no Vercel

Cadastre:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
VITE_APP_URL=https://neuro-guia-kappa.vercel.app
```

Depois faça um Redeploy.

## Configuração no Supabase

Em **Authentication > URL Configuration**:

- Site URL: `https://neuro-guia-kappa.vercel.app`
- Redirect URLs: adicione `https://neuro-guia-kappa.vercel.app/**`

Assim os links de confirmação e recuperação voltam para o aplicativo publicado.

## Observação

O acesso TEA ainda permanece temporário e sem vínculo nesta etapa. Isso será resolvido no **tópico 3**, com código/QR de vínculo ao perfil criado pelo responsável.
