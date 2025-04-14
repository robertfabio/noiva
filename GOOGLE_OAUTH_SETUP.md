# Configuração do Google OAuth para Noiva

Este guia explica como configurar o login com Google para a aplicação Noiva usando as credenciais fornecidas.

## Credenciais do Google OAuth

- **ID do Cliente**: `1008763995622-tssa64h75cgslviqbrk0q3gilmfbgvcs.apps.googleusercontent.com`
- **Chave Secreta do Cliente**: `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`

## Passo 1: Configurar o Google OAuth no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Selecione seu projeto
3. No menu lateral, navegue até "Authentication" > "Providers"
4. Encontre "Google" na lista de provedores e clique para configurar
5. Ative o provedor alternando o botão para "Enabled"
6. Preencha os campos com as credenciais:
   - **Client ID**: `1008763995622-tssa64h75cgslviqbrk0q3gilmfbgvcs.apps.googleusercontent.com`
   - **Secret**: `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`
7. Em "Redirect URL", você verá uma URL no formato:
   - `https://[SEU-PROJETO].supabase.co/auth/v1/callback`
   - **Copie esta URL** para configurar no console do Google

## Passo 2: Atualizar a configuração no Google Cloud Console

1. Acesse o [Console do Google Cloud Platform](https://console.cloud.google.com/)
2. Selecione o projeto onde você criou estas credenciais
3. Navegue até "APIs e Serviços" > "Credenciais"
4. Encontre a credencial OAuth criada e clique para editar
5. Em "URIs de redirecionamento autorizados", adicione:
   - A URL de callback do Supabase que você copiou no passo 1.7
   - `https://noiva-9uwazeabo-robertfabios-projects.vercel.app/auth/callback` (URL da sua aplicação em produção)
   - `http://localhost:3000/auth/callback` (para desenvolvimento local)
6. Salve as alterações

## Passo 3: Configurar as variáveis de ambiente na Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto "noiva"
3. Vá para a aba "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:
   - `GOOGLE_CLIENT_ID`: `1008763995622-tssa64h75cgslviqbrk0q3gilmfbgvcs.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `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`
5. Clique em "Save" para salvar as variáveis

## Passo 4: Configurar o banco de dados no Supabase

1. No Dashboard do Supabase, vá para "SQL Editor"
2. Cole e execute o conteúdo do arquivo `supabase-schema.sql` para criar as tabelas necessárias
3. Verifique se as tabelas `rooms` e `user_rooms` foram criadas corretamente

## Passo 5: Redeploy na Vercel

1. Faça um novo deploy do seu projeto na Vercel:
```bash
vercel deploy --prod
```

2. Ou acione um novo deploy pelo painel da Vercel, conectado ao seu repositório

## Teste e Solução de Problemas

Após configurar, tente fazer login com o Google em:
- https://noiva-9uwazeabo-robertfabios-projects.vercel.app/auth/login

Se encontrar problemas:

1. Verifique os logs no console do navegador para mensagens de erro detalhadas.
2. Verifique se as URIs de redirecionamento estão configuradas corretamente no Google Cloud Console.
3. Confirme que as variáveis de ambiente estão configuradas na Vercel.
4. Verifique no Supabase se há erros relacionados a autenticação na seção "Authentication" > "Logs".

## Configuração Segura

⚠️ **IMPORTANTE**: As credenciais incluídas neste documento são apenas para esta aplicação específica. Nunca compartilhe suas credenciais em repositórios públicos ou com pessoas não autorizadas. 