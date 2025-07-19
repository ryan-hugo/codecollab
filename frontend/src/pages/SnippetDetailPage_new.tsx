import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../store";
import { snippetAPI, type Snippet } from "../services/snippetAPI";
import { getLanguageDisplayName } from "../schemas/snippetSchema";

// Review/Comment types and schema
export interface Review {
  id: string;
  content: string;
  lineNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

const reviewSchema = z.object({
  content: z
    .string()
    .min(1, "O comentário não pode estar vazio")
    .max(500, "O comentário deve ter no máximo 500 caracteres"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Página de detalhes do snippet
 * Exibe código com syntax highlighting e permite comentários
 */
const SnippetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  // Buscar snippet e reviews
  useEffect(() => {
    const fetchSnippetData = async () => {
      if (!id) {
        setError("ID do snippet não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar snippet
        const snippetResponse = await snippetAPI.getById(id);

        if (snippetResponse.data.success) {
          setSnippet(snippetResponse.data.data.snippet);
        } else {
          setError(snippetResponse.data.message || "Erro ao carregar snippet");
        }

        // Mock de reviews - substituir por API real quando disponível
        setReviews([
          {
            id: "1",
            content: "Excelente exemplo! Muito bem estruturado.",
            lineNumber: null,
            createdAt: "2024-01-15T14:30:00Z",
            updatedAt: "2024-01-15T14:30:00Z",
            author: {
              id: "user1",
              username: "dev_maria",
              firstName: "Maria",
              lastName: "Silva",
            },
          },
          {
            id: "2",
            content: "Poderia usar async/await ao invés de promises?",
            lineNumber: 15,
            createdAt: "2024-01-15T16:45:00Z",
            updatedAt: "2024-01-15T16:45:00Z",
            author: {
              id: "user2",
              username: "js_carlos",
              firstName: "Carlos",
              lastName: "Santos",
            },
          },
        ]);
      } catch (err) {
        console.error("Erro ao buscar snippet:", err);
        setError("Erro de conexão. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippetData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  // Submeter novo review/comentário
  const onSubmit = async (data: ReviewFormData) => {
    try {
      // Mock - substituir por API real
      const newReview: Review = {
        id: Date.now().toString(),
        content: data.content,
        lineNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user!.id,
          username: user!.username,
          firstName: user!.firstName || "",
          lastName: user!.lastName || "",
        },
      };

      setReviews([...reviews, newReview]);
      reset();
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    }
  };

  // Copiar código para clipboard
  const copyToClipboard = async () => {
    if (!snippet) return;

    try {
      await navigator.clipboard.writeText(snippet.content);
      // Idealmente mostrar toast de sucesso aqui
      console.log("Código copiado!");
    } catch (err) {
      console.error("Erro ao copiar código:", err);
    }
  };

  if (isLoading) {
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
          <p className="text-gray-600">Carregando snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <div className="text-6xl">❌</div>
          <p className="text-xl text-gray-700 text-center">
            {error || "Snippet não encontrado"}
          </p>
          <Link to="/dashboard">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between w-full flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-md ${
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
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getLanguageDisplayName(snippet.language)}
                </span>

                {snippet.isPublic && (
                  <span className="inline-flex px-3 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800">
                    Público
                  </span>
                )}

                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex px-3 py-1 text-sm font-medium rounded-md bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                {snippet.title}
              </h1>

              {snippet.description && (
                <p className="text-gray-600 text-lg max-w-4xl">
                  {snippet.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                📋 Copiar
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Code Display */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
          <SyntaxHighlighter
            language={snippet.language}
            style={oneDark}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              background: "transparent",
            }}
          >
            {snippet.content}
          </SyntaxHighlighter>
        </div>

        {/* Meta Information */}
        <div className="flex justify-between items-center py-4 border-t border-gray-200">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700">
              Por {snippet.author.firstName} {snippet.author.lastName} (@
              {snippet.author.username})
            </p>
            <p className="text-xs text-gray-500">
              Criado em {formatDate(snippet.createdAt)}
              {snippet.updatedAt !== snippet.createdAt &&
                ` • Atualizado em ${formatDate(snippet.updatedAt)}`}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
              </svg>
              <span className="text-sm text-gray-500">{snippet.views}</span>
            </div>

            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
              </svg>
              <span className="text-sm text-gray-500">{snippet.likes}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Comentários ({reviews.length})
          </h2>

          {/* Add Comment Form */}
          {user && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6"
            >
              <div className="space-y-4">
                <textarea
                  {...register("content")}
                  placeholder="Escreva seu comentário sobre este snippet..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm">
                    {errors.content.message}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {watch("content")?.length || 0}/500 caracteres
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {isSubmitting ? "Enviando..." : "Adicionar Comentário"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">
                Seja o primeiro a comentar sobre este snippet!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.author.firstName} {review.author.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{review.author.username} •{" "}
                        {formatDate(review.createdAt)}
                      </p>
                    </div>

                    {review.lineNumber && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        Linha {review.lineNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetailPage;
