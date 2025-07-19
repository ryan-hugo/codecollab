import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store";

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Componente PrivateRoute
 * Protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>Verificando autenticação...</div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  // Salvar a URL atual no state para redirecionar após login
  if (!isAuthenticated) {
    console.log("🔒 Usuário não autenticado, redirecionando para login...");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se autenticado, renderizar o componente filho
  console.log(
    "✅ Usuário autenticado, acesso liberado para:",
    location.pathname
  );
  return <>{children}</>;
};

export default PrivateRoute;
