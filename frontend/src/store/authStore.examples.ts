/**
 * Exemplos de uso do AuthStore do CodeCollab
 * Este arquivo demonstra como usar o Zustand store de autenticação
 */

import { useAuthStore, useAuth, useAuthActions, initializeAuthStore, authUtils } from './authStore';
import type { User } from './authStore';

// =====================================================
// 🔐 EXEMPLOS DE USO DO AUTH STORE
// =====================================================

/**
 * Exemplo 1: Inicialização do App
 * Use esta função no componente raiz do seu app (App.tsx)
 */
export const initializeApp = () => {
  // Inicializar o store de autenticação ao carregar o app
  initializeAuthStore();
};

/**
 * Exemplo 2: Lógica para uso em componentes
 * Esta é a forma mais comum de usar o store em componentes React
 */
export const createAuthComponent = () => {
  // Lógica que você usaria em um componente React:
  
  // const { token, user, isAuthenticated, isLoading } = useAuth();
  // const { login, logout } = useAuthActions();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Aqui você faria a chamada para a API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Atualizar o store com os dados retornados
        const { login } = useAuthStore.getState();
        login(data.token, data.user);
      }
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  // Exemplo de logout
  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    // Redirecionar para página de login se necessário
  };

  return { handleLogin, handleLogout };
};

/**
 * Exemplo 3: Uso direto do store (sem hooks)
 * Útil para uso fora de componentes React
 */
export const useStoreDirectly = () => {
  // Acessar estado atual
  const currentState = useAuthStore.getState();
  console.log('Estado atual:', currentState);

  // Fazer login programaticamente
  const performLogin = (token: string, userData: User) => {
    const { login } = useAuthStore.getState();
    login(token, userData);
  };

  // Fazer logout programaticamente
  const performLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
  };

  return { performLogin, performLogout };
};

/**
 * Exemplo 4: Uso dos utilitários
 * Para verificações rápidas de estado
 */
export const checkAuthStatus = () => {
  const token = authUtils.getToken();
  const user = authUtils.getUser();
  const isAuth = authUtils.isAuthenticated();
  const loading = authUtils.isLoading();

  console.log('Status de autenticação:', {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: isAuth,
    isLoading: loading
  });

  return { token, user, isAuth, loading };
};

/**
 * Exemplo 5: Lógica para Guard/Protetor de rotas
 * Para proteger rotas que precisam de autenticação
 */
export const createProtectedRouteLogic = () => {
  const checkAuthentication = () => {
    const { isAuthenticated, isLoading } = useAuthStore.getState();

    if (isLoading) {
      return { status: 'loading', message: 'Verificando autenticação...' };
    }

    if (!isAuthenticated) {
      return { status: 'unauthorized', message: 'Acesso negado. Faça login primeiro.' };
    }

    return { status: 'authorized', message: 'Acesso liberado' };
  };

  return { checkAuthentication };
};

/**
 * Exemplo 6: Hook customizado para operações de auth
 * Combina store com chamadas de API
 */
export const useAuthOperations = () => {
  const { login, logout, setLoading } = useAuthActions();
  const { isLoading } = useAuth();

  const performLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simular chamada de API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    setLoading(true);
    try {
      // Chamar API de logout se necessário
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      logout(); // Sempre fazer logout local
      setLoading(false);
    }
  };

  return {
    performLogin,
    performLogout,
    isLoading
  };
};

/**
 * Exemplo 7: Subscriber para mudanças no store
 * Para reagir a mudanças no estado de autenticação
 */
export const setupAuthListener = () => {
  // Inscrever-se nas mudanças do store
  const unsubscribe = useAuthStore.subscribe(
    (state) => {
      console.log('Estado de autenticação mudou:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        hasToken: !!state.token
      });

      // Executar ações baseadas no estado
      if (state.isAuthenticated) {
        console.log('Usuário está autenticado');
      } else {
        console.log('Usuário não está autenticado');
      }
    }
  );

  // Retornar função para cancelar a inscrição
  return unsubscribe;
};

// =====================================================
// 🔧 UTILITÁRIOS PARA INTEGRAÇÃO COM API
// =====================================================

/**
 * Exemplo 8: Integração com services/api.ts
 * Como usar o store junto com as APIs já criadas
 */
export const integrateWithApiServices = () => {
  // Esta função pode ser usada para configurar interceptors
  // que usam o Zustand store em vez do localStorage diretamente
  
  const getAuthToken = () => {
    return authUtils.getToken();
  };

  const handleTokenExpired = () => {
    const { clearAuth } = useAuthStore.getState();
    clearAuth();
    // Redirecionar para login
  };

  return { getAuthToken, handleTokenExpired };
};

/**
 * Exemplo 9: Sincronização com localStorage
 * O store já faz isso automaticamente, mas aqui está um exemplo
 * de como você pode implementar sincronização customizada
 */
export const syncWithLocalStorage = () => {
  const { token, user, login, clearAuth } = useAuthStore.getState();

  // Salvar no localStorage quando necessário
  if (token && user) {
    try {
      localStorage.setItem('codecollab_token', token);
      localStorage.setItem('codecollab_user', JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // Carregar do localStorage na inicialização
  const loadFromStorage = () => {
    try {
      const storedToken = localStorage.getItem('codecollab_token');
      const storedUserStr = localStorage.getItem('codecollab_user');

      if (storedToken && storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        login(storedToken, storedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      clearAuth();
    }
  };

  return { loadFromStorage };
};
