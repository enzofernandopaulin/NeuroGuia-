# Fase 5 — conferência de sessão e perfis

Esta fase altera apenas o frontend. Enzo, que administra o projeto Vercel, pode revisar o commit e publicar pelo próprio acesso, sem compartilhar sua conta. Ela pressupõe as migrações das fases 2, 3 e 4 aplicadas no Supabase por Enzo.

## Cenários para conferir após a publicação

1. O responsável com dois estudantes alterna entre eles; rotina, adaptações e código/PIN seguem vinculados ao perfil selecionado.
2. Ao adicionar outro estudante e voltar antes de salvar, o painel anterior continua acessível; ao salvar, o perfil novo aparece na seleção.
3. Ao reabrir o site, uma sessão ativa retorna à área correspondente. Se a consulta falhar, a tela mostra um erro e permite tentar novamente.
4. A recuperação de senha volta ao perfil correto após a troca; um link inválido mostra uma orientação para pedir outro. Quem desiste da recuperação sai da sessão.

O build local não substitui esses testes integrados, que exigem o Supabase configurado e uma publicação efetuada por Enzo.
