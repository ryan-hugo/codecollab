# 🔗 Configuração do Axios - CodeCollab Frontend

## 📁 Arquivos Criados

### ✅ **src/services/api.ts** - Configuração Principal do Axios

### ✅ **src/services/authAPI.ts** - API de Autenticação

### ✅ **src/services/snippetAPI.ts** - API de Snippets

### ✅ **src/services/index.ts** - Exportações Centralizadas

### ✅ **src/env.d.ts** - Tipagem das Variáveis de Ambiente

### ✅ **.env** e **.env.example** - Configuração de Ambiente

## 🛠️ **Configuração Principal**

### **Instância do Axios**

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
```

### **Interceptor de Requisição** ✅

- Adiciona automaticamente o token JWT do localStorage
- Formato: `Authorization: Bearer <token>`
- Logs de desenvolvimento
- Tratamento de erros

### **Interceptor de Resposta** ✅

- Tratamento automático de erros 401 (token expirado)
- Redirecionamento automático para login
- Logs detalhados para desenvolvimento
- Mensagens de erro em português

## 🔐 **Gerenciamento de Token**

```typescript
import { getToken, setToken, removeToken } from "@/services";

// Obter token
const token = getToken();

// Salvar token após login
setToken(userToken);

// Remover token no logout
removeToken();
```

## 🚀 **Uso das APIs**

### **Autenticação**

```typescript
import { authAPI } from "@/services";

// Registrar usuário
const response = await authAPI.register({
  email: "user@example.com",
  password: "Password123!",
  username: "username",
  firstName: "Nome",
  lastName: "Sobrenome",
});

// Fazer login
const loginResponse = await authAPI.login({
  email: "user@example.com",
  password: "Password123!",
});

// Obter perfil do usuário
const profile = await authAPI.getProfile();
```

### **Snippets**

```typescript
import { snippetAPI } from "@/services";

// Criar snippet
const newSnippet = await snippetAPI.create({
  title: "Hello World",
  content: 'console.log("Hello World");',
  language: "javascript",
  description: "Um exemplo simples",
  tags: ["javascript", "exemplo"],
  isPublic: true,
});

// Buscar snippets
const snippets = await snippetAPI.search({
  page: 1,
  limit: 10,
  language: "javascript",
  search: "hello",
});

// Obter snippet específico
const snippet = await snippetAPI.getById("snippet-id");
```

## 🌍 **Variáveis de Ambiente**

### **.env**

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=CodeCollab
VITE_APP_VERSION=1.0.0
```

### **Uso no Código**

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

## 🛡️ **Tratamento de Erros**

### **Automático**

- **401**: Remoção de token + redirecionamento para login
- **403**: Mensagem de acesso negado
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor
- **Network**: Erro de conexão

### **Manual**

```typescript
import { getErrorMessage } from "@/services";

try {
  const response = await authAPI.login(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  console.error("Erro:", message);
}
```

## 🔄 **Fluxo de Autenticação**

1. **Login**: Token salvo no localStorage
2. **Requisições**: Token adicionado automaticamente
3. **Token Expirado**: Remoção automática + redirect
4. **Logout**: Remoção manual do token

## 📊 **Recursos Implementados**

- ✅ **Base URL Configurável** via environment
- ✅ **Interceptor de Autenticação** automático
- ✅ **Tratamento de Erros** abrangente
- ✅ **TypeScript** com tipagem completa
- ✅ **Logs de Desenvolvimento** detalhados
- ✅ **APIs Organizadas** por módulo
- ✅ **Utilities** para token management
- ✅ **Timeout** configurado (10s)
- ✅ **Headers** padrão JSON

## 🎯 **Próximos Passos**

1. ✅ Axios configurado
2. ⏳ Integrar com Zustand store
3. ⏳ Criar hooks customizados
4. ⏳ Implementar cache/SWR
5. ⏳ Adicionar retry logic
