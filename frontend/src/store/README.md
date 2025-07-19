# 🔐 Auth Store com Zustand - CodeCollab Frontend

## 📁 Arquivos do Sistema de Autenticação

### ✅ **src/store/authStore.ts** - Store Principal Zustand

### ✅ **src/store/authHooks.ts** - Hooks de Integração com API

### ✅ **src/store/authStore.examples.ts** - Exemplos de Uso

### ✅ **src/store/index.ts** - Exportações Centralizadas

---

## 🛠️ **Configuração do Zustand Auth Store**

### **Estado do Store**

```typescript
interface AuthState {
  token: string | null; // JWT token
  user: User | null; // Dados do usuário logado
  isAuthenticated: boolean; // Status de autenticação
  isLoading: boolean; // Loading state
}
```

### **Ações Disponíveis**

```typescript
interface AuthActions {
  login: (token: string, user: User) => void; // Fazer login
  logout: () => void; // Fazer logout
  setLoading: (loading: boolean) => void; // Alterar loading
  setUser: (user: User) => void; // Atualizar usuário
  clearAuth: () => void; // Limpar estado
}
```

### **Hooks Principais**

- `useAuth()` - Acessar estado de autenticação
- `useAuthActions()` - Acessar ações do store
- `initializeAuthStore()` - Inicializar store com dados do localStorage

---

## 🚀 **Uso Básico em Componentes**

### **Exemplo 1: Hook Simples**

```typescript
import { useAuth, useAuthActions } from "@/store";

const MyComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthActions();

  if (isLoading) return <div>Carregando...</div>;

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### **Exemplo 2: Hooks de API Integrados**

```typescript
import { useAuthAPI, useAuthStatus } from "@/store";

const LoginComponent = () => {
  const { loginWithAPI, isLoading } = useAuthAPI();
  const { isLoggedIn } = useAuthStatus();

  const handleLogin = async (email: string, password: string) => {
    const result = await loginWithAPI({ email, password });

    if (result.success) {
      console.log("Login bem-sucedido:", result.user);
    } else {
      alert(`Erro: ${result.error}`);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleLogin("user@example.com", "password")}
        disabled={isLoading}
      >
        {isLoading ? "Fazendo login..." : "Login"}
      </button>
    </div>
  );
};
```

---

## 🔗 **Hooks de Integração com API**

### **useAuthAPI** - Operações de Autenticação

```typescript
const {
  loginWithAPI, // (credentials) => Promise<{success, user?, error?}>
  registerWithAPI, // (userData) => Promise<{success, user?, error?}>
  logoutWithAPI, // () => Promise<void>
  fetchProfile, // () => Promise<{success, user?, error?}>
  isLoading,
} = useAuthAPI();
```

### **useAppInitialization** - Inicialização da App

```typescript
const AppProvider = () => {
  const { initializeApp, isLoading } = useAppInitialization();

  useEffect(() => {
    initializeApp(); // Carrega auth do localStorage + valida com servidor
  }, [initializeApp]);

  if (isLoading) return <div>Inicializando...</div>;

  return <App />;
};
```

### **useAuthGuard** - Proteção de Rotas

```typescript
const ProtectedPage = () => {
  const { checkAccess } = useAuthGuard();

  const accessCheck = checkAccess("admin"); // role opcional

  if (!accessCheck.canAccess) {
    return <div>{accessCheck.message}</div>;
  }

  return <div>Conteúdo protegido</div>;
};
```

### **useAuthForms** - Para Formulários

```typescript
const LoginForm = () => {
  const { handleLoginForm, isLoading } = useAuthForms();

  const onSubmit = async (formData) => {
    const result = await handleLoginForm(formData);

    if (!result.success) {
      setError(result.error);
    }
  };

  return <form onSubmit={onSubmit}>...</form>;
};
```

---

## 💾 **Gerenciamento de LocalStorage**

### **Automático**

- ✅ **Login**: Token e user salvos automaticamente
- ✅ **Logout**: Dados removidos automaticamente
- ✅ **Inicialização**: Carrega dados salvos na inicialização
- ✅ **Sincronização**: Store e localStorage sempre sincronizados

### **Chaves Utilizadas**

```typescript
const STORAGE_KEYS = {
  TOKEN: "codecollab_token",
  USER: "codecollab_user",
};
```

### **Tratamento de Erros**

- Falhas no localStorage são tratadas automaticamente
- Logs de erro detalhados para desenvolvimento
- Fallback seguro em caso de problemas

---

## 🔄 **Fluxo de Autenticação Completo**

### **1. Inicialização da App**

```typescript
// App.tsx ou main.tsx
import { useAppInitialization } from "@/store";

const App = () => {
  const { initializeApp } = useAppInitialization();

  useEffect(() => {
    initializeApp(); // Carrega auth + valida com servidor
  }, []);

  return <Router>...</Router>;
};
```

### **2. Login do Usuário**

```typescript
const result = await loginWithAPI({
  email: "user@example.com",
  password: "password123",
});

// Se sucesso:
// - Token salvo no localStorage
// - User salvo no localStorage
// - Store atualizado com isAuthenticated = true
// - Componentes re-renderizam automaticamente
```

### **3. Validação Automática**

```typescript
// A cada requisição (via interceptor do Axios):
// - Token adicionado automaticamente ao header
// - Se 401: token removido + user redirecionado para login
// - Store sincronizado automaticamente
```

### **4. Logout do Usuário**

```typescript
await logoutWithAPI();

// Executa:
// - Chamada para API de logout (opcional)
// - Remove token do localStorage
// - Remove user do localStorage
// - Store resetado para estado inicial
// - Componentes re-renderizam automaticamente
```

---

## 🎯 **Recursos Implementados**

### ✅ **Store Zustand Completo**

- Estado de autenticação centralizado
- Ações para login/logout/atualização
- Hooks de acesso simplificado
- TypeScript com tipagem completa

### ✅ **Integração com API**

- Hooks que combinam store + chamadas de API
- Tratamento automático de erros
- Loading states gerenciados automaticamente
- Sincronização token/localStorage

### ✅ **LocalStorage Automático**

- Persistência automática de token e user
- Carregamento automático na inicialização
- Limpeza automática no logout
- Tratamento robusto de erros

### ✅ **Hooks Especializados**

- `useAuthAPI` - Operações de autenticação
- `useAuthGuard` - Proteção de rotas
- `useAuthForms` - Integração com formulários
- `useAuthStatus` - Status simplificado
- `useAppInitialization` - Inicialização da app

### ✅ **Recursos Avançados**

- Validação automática de token com servidor
- Logs detalhados para desenvolvimento
- Tratamento de edge cases
- Subscribers para mudanças de estado
- Utilitários para acesso direto ao store

---

## 🔧 **Integração com React Router**

```typescript
// ProtectedRoute component
import { useAuthGuard } from "@/store";

const ProtectedRoute = ({ children }) => {
  const { checkAccess } = useAuthGuard();
  const access = checkAccess();

  if (access.reason === "loading") {
    return <Loading />;
  }

  if (!access.canAccess) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Usage in routes
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

---

## 📊 **Status do Sistema**

- ✅ **Zustand Store** - Configurado e funcional
- ✅ **LocalStorage** - Integração automática
- ✅ **API Integration** - Hooks completos
- ✅ **TypeScript** - Tipagem completa
- ✅ **Error Handling** - Tratamento robusto
- ✅ **Loading States** - Gerenciamento automático
- ✅ **Token Validation** - Verificação com servidor
- ✅ **Route Protection** - Guards de autenticação

**Pronto para uso em produção!** 🎉

---

## 🚀 **Próximos Passos Sugeridos**

1. ✅ Auth Store criado
2. ⏳ Integrar com React Router (ProtectedRoute)
3. ⏳ Criar componentes de Login/Register
4. ⏳ Implementar middleware de roles/permissões
5. ⏳ Adicionar refresh token automático
