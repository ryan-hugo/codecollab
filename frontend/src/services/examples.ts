// /**
//  * Exemplo de como usar as APIs do CodeCollab
//  * Este arquivo demonstra casos de uso comuns
//  */

// import { authAPI, snippetAPI, getToken, setToken, removeToken, getErrorMessage } from './index';
// // import the types from their actual module, e.g. './types' or wherever they are defined
// // import type { LoginSchema, RegisterSchema, CreateSnippetSchema } from './types';

// // =====================================================
// // 🔐 EXEMPLOS DE AUTENTICAÇÃO
// // =====================================================

// /**
//  * Exemplo: Fazer login
//  */
// export const handleLogin = async (email: string, password: string) => {
//   try {
//     const credentials: LoginSchema = { email, password };
//     const response = await authAPI.login(credentials);
    
//     // Salvar token automaticamente após login bem-sucedido
//     setToken(response.token);
    
//     console.log('Login realizado com sucesso:', response.user);
//     return { success: true, user: response.user };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro no login:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Registrar novo usuário
//  */
// export const handleRegister = async (userData: {
//   email: string;
//   password: string;
//   username: string;
//   firstName: string;
//   lastName: string;
// }) => {
//   try {
//     const registerData: RegisterSchema = userData;
//     const response = await authAPI.register(registerData);
    
//     // Salvar token automaticamente após registro
//     setToken(response.token);
    
//     console.log('Usuário registrado com sucesso:', response.user);
//     return { success: true, user: response.user };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro no registro:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Obter perfil do usuário
//  */
// export const getUserProfile = async () => {
//   try {
//     const token = getToken();
//     if (!token) {
//       throw new Error('Usuário não está logado');
//     }

//     const profile = await authAPI.getProfile();
//     console.log('Perfil do usuário:', profile);
//     return { success: true, profile };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao buscar perfil:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Fazer logout
//  */
// export const handleLogout = async () => {
//   try {
//     await authAPI.logout();
//     removeToken(); // Remove o token do localStorage
//     console.log('Logout realizado com sucesso');
//     return { success: true };
//   } catch (error) {
//     // Mesmo com erro, remover o token localmente
//     removeToken();
//     const message = getErrorMessage(error);
//     console.error('Erro no logout:', message);
//     return { success: false, error: message };
//   }
// };

// // =====================================================
// // 📝 EXEMPLOS DE SNIPPETS
// // =====================================================

// /**
//  * Exemplo: Criar um novo snippet
//  */
// export const createSnippet = async (snippetData: {
//   title: string;
//   content: string;
//   language: string;
//   description?: string;
//   tags?: string[];
//   isPublic?: boolean;
// }) => {
//   try {
//     const newSnippetData: CreateSnippetSchema = {
//       title: snippetData.title,
//       content: snippetData.content,
//       language: snippetData.language,
//       description: snippetData.description,
//       tags: snippetData.tags || [],
//       isPublic: snippetData.isPublic ?? true
//     };

//     const snippet = await snippetAPI.create(newSnippetData);
//     console.log('Snippet criado com sucesso:', snippet);
//     return { success: true, snippet };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao criar snippet:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Buscar snippets com filtros
//  */
// export const searchSnippets = async (filters: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   language?: string;
//   tags?: string[];
//   isPublic?: boolean;
// }) => {
//   try {
//     const searchParams: SearchSnippetsParams = {
//       page: filters.page || 1,
//       limit: filters.limit || 10,
//       search: filters.search,
//       language: filters.language,
//       tags: filters.tags,
//       isPublic: filters.isPublic
//     };

//     const result = await snippetAPI.search(searchParams);
//     console.log('Snippets encontrados:', result);
//     return { success: true, ...result };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao buscar snippets:', message);
//     return { success: false, error: message, data: [], total: 0 };
//   }
// };

// /**
//  * Exemplo: Obter um snippet específico
//  */
// export const getSnippetById = async (snippetId: string) => {
//   try {
//     const snippet = await snippetAPI.getById(snippetId);
//     console.log('Snippet encontrado:', snippet);
//     return { success: true, snippet };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao buscar snippet:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Atualizar um snippet
//  */
// export const updateSnippet = async (snippetId: string, updateData: {
//   title?: string;
//   content?: string;
//   language?: string;
//   description?: string;
//   tags?: string[];
//   isPublic?: boolean;
// }) => {
//   try {
//     const snippet = await snippetAPI.update(snippetId, updateData);
//     console.log('Snippet atualizado com sucesso:', snippet);
//     return { success: true, snippet };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao atualizar snippet:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Deletar um snippet
//  */
// export const deleteSnippet = async (snippetId: string) => {
//   try {
//     await snippetAPI.delete(snippetId);
//     console.log('Snippet deletado com sucesso');
//     return { success: true };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao deletar snippet:', message);
//     return { success: false, error: message };
//   }
// };

// /**
//  * Exemplo: Obter snippets do usuário logado
//  */
// export const getMySnippets = async (page = 1, limit = 10) => {
//   try {
//     const result = await snippetAPI.getMySnippets(page, limit);
//     console.log('Meus snippets:', result);
//     return { success: true, ...result };
//   } catch (error) {
//     const message = getErrorMessage(error);
//     console.error('Erro ao buscar meus snippets:', message);
//     return { success: false, error: message, data: [], total: 0 };
//   }
// };

// // =====================================================
// // 🔄 EXEMPLO DE USO EM COMPONENTE REACT
// // =====================================================

// /**
//  * Exemplo de lógica para uso em componente React
//  * 
//  * Para usar em um componente, adicione estes imports:
//  * import { useState, useEffect } from 'react';
//  * 
//  * E use as funções acima como:
//  * 
//  * const MyComponent = () => {
//  *   const [user, setUser] = useState(null);
//  *   const [snippets, setSnippets] = useState([]);
//  *   const [loading, setLoading] = useState(false);
//  * 
//  *   // Verificar se usuário está logado ao montar componente
//  *   useEffect(() => {
//  *     const checkAuth = async () => {
//  *       const token = getToken();
//  *       if (token) {
//  *         const result = await getUserProfile();
//  *         if (result.success) {
//  *           setUser(result.profile);
//  *         }
//  *       }
//  *     };
//  * 
//  *     checkAuth();
//  *   }, []);
//  * 
//  *   // Fazer login
//  *   const login = async (email: string, password: string) => {
//  *     setLoading(true);
//  *     const result = await handleLogin(email, password);
//  *     if (result.success) {
//  *       setUser(result.user);
//  *     } else {
//  *       alert(`Erro no login: ${result.error}`);
//  *     }
//  *     setLoading(false);
//  *   };
//  * 
//  *   // ... resto da lógica
//  * };
//  */
