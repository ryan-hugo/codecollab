import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAppInitialization } from "./store";

// Import page components
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  SubmitSnippetPage,
  SnippetDetailPage,
} from "./pages";

// Import the components
import { PrivateRoute, Layout, LoadingSpinner } from "./components";

function App() {
  const { initializeApp, isLoading } = useAppInitialization();

  // Initialize the auth store when the app starts
  useEffect(() => {
    console.log("🚀 Inicializando aplicação CodeCollab...");
    initializeApp();
  }, [initializeApp]);

  // Show loading spinner while initializing
  if (isLoading) {
    return <LoadingSpinner message="Inicializando CodeCollab..." />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <PrivateRoute>
                <SubmitSnippetPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/snippet/:id"
            element={
              <PrivateRoute>
                <SnippetDetailPage />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
