/**
 * Exemplo prático de integração do Auth Store com componentes React
 * Este arquivo demonstra a implementação real em um componente
 */

import { useEffect, useState } from "react";
import {
  useAuth,
  useAuthAPI,
  useAuthGuard,
  useAuthStatus,
  useAppInitialization,
} from "./index";

// =====================================================
// 🚀 APP PROVIDER - Inicialização
// =====================================================

/**
 * Provider principal da aplicação
 * Deve envolver toda a aplicação
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { initializeApp, isLoading: initLoading } = useAppInitialization();

  useEffect(() => {
    console.log("🚀 Inicializando AuthProvider...");
    initializeApp();
  }, [initializeApp]);

  if (initLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Inicializando CodeCollab...</div>
      </div>
    );
  }

  return <>{children}</>;
};

// =====================================================
// 🔐 COMPONENTE DE LOGIN
// =====================================================

interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Componente de login com integração completa
 */
export const LoginComponent = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const { loginWithAPI, isLoading } = useAuthAPI();
  const { isLoggedIn } = useAuthStatus();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isLoggedIn) {
      console.log("Usuário já está logado, redirecionando...");
      // navigate('/dashboard'); // Com React Router
    }
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Email e senha são obrigatórios");
      return;
    }

    try {
      const result = await loginWithAPI({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        console.log("Login realizado com sucesso!", result.user);
        // navigate('/dashboard'); // Redirecionar após login
      } else {
        setError(result.error || "Erro no login");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado. Tente novamente.");
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Limpar erro ao digitar
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: "20px" }}>
      <h2>Login - CodeCollab</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="seu@email.com"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Senha:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="sua senha"
          />
        </div>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffe6e6",
              borderRadius: "4px",
              border: "1px solid #ffcccb",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isLoading ? "Fazendo login..." : "Entrar"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <small>
          Não tem conta? <a href="/register">Registrar-se</a>
        </small>
      </div>
    </div>
  );
};

// =====================================================
// 👤 COMPONENTE DO PERFIL DO USUÁRIO
// =====================================================

/**
 * Componente que mostra informações do usuário logado
 */
export const UserProfileComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const { logoutWithAPI, fetchProfile, isLoading } = useAuthAPI();
  const { userDisplayName, userEmail } = useAuthStatus();

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      await logoutWithAPI();
      console.log("Logout realizado");
      // navigate('/login'); // Redirecionar após logout
    }
  };

  const handleRefreshProfile = async () => {
    const result = await fetchProfile();
    if (result.success) {
      console.log("Perfil atualizado:", result.user);
    } else {
      console.error("Erro ao atualizar perfil:", result.error);
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Usuário não está logado</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: "20px" }}>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Perfil do Usuário</h3>

        <div style={{ marginBottom: "10px" }}>
          <strong>Nome:</strong> {userDisplayName || "Não informado"}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Email:</strong> {userEmail}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Username:</strong> {user.username}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>ID:</strong> {user.id}
        </div>

        {user.points !== undefined && (
          <div style={{ marginBottom: "10px" }}>
            <strong>Pontos:</strong> {user.points}
          </div>
        )}

        {user.level !== undefined && (
          <div style={{ marginBottom: "10px" }}>
            <strong>Nível:</strong> {user.level}
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <strong>Membro desde:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleRefreshProfile}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Atualizando..." : "Atualizar Perfil"}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
};

// =====================================================
// 🔒 COMPONENTE DE PROTEÇÃO DE ROTA
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Componente que protege rotas privadas
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { checkAccess } = useAuthGuard();

  const access = checkAccess(requiredRole);

  if (access.reason === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        Verificando permissões...
      </div>
    );
  }

  if (!access.canAccess) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#ffe6e6",
          margin: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>Acesso Restrito</h3>
        <p>{access.message}</p>
        {access.reason === "unauthenticated" && (
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => {
                console.log("Redirecionando para login...");
                // navigate('/login');
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Fazer Login
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// =====================================================
// 📊 COMPONENTE DE STATUS DE AUTENTICAÇÃO
// =====================================================

/**
 * Componente que mostra o status atual de autenticação
 * Útil para desenvolvimento e debugging
 */
export const AuthStatusComponent = () => {
  const { token, user, isAuthenticated, isLoading } = useAuth();
  const { isLoggedIn, userDisplayName } = useAuthStatus();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        minWidth: "250px",
        fontSize: "12px",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
        Status de Autenticação
      </h4>

      <div style={{ marginBottom: "5px" }}>
        <strong>Carregando:</strong> {isLoading ? "✅" : "❌"}
      </div>

      <div style={{ marginBottom: "5px" }}>
        <strong>Autenticado:</strong> {isAuthenticated ? "✅" : "❌"}
      </div>

      <div style={{ marginBottom: "5px" }}>
        <strong>Logado:</strong> {isLoggedIn ? "✅" : "❌"}
      </div>

      <div style={{ marginBottom: "5px" }}>
        <strong>Tem Token:</strong> {!!token ? "✅" : "❌"}
      </div>

      <div style={{ marginBottom: "5px" }}>
        <strong>Tem User:</strong> {!!user ? "✅" : "❌"}
      </div>

      {userDisplayName && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #dee2e6",
          }}
        >
          <strong>Usuário:</strong> {userDisplayName}
        </div>
      )}
    </div>
  );
};

// =====================================================
// 🎯 EXEMPLO DE USO COMPLETO
// =====================================================

/**
 * Exemplo de como usar todos os componentes juntos
 * Este seria o seu App.tsx principal
 */
export const ExampleApp = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      <div style={{ minHeight: "100vh" }}>
        {/* Header sempre visível */}
        <header
          style={{
            backgroundColor: "#343a40",
            color: "white",
            padding: "1rem",
            marginBottom: "20px",
          }}
        >
          <h1>CodeCollab</h1>
          {isAuthenticated && <UserProfileComponent />}
        </header>

        {/* Conteúdo principal */}
        <main>
          {!isAuthenticated ? (
            <LoginComponent />
          ) : (
            <ProtectedRoute>
              <div style={{ padding: "20px" }}>
                <h2>Dashboard</h2>
                <p>Conteúdo protegido da aplicação</p>
              </div>
            </ProtectedRoute>
          )}
        </main>

        {/* Status de debug (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && <AuthStatusComponent />}
      </div>
    </AuthProvider>
  );
};

// =====================================================
// 📝 COMENTÁRIOS PARA USO EM PRODUÇÃO
// =====================================================

/*
Para usar estes componentes em produção:

1. Copie os componentes necessários para seus arquivos
2. Substitua os console.log por navegação real (React Router)
3. Adicione estilos CSS apropriados (Chakra UI, Tailwind, etc.)
4. Customize a UI conforme seu design system
5. Adicione validação de formulários (React Hook Form + Zod)
6. Implemente tratamento de erros mais robusto

Exemplo com React Router:
```typescript
import { useNavigate } from 'react-router-dom';

const LoginComponent = () => {
  const navigate = useNavigate();
  
  // Substituir console.log por:
  // navigate('/dashboard'); 
};
```
*/
