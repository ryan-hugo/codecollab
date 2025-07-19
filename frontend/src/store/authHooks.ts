/**
 * Hooks customizados que integram o Zustand AuthStore com as APIs do CodeCollab
 */

import { useCallback } from 'react';
import { useAuth, useAuthActions, useAuthStore, initializeAuthStore } from './authStore';
import { authAPI, getErrorMessage } from '../services';
import { setToken, removeToken } from '../services/api';
import type { LoginData, RegisterData } from '../services';

// =====================================================
// 🔗 HOOKS DE INTEGRAÇÃO COM API
// =====================================================

/**
 * Hook para operações de autenticação com API
 * Combina o Zustand store com as chamadas de API reais
 */
export const useAuthAPI = () => {
  const { isLoading } = useAuth();
  const { login, logout, setLoading, clearAuth } = useAuthActions();

  // Login com API
  const loginWithAPI = useCallback(async (credentials: LoginData) => {
    setLoading(true);
    try {
      console.log('🔐 Realizando login via API...', { email: credentials.email });
      
      const response = await authAPI.login(credentials);
      
      // Sucesso: primeiro definir token no axios
      setToken(response.data.data.token);
      
      // Depois atualizar store
      login(response.data.data.token, response.data.data.user);
      
      console.log('✅ Login bem-sucedido:', { 
        userId: response.data.data.user.id, 
        email: response.data.data.user.email 
      });
      
      return { 
        success: true, 
        user: response.data.data.user, 
        token: response.data.data.token 
      };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      const errorMessage = getErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [login, setLoading]);

  // Register com API
  const registerWithAPI = useCallback(async (userData: RegisterData) => {
    setLoading(true);
    try {
      console.log('👤 Registrando usuário via API...', { 
        email: userData.email, 
        username: userData.username 
      });
      
      const response = await authAPI.register(userData);
      
      // Sucesso: fazer login automaticamente
      login(response.data.data.token, response.data.data.user);
      
      console.log('✅ Registro bem-sucedido:', { 
        userId: response.data.data.user.id, 
        email: response.data.data.user.email 
      });
      
      return { 
        success: true, 
        user: response.data.data.user, 
        token: response.data.data.token 
      };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      
      const errorMessage = getErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [login, setLoading]);

  // Logout com API
  const logoutWithAPI = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🚪 Realizando logout via API...');
      
      // Chamar API de logout
      await authAPI.logout();
      
      console.log('✅ Logout via API bem-sucedido');
    } catch (error) {
      console.error('⚠️ Erro no logout via API (prosseguindo com logout local):', error);
    } finally {
      // Sempre fazer logout local, mesmo se a API falhar
      removeToken(); // Remove token do axios
      logout(); // Remove do store
      setLoading(false);
      
      console.log('✅ Logout local concluído');
    }
  }, [logout, setLoading]);

  // Buscar perfil do usuário
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      console.log('👤 Buscando perfil do usuário...');
      
      const profile = await authAPI.getProfile();
      
      // Atualizar dados do usuário no store (usando a ação setUser se existir)
      // Por enquanto, fazemos um login "silencioso" para atualizar os dados
      const currentState = useAuthActions();
      if (currentState.setUser) {
        currentState.setUser(profile.data.data.user);
      }
      
      console.log('✅ Perfil carregado com sucesso:', { 
        userId: profile.data.data.user.id, 
        email: profile.data.data.user.email 
      });
      
      return { 
        success: true, 
        user: profile.data.data.user 
      };
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      
      // Se erro 401, fazer logout
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('401') || errorMessage.includes('token')) {
        console.log('🔒 Token expirado, fazendo logout...');
        clearAuth();
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearAuth]);

  return {
    loginWithAPI,
    registerWithAPI,
    logoutWithAPI,
    fetchProfile,
    isLoading
  };
};

/**
 * Hook para inicialização do app
 * Deve ser usado no componente raiz do app
 */
export const useAppInitialization = () => {
  const { isLoading } = useAuth();
  const { fetchProfile } = useAuthAPI();

  // Função para inicializar a aplicação
  const initializeApp = useCallback(async () => {
    console.log('🚀 Inicializando aplicação CodeCollab...');
    
    // Inicializar o auth store (carrega do localStorage)
    initializeAuthStore();
    
    // Verificar se há token e tentar validar com o servidor
    const authState = useAuthStore.getState();
    const token = authState.token;
    
    if (token) {
      console.log('🔍 Token encontrado, validando com servidor...');
      
      // Tentar buscar perfil para validar token
      const result = await fetchProfile();
      
      if (!result.success) {
        console.log('❌ Token inválido, limpando sessão...');
      } else {
        console.log('✅ Token válido, sessão restaurada');
      }
    } else {
      console.log('📭 Nenhum token encontrado');
    }
    
    console.log('✅ Inicialização da aplicação concluída');
  }, [fetchProfile]);

  return {
    initializeApp,
    isLoading
  };
};

/**
 * Hook para proteção de rotas
 * Retorna informações sobre o estado de autenticação
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, user, token } = useAuth();

  const checkAccess = useCallback((requiredRole?: string) => {
    if (isLoading) {
      return {
        canAccess: false,
        reason: 'loading',
        message: 'Verificando autenticação...'
      };
    }

    if (!isAuthenticated || !token || !user) {
      return {
        canAccess: false,
        reason: 'unauthenticated',
        message: 'É necessário fazer login para acessar esta página'
      };
    }

    // Verificação de role (se implementada futuramente)
    if (requiredRole) {
      // Por enquanto, todos os usuários autenticados têm acesso
      // Implementar verificação de roles quando necessário
      console.log(`Verificação de role '${requiredRole}' não implementada`);
    }

    return {
      canAccess: true,
      reason: 'authorized',
      message: 'Acesso autorizado'
    };
  }, [isAuthenticated, isLoading, user, token]);

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAccess
  };
};

/**
 * Hook para status de autenticação simplificado
 * Para uso em componentes que só precisam saber o status
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isLoggedIn: isAuthenticated && !!user,
    isLoading,
    userDisplayName: user ? `${user.firstName} ${user.lastName}` : null,
    userEmail: user?.email || null,
    userId: user?.id || null
  };
};

// =====================================================
// 🎯 HOOKS UTILITÁRIOS
// =====================================================

/**
 * Hook para forms de login/registro
 * Fornece handlers prontos para uso em forms
 */
export const useAuthForms = () => {
  const { loginWithAPI, registerWithAPI, isLoading } = useAuthAPI();

  const handleLoginForm = useCallback(async (formData: {
    email: string;
    password: string;
  }) => {
    const result = await loginWithAPI({
      email: formData.email,
      password: formData.password
    });

    return result;
  }, [loginWithAPI]);

  const handleRegisterForm = useCallback(async (formData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    const result = await registerWithAPI(formData);

    return result;
  }, [registerWithAPI]);

  return {
    handleLoginForm,
    handleRegisterForm,
    isLoading
  };
};

/**
 * Hook que retorna funções de navegação baseadas em auth
 * Para uso com React Router
 */
export const useAuthNavigation = () => {
  const { isAuthenticated } = useAuth();
  const { logoutWithAPI } = useAuthAPI();

  const handleLogoutAndRedirect = useCallback(async (redirectTo = '/login') => {
    await logoutWithAPI();
    
    // Aqui você adicionaria a lógica de navegação
    // Por exemplo, com React Router:
    // navigate(redirectTo);
    console.log(`Redirecionando para: ${redirectTo}`);
  }, [logoutWithAPI]);

  const requireAuthAndRedirect = useCallback((redirectTo = '/login') => {
    if (!isAuthenticated) {
      console.log(`Usuário não autenticado, redirecionando para: ${redirectTo}`);
      // navigate(redirectTo);
      return false;
    }
    return true;
  }, [isAuthenticated]);

  return {
    handleLogoutAndRedirect,
    requireAuthAndRedirect,
    isAuthenticated
  };
};
