# 🔨 Criador de Bancos de Dados Notion

Este serviço permite **criar bancos de dados Notion programaticamente** para o Mansão Maromba Distribution Radar.

## 📋 O que é criado

### 1. **Alvos de Prospecção** (Alvos de Prospecção)
- Rastreia prospects encontrados (bares, distribuidoras, etc.)
- Campos: Nome, Telefone, Email, Estágio do Funil, Último Contato, Notas

### 2. **Mapa de Distribuição** (Mapa de Distribuição)
- Mapa de pontos de venda atuais
- Campos: Nome, Estado, Cidade, Tipo, Status, Contato, Google Maps Link

### 3. **Backlog** (Backlog Radar Mansão Maromba)
- Rastreamento de tarefas e experimentos
- Campos: Tarefa, Status, Prioridade, Atribuição, Data de Vencimento

---

## ⚙️ Configuração

### 1. **Obtenha seu Notion Token**

```bash
# Vá para: https://www.notion.so/my-integrations
# 1. Crie uma nova integração (ou use uma existente)
# 2. Copie o "Internal Integration Token" (começa com secret_)
# 3. Cole no .env:

NOTION_TOKEN=secret_XXXXXXXXXXXXXXXXXXXX
```

### 2. **Encontre o ID da página pai**

```bash
# 1. Abra uma página no Notion (onde quer criar os bancos)
# 2. A URL será: https://www.notion.so/XXXXXXXXXXXXXXXX?v=XXX
# 3. Copie o ID (32 caracteres)
# 4. Cole no .env:

PARENT_PAGE_ID=b55c9c91384d452b81dbd1ef79372b75
```

### 3. **Atualize seu .env**

```dotenv
# Notion
NOTION_TOKEN=secret_XXXXXXXXXXXXXXXXXXXX
PARENT_PAGE_ID=b55c9c91384d452b81dbd1ef79372b75

# Google Places (existente)
GOOGLE_PLACES_API_KEY=AIzaSyAh...
```

---

## 🚀 Como usar

### Opção 1: Via NPM

```bash
npm run create-databases
```

### Opção 2: Via TypeScript direto

```bash
ts-node services/notion-setup/database-creator.ts
```

### Opção 3: Importar como módulo

```typescript
import { NotionDatabaseCreator } from './services/notion-setup/database-creator';

const creator = new NotionDatabaseCreator(process.env.NOTION_TOKEN);
const dbId = await creator.createProspectDatabase('page_id_aqui');
```

---

## 📊 Exemplo de código

```typescript
import { Client } from "@notionhq/client"
import * as dotenv from 'dotenv'

dotenv.config()

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Criar banco de dados de prospects
const response = await notion.databases.create({
  parent: {
    type: "page_id",
    page_id: process.env.PARENT_PAGE_ID
  },
  title: [{ text: { content: "Alvos de Prospecção" } }],
  properties: {
    // Define as colunas do banco
    "Prospect Name": { title: {} },
    "Phone": { phone_number: {} },
    "Status": {
      select: {
        options: [
          { name: "Lead", color: "blue" },
          { name: "Contacted", color: "yellow" },
        ]
      }
    }
  }
})

console.log(`Banco criado: ${response.id}`)
```

---

## ✅ O que muda após a criação

1. **Três novos bancos aparecem** no Notion em sua página
2. **Arquivo `.env` é automaticamente atualizado** com os IDs
3. **Você pode executar** `npm run prospect-bars Paraná` para popular automaticamente

---

## 🔗 Do código do usuário ao sistema

Seu código original:
```typescript
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const response = await notion.databases.create({
  parent: {
    type: "page_id",
    page_id: "b55c9c91-384d-452b-81db-d1ef79372b75"
  },
  title: [{ text: { content: "My Database" } }]
})
```

**Melhorias implementadas:**
- ✅ Agora usa `NOTION_TOKEN` (variável correta)
- ✅ `parent_page_id` via `.env` (não hardcoded)
- ✅ Títulos e propertiesParametrizados
- ✅ Múltiplos bancos em uma execução
- ✅ Atualiza `.env` automaticamente
- ✅ Validação de configuração

---

## 🎯 Fluxo completo

1. **Configure tokens** no `.env`
2. **Execute** `npm run create-databases`
3. **Veja** nos bancos criados no Notion
4. **Execute** `npm run prospect-bars Paraná`
5. **Veja** prospects sendo adicionados automaticamente com status "Sem contato"

---

## 📞 Integração com prospector

Após criar os bancos:

```bash
# Sua chave Google está configurada, então:
npm run prospect-bars Paraná

# Isso irá:
# 1. Buscar 139+ bares do Paraná
# 2. Verificar quais já existem
# 3. Adicionar novos com status "Sem contato"
# 4. Preencher telefone, endereço, notas com script
```

---

## 🐛 Troubleshooting

### "API token is invalid"
- Verifique se copiou o token completo
- Certifique-se que começa com `secret_`

### "Parent page not found"
- Copie o `page_id` correto da URL do Notion
- Remova parâmetros como `?v=`

### "Unauthorized"
- Vá em https://www.notion.so/my-integrations
- Confirme que a integração conectou à página

---

## 📚 Referências

- [Notion API Documentation](https://developers.notion.com/)
- [Database Create Reference](https://developers.notion.com/reference/create-a-database)
- [Property Schema Reference](https://developers.notion.com/reference/property-schema-object)
