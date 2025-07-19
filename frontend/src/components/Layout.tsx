import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, useAuthAPI } from "../store";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Componente Layout
 * Fornece a estrutura básica da aplicação com header e navegação
 */
const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  const { logoutWithAPI } = useAuthAPI();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      await logoutWithAPI();
      navigate("/login");
    }
  };

  // Não mostrar header nas páginas de login/register
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7fafc" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "64px",
          }}
        >
          {/* Logo/Brand */}
          <Link
            to="/dashboard"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2d3748",
              textDecoration: "none",
            }}
          >
            CodeCollab
          </Link>

          {/* Navigation */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  style={{
                    color:
                      location.pathname === "/dashboard"
                        ? "#3182ce"
                        : "#4a5568",
                    textDecoration: "none",
                    fontWeight:
                      location.pathname === "/dashboard" ? "600" : "400",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor:
                      location.pathname === "/dashboard"
                        ? "#ebf8ff"
                        : "transparent",
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  to="/submit"
                  style={{
                    color:
                      location.pathname === "/submit" ? "#3182ce" : "#4a5568",
                    textDecoration: "none",
                    fontWeight: location.pathname === "/submit" ? "600" : "400",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor:
                      location.pathname === "/submit"
                        ? "#ebf8ff"
                        : "transparent",
                  }}
                >
                  Criar Snippet
                </Link>

                {/* User Menu */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <span style={{ color: "#4a5568", fontSize: "14px" }}>
                    Olá, {user?.firstName || user?.username || user?.email}!
                  </span>

                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: "#e53e3e",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link
                  to="/login"
                  style={{
                    color: "#3182ce",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #3182ce",
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  style={{
                    backgroundColor: "#3182ce",
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  Registrar
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
