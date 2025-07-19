import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store";
import { snippetAPI, type Snippet } from "../services/snippetAPI";

/**
 * Página do Dashboard
 * Lista todos os snippets disponíveis na plataforma
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar snippets da API
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await snippetAPI.getAll();

        if (response.data.success) {
          setSnippets(response.data.data.snippets);
        } else {
          setError("Erro ao carregar snippets");
        }
      } catch (err) {
        console.error("Erro ao buscar snippets:", err);
        setError("Erro de conexão. Tente novamente mais tarde.");

        // Fallback para dados de exemplo em caso de erro
        setSnippets([
          {
            id: "1",
            title: "React Hook Form Example",
            description: "Exemplo de uso do React Hook Form com validação",
            content: "// Código de exemplo aqui",
            language: "typescript",
            tags: ["react", "forms", "validation"],
            isPublic: true,
            views: 145,
            likes: 23,
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            authorId: user?.id || "1",
            author: {
              id: user?.id || "1",
              username: user?.username || "usuario_exemplo",
              firstName: user?.firstName || "João",
              lastName: user?.lastName || "Silva",
              avatar: null,
            },
            _count: {
              reviews: 5,
            },
          },
          {
            id: "2",
            title: "CSS Flexbox Layout",
            description: "Layout responsivo usando CSS Flexbox",
            content: "/* CSS code here */",
            language: "css",
            tags: ["css", "layout", "flexbox"],
            isPublic: true,
            views: 89,
            likes: 12,
            createdAt: "2024-01-14T15:45:00Z",
            updatedAt: "2024-01-14T15:45:00Z",
            authorId: "2",
            author: {
              id: "2",
              username: "dev_maria",
              firstName: "Maria",
              lastName: "Santos",
              avatar: null,
            },
            _count: {
              reviews: 3,
            },
          },
          {
            id: "3",
            title: "Node.js Express Middleware",
            description: "Middleware customizado para autenticação JWT",
            content: "// Node.js code here",
            language: "javascript",
            tags: ["nodejs", "express", "middleware", "jwt"],
            isPublic: true,
            views: 203,
            likes: 31,
            createdAt: "2024-01-13T09:20:00Z",
            updatedAt: "2024-01-13T09:20:00Z",
            authorId: "3",
            author: {
              id: "3",
              username: "backend_carlos",
              firstName: "Carlos",
              lastName: "Lima",
              avatar: null,
            },
            _count: {
              reviews: 7,
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "yellow",
      typescript: "blue",
      python: "green",
      java: "orange",
      css: "purple",
      html: "red",
      react: "cyan",
      vue: "green",
      angular: "red",
      nodejs: "green",
      php: "purple",
      go: "blue",
      rust: "orange",
      cpp: "blue",
      c: "gray",
      csharp: "purple",
      swift: "orange",
      kotlin: "purple",
      dart: "blue",
      ruby: "red",
    };
    return colors[language.toLowerCase()] || "gray";
  };

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`);
  };

  const handleNewSnippet = () => {
    navigate("/submit");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Carregando snippets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              {snippets.length} snippets disponíveis na plataforma
            </p>
          </div>

          <button
            onClick={handleNewSnippet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Novo Snippet</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-orange-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <div>
                <p className="font-medium text-orange-800">Atenção!</p>
                <p className="text-sm text-orange-700">{error}</p>
                <p className="text-sm text-orange-600 mt-1">
                  Exibindo dados de exemplo temporariamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Snippets Grid */}
        {snippets.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
            <div className="flex flex-col gap-4 items-center">
              <svg
                className="w-16 h-16 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <p className="text-xl font-medium text-gray-600">
                Nenhum snippet encontrado
              </p>
              <p className="text-gray-500 text-center">
                Seja o primeiro a compartilhar um snippet com a comunidade!
              </p>
              <button
                onClick={handleNewSnippet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Criar Primeiro Snippet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <button
                key={snippet.id}
                onClick={() => handleSnippetClick(snippet.id)}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 active:transform-none w-full text-left group"
              >
                <div className="flex flex-col gap-3 h-full">
                  {/* Header */}
                  <div className="flex justify-between w-full">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        getLanguageColor(snippet.language) === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : getLanguageColor(snippet.language) === "blue"
                          ? "bg-blue-100 text-blue-800"
                          : getLanguageColor(snippet.language) === "green"
                          ? "bg-green-100 text-green-800"
                          : getLanguageColor(snippet.language) === "orange"
                          ? "bg-orange-100 text-orange-800"
                          : getLanguageColor(snippet.language) === "purple"
                          ? "bg-purple-100 text-purple-800"
                          : getLanguageColor(snippet.language) === "red"
                          ? "bg-red-100 text-red-800"
                          : getLanguageColor(snippet.language) === "cyan"
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {snippet.language.toUpperCase()}
                    </span>
                    {snippet.isPublic && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">
                        Público
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight line-clamp-2">
                      {snippet.title}
                    </h3>

                    {snippet.description && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {snippet.description}
                      </p>
                    )}

                    {/* Tags */}
                    {snippet.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {snippet.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2 py-0.5 text-2xs font-medium rounded-full border border-gray-300 text-gray-700 bg-white"
                          >
                            {tag}
                          </span>
                        ))}
                        {snippet.tags.length > 3 && (
                          <span className="inline-flex px-2 py-0.5 text-2xs font-medium rounded-full border border-gray-300 text-gray-700 bg-white">
                            +{snippet.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between w-full pt-2">
                    <div className="flex flex-col gap-0">
                      <p className="text-sm text-gray-700 font-medium">
                        {snippet.author.firstName && snippet.author.lastName
                          ? `${snippet.author.firstName} ${snippet.author.lastName}`
                          : `@${snippet.author.username}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(snippet.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex gap-1 items-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {snippet.views}
                        </span>
                      </div>

                      <div className="flex gap-1 items-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {snippet.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
