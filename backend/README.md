# Apostila Interativa - Backend

Base inicial para a API do projeto Apostila Interativa, com integração preparada para Supabase/PostgreSQL.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [npm](https://www.npmjs.com/) 9 ou superior

## Instalação

Na primeira vez, instale as dependências:

```bash
npm install
```

## Execução

Iniciar em modo desenvolvimento (recarrega automaticamente com nodemon):

```bash
npm run dev
```

Executar em modo produção:

```bash
npm start
```

Por padrão a API irá responder em `http://localhost:3333`.

### Rotas disponíveis

- `GET /` — mensagem de boas-vindas e ambiente atual.
- `GET /api/health` — endpoint de verificação de saúde da aplicação, incluindo status da conexão com o Supabase.

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste conforme necessidade.

```bash
cp .env.example .env
```

### Valores suportados

| Variável                     | Descrição                                                                    | Padrão                         |
|------------------------------|-------------------------------------------------------------------------------|--------------------------------|
| `PORT`                       | Porta onde o servidor irá escutar                                            | `3333`                         |
| `APP_NAME`                   | Nome exibido nos logs do servidor                                            | `Apostila Interativa API`      |
| `NODE_ENV`                   | Ambiente de execução (`development`, `production`, `test`)                   | `development`                  |
| `SUPABASE_URL`               | URL do projeto Supabase                                                      | _(obrigatório)_                |
| `SUPABASE_ANON_KEY`          | Chave pública (`anon`) do Supabase (opcional, útil para repassar ao frontend) | _(vazio)_                      |
| `SUPABASE_SERVICE_ROLE_KEY`  | Chave de serviço (service role) do Supabase utilizada pelo backend           | _(obrigatório)_                |

> **Importante:** mantenha a `SUPABASE_SERVICE_ROLE_KEY` fora do controle de versão e não exponha essa chave em clientes públicos.

## Verificando a conexão com o Supabase

A rota `GET /api/health` tenta executar uma consulta simples utilizando o cliente do Supabase. Caso algo esteja incorreto na configuração (por exemplo, chave inválida ou projeto indisponível), o campo `database.status` retornará `error` juntamente com a mensagem correspondente.

### Solução de problemas com Supabase

Se a resposta indicar erro de conexão:

1. Confirme que as variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão presentes no `.env` e sem espaços extras.
2. Verifique se o valor de `SUPABASE_URL` segue o formato completo fornecido pelo dashboard (por exemplo, `https://<project>.supabase.co`).
3. Gere uma nova `service_role` no painel **Project Settings → API** do Supabase caso a chave tenha sido revogada.
4. Confirme que o usuário da chave possui permissão para acessar a API de autenticação (utilizada no healthcheck através de `auth.admin.listUsers`).
5. Se estiver utilizando regras de firewall/Proxy, libere acesso de saída para os domínios `supabase.co`.

Persistindo o erro, consulte os logs do Supabase em **Project Settings → Logs** para mensagens detalhadas.

## Próximos passos sugeridos

- Adicionar testes automatizados.
- Definir padrão de lint e formatação.
- Implementar domínio de autenticação e recursos principais da aplicação.
