# Instruções para Deploy na Vercel

Este documento contém instruções para fazer o deploy correto deste projeto na Vercel.

## Problemas conhecidos e soluções

### Problema com o bcrypt

O bcrypt é uma biblioteca que depende de módulos nativos do Node.js que não estão disponíveis no navegador. Como estamos usando o bcrypt no cliente, isso causa erros durante o build. Existem algumas formas de resolver esse problema:

#### Solução 1: Usar somente no servidor (recomendado)

A melhor solução é garantir que o bcrypt seja usado apenas no servidor (API routes) e nunca no lado do cliente:

1. Mover todo o código que usa bcrypt para API routes
2. Não importar auth.ts no lado do cliente (React components)
3. Usar autenticação baseada em tokens no cliente

#### Solução 2: Substituir bcrypt por alternativas para o browser

Outra solução é substituir o bcrypt por bibliotecas que funcionam no navegador:

- Substituir bcrypt por `bcryptjs` que é uma implementação em JavaScript puro
- Usar `crypto-js` ou outras bibliotecas de criptografia para o navegador

Para implementar essa solução:

1. Instalar bcryptjs: `npm install bcryptjs`
2. Substituir as importações e chamadas ao bcrypt

### Configurações necessárias para o deploy

Para garantir um deploy bem-sucedido na Vercel, verifique as seguintes configurações:

1. **next.config.js**:
   - Remova a configuração `output: 'export'` que não é necessária ao usar a Vercel
   - Se você estiver usando o bcrypt apenas nas API routes, não há necessidade de configurações adicionais

2. **Variáveis de ambiente**:
   - Certifique-se de configurar as variáveis de ambiente na Vercel:
     - JWT_SECRET (para autenticação)
     - Variáveis para Vercel Postgres
     - Variáveis para Vercel Blob Storage

3. **Configuração do Banco de Dados**:
   - Use o painel da Vercel para criar um banco de dados Postgres
   - Conecte-o ao seu projeto na Vercel

## Passos para deploy

1. Empurre seu código para um repositório Git (GitHub, GitLab, Bitbucket)
2. Na Vercel, importe o repositório
3. Configure as variáveis de ambiente necessárias
4. Faça o deploy
5. Verifique os logs para quaisquer erros

## Estrutura de pastas recomendada

```
/src
  /app        # Páginas e componentes do lado do cliente
  /components # Componentes reutilizáveis
  /lib        # Bibliotecas e utilitários
    /vercel   # Código para serviços da Vercel
  /pages      # API routes (lado do servidor)
    /api      # Apenas código do servidor (bcrypt é seguro aqui)
```

## Verificação pré-deploy

Antes de fazer o deploy, verifique:

1. Todo o código que usa bcrypt está em API routes
2. Não há referências diretas a bcrypt no código do lado do cliente
3. As variáveis de ambiente estão configuradas no Vercel
4. Requisições à API usam caminhos relativos, não absolutos

Seguindo estas instruções, seu deploy na Vercel deve ser bem-sucedido! 