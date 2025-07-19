import { create } from 'zustand';

// Tipos para o usuário
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  points?: number;
  level?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface do estado de autenticação
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Interface das ações
interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// Estado inicial
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Iniciar como true enquanto verifica localStorage
};

// Chaves do localStorage
const STORAGE_KEYS = {
  TOKEN: 'codecollab_token',
  USER: 'codecollab_user',
} as const;

// Utilitários para localStorage
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao acessar token do localStorage:', error);
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Erro ao acessar user do localStorage:', error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Erro ao salvar token no localStorage:', error);
  }
};

const setStoredUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Erro ao salvar user no localStorage:', error);
  }
};

const removeStoredAuth = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Erro ao remover dados de auth do localStorage:', error);
  }
};

// Store principal de autenticação
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Estado inicial
  ...initialState,

  // Ação de login
  login: (token: string, user: User) => {
    console.log('🔐 AuthStore: Realizando login...', { userId: user.id, email: user.email });
    
    // Salvar no localStorage
    setStoredToken(token);
    setStoredUser(user);

    // Atualizar estado
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });

    console.log('✅ AuthStore: Login realizado com sucesso');
  },

  // Ação de logout
  logout: () => {
    console.log('🚪 AuthStore: Realizando logout...');
    
    // Remover do localStorage
    removeStoredAuth();

    // Resetar estado
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    console.log('✅ AuthStore: Logout realizado com sucesso');
  },

  // Definir estado de loading
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Atualizar dados do usuário
  setUser: (user: User) => {
    console.log('👤 AuthStore: Atualizando dados do usuário...', { userId: user.id });
    
    // Salvar no localStorage
    setStoredUser(user);

    // Atualizar estado
    set({ user });

    console.log('✅ AuthStore: Dados do usuário atualizados');
  },

  // Limpar completamente o estado de auth (útil para logout forçado)
  clearAuth: () => {
    console.log('🧹 AuthStore: Limpando estado de autenticação...');
    
    // Remover do localStorage
    removeStoredAuth();

    // Resetar para estado inicial
    set({
      ...initialState,
      isLoading: false, // Não deixar em loading após clear
    });

    console.log('✅ AuthStore: Estado de autenticação limpo');
  },
}));

// Hook personalizado para inicializar o store
export const initializeAuthStore = () => {
  console.log('🔄 AuthStore: Inicializando estado de autenticação...');
  
  const { setLoading, login, clearAuth } = useAuthStore.getState();
  
  // Definir como loading
  setLoading(true);

  try {
    // Tentar carregar dados do localStorage
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      console.log('📦 AuthStore: Dados encontrados no localStorage, restaurando sessão...', {
        userId: storedUser.id,
        email: storedUser.email,
      });
      
      // Restaurar sessão
      login(storedToken, storedUser);
    } else {
      console.log('📭 AuthStore: Nenhum dado de autenticação encontrado no localStorage');
      
      // Garantir que está limpo
      clearAuth();
    }
  } catch (error) {
    console.error('❌ AuthStore: Erro ao inicializar estado de autenticação:', error);
    
    // Em caso de erro, limpar tudo
    clearAuth();
  } finally {
    // Sempre definir loading como false ao final
    setLoading(false);
  }

  console.log('✅ AuthStore: Inicialização concluída');
};

// Seletores úteis (hooks derivados)
export const useAuth = () => {
  const { token, user, isAuthenticated, isLoading } = useAuthStore();
  return { token, user, isAuthenticated, isLoading };
};

export const useAuthActions = () => {
  const { login, logout, setLoading, setUser, clearAuth } = useAuthStore();
  return { login, logout, setLoading, setUser, clearAuth };
};

// Utilitários exportados
export const authUtils = {
  getToken: () => useAuthStore.getState().token,
  getUser: () => useAuthStore.getState().user,
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,
  isLoading: () => useAuthStore.getState().isLoading,
};
