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
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  count: number;
}

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário é obrigatório")
    .min(10, "Comentário deve ter pelo menos 10 caracteres")
    .max(1000, "Comentário não pode ter mais de 1000 caracteres"),
  lineNumber: z
    .number()
    .int()
    .min(1, "Número da linha deve ser maior que 0")
    .optional()
    .nullable(),
});

type CommentFormData = z.infer<typeof commentSchema>;

/**
 * Página de Detalhes do Snippet
 * Exibe um snippet específico com syntax highlighting e sistema de comentários
 */
const SnippetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      lineNumber: null,
    },
    mode: "onChange",
  });

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) {
        setError("ID do snippet não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        const response = await snippetAPI.getById(id);

        if (response.data.success) {
          setSnippet(response.data.data.snippet);
        } else {
          setError(response.data.message || "Snippet não encontrado");
        }
      } catch (error: any) {
        console.error("Erro ao carregar snippet:", error);
        setError(error.response?.data?.message || "Erro ao carregar snippet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  // Fetch reviews/comments
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setIsLoadingReviews(true);
        // For now, we'll simulate the reviews API call
        // In production, this would be: const response = await api.get(`/snippets/${id}/reviews`);

        // Mock data for demonstration
        const mockReviews: Review[] = [
          {
            id: "1",
            content:
              "Excelente exemplo! Muito bem estruturado e fácil de entender.",
            lineNumber: null,
            createdAt: "2024-01-15T14:30:00Z",
            updatedAt: "2024-01-15T14:30:00Z",
            author: {
              id: "2",
              username: "dev_maria",
              firstName: "Maria",
              lastName: "Silva",
              avatar: null,
            },
          },
          {
            id: "2",
            content:
              "Sugiro usar const ao invés de let nesta linha para melhor performance.",
            lineNumber: 15,
            createdAt: "2024-01-15T16:45:00Z",
            updatedAt: "2024-01-15T16:45:00Z",
            author: {
              id: "3",
              username: "code_reviewer",
              firstName: "João",
              lastName: "Santos",
              avatar: null,
            },
          },
        ];

        setReviews(mockReviews);
      } catch (error: any) {
        console.error("Erro ao carregar comentários:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Handle comment submission
  const onSubmitComment = async (data: CommentFormData) => {
    if (!user || !snippet) {
      console.log("Usuário deve estar logado para comentar");
      return;
    }

    try {
      setIsSubmittingComment(true);

      // In production, this would be:
      // const response = await api.post(`/snippets/${snippet.id}/reviews`, data);

      // Mock successful submission
      const newReview: Review = {
        id: Date.now().toString(),
        content: data.content,
        lineNumber: data.lineNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user.id,
          username: user.username,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          avatar: null,
        },
      };

      setReviews((prev) => [newReview, ...prev]);
      reset();

      console.log("Comentário adicionado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
    };
    return colors[language.toLowerCase()] || "gray";
  };

  const copyToClipboard = async () => {
    if (snippet?.content) {
      try {
        await navigator.clipboard.writeText(snippet.content);
        console.log("Código copiado para a área de transferência!");
      } catch (err) {
        console.error("Erro ao copiar código:", err);
      }
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
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-sm font-medium`}
                  style={{
                    backgroundColor: `${getLanguageColor(snippet.language)}20`,
                    color: getLanguageColor(snippet.language),
                  }}
                >
                  {getLanguageDisplayName(snippet.language)}
                </span>

                {snippet.isPublic && (
                  <span className="px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    Público
                  </span>
                )}

                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-sm font-medium border border-gray-300 text-gray-700"
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

            <div className="flex flex-row gap-2">
              <button
                className="border border-gray-300 rounded-md px-4 py-2 text-lg hover:bg-gray-100 transition"
                onClick={copyToClipboard}
              >
                📋
              </button>

              {user?.id === snippet.authorId && (
                <button className="border border-gray-300 rounded-md px-4 py-2 text-lg hover:bg-gray-100 transition">
                  Editar
                </button>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div className="flex flex-row gap-3 py-2 items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {(snippet.author.firstName && snippet.author.lastName
                ? `${snippet.author.firstName} ${snippet.author.lastName}`
                : snippet.author.username
              )
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex flex-col gap-0">
              <span className="font-medium text-gray-800">
                {snippet.author.firstName && snippet.author.lastName
                  ? `${snippet.author.firstName} ${snippet.author.lastName}`
                  : snippet.author.username}
              </span>
              <span className="text-sm text-gray-500">
                Criado em {formatDate(snippet.createdAt)}
                {snippet.updatedAt !== snippet.createdAt &&
                  ` • Atualizado em ${formatDate(snippet.updatedAt)}`}
              </span>
            </div>

            <div className="flex flex-row gap-4 ml-auto">
              <div className="flex flex-row gap-1 items-center">
                <span>👁️</span>
                <span className="text-sm text-gray-500">{snippet.views}</span>
              </div>
              <div className="flex flex-row gap-1 items-center">
                <span>❤️</span>
                <span className="text-sm text-gray-500">{snippet.likes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Section */}
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <div className="flex flex-row justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex flex-row gap-3 items-center">
              <span className="text-gray-300 text-sm font-medium">
                {getLanguageDisplayName(snippet.language)}
              </span>
              <span className="text-gray-500 text-xs">
                {snippet.content.split("\n").length} linhas
              </span>
            </div>
            <button
              className="text-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-700 transition"
              onClick={copyToClipboard}
            >
              📋 Copiar
            </button>
          </div>
          <div className="overflow-auto max-h-[600px]">
            <SyntaxHighlighter
              language={snippet.language}
              style={oneDark}
              showLineNumbers
              customStyle={{
                margin: 0,
                background: "transparent",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
              lineNumberStyle={{
                color: "#6b7280",
                backgroundColor: "transparent",
                paddingRight: "1rem",
                minWidth: "3rem",
                textAlign: "right",
              }}
            >
              {snippet.content}
            </SyntaxHighlighter>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Comments Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Comentários ({reviews.length})
            </h2>
          </div>

          {/* Add Comment Form (only for logged users) */}
          {user && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmitComment)}
              >
                <div className="flex flex-row gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                    {(user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                    )
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm font-medium text-gray-700">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      Adicionar comentário
                    </span>
                  </div>
                </div>

                <textarea
                  {...register("content")}
                  placeholder="Escreva seu comentário sobre este snippet..."
                  rows={4}
                  className="bg-gray-50 border border-gray-300 rounded-md p-2 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-vertical"
                />
                {errors.content && (
                  <span className="text-red-500 text-sm">
                    {errors.content.message}
                  </span>
                )}

                <div className="flex flex-row justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Opcionalmente, especifique um número de linha para
                    comentários específicos
                  </span>
                  <input
                    type="number"
                    {...register("lineNumber", { valueAsNumber: true })}
                    min={1}
                    placeholder="Linha"
                    className="border border-gray-300 rounded-md px-2 py-1 w-24 text-sm"
                  />
                  <div className="flex flex-row gap-3">
                    <button
                      type="button"
                      className="border border-gray-300 rounded-md px-4 py-1 text-sm hover:bg-gray-100 transition"
                      onClick={() => reset()}
                      disabled={isSubmittingComment}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1 rounded-md text-sm transition ${
                        (!isValid || isSubmittingComment) &&
                        "opacity-60 cursor-not-allowed"
                      }`}
                      disabled={!isValid || isSubmittingComment}
                    >
                      {isSubmittingComment ? "Enviando..." : "Comentar"}
                    </button>
                  </div>
                </div>
                {errors.lineNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.lineNumber.message}
                  </span>
                )}
              </form>
            </div>
          )}

          {/* Comments List */}
          {isLoadingReviews ? (
            <div className="flex flex-col gap-4 py-8 items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
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
              <span className="text-gray-600">Carregando comentários...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
              <div className="flex flex-col gap-3 items-center">
                <span className="text-6xl">💬</span>
                <span className="text-lg font-medium text-gray-600">
                  Nenhum comentário ainda
                </span>
                <span className="text-gray-500 text-center">
                  {user
                    ? "Seja o primeiro a comentar sobre este snippet!"
                    : "Faça login para adicionar comentários."}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex flex-row gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {(review.author.firstName && review.author.lastName
                        ? `${review.author.firstName} ${review.author.lastName}`
                        : review.author.username
                      )
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-col gap-0">
                          <span className="font-medium text-gray-800">
                            {review.author.firstName && review.author.lastName
                              ? `${review.author.firstName} ${review.author.lastName}`
                              : review.author.username}
                          </span>
                          <div className="flex flex-row gap-2 items-center">
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                            {review.lineNumber && (
                              <>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-blue-600">
                                  Linha {review.lineNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-700 leading-relaxed">
                        {review.content}
                      </span>
                    </div>
                  </div>
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
