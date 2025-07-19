import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../store";
import {
  LANGUAGE_CATEGORIES,
  getLanguageDisplayName,
} from "../schemas/snippetSchema";

// Form data type
interface SnippetFormData {
  title: string;
  content: string;
  language: string;
  description?: string;
  tags: string;
  isPublic: boolean;
}

/**
 * Página de Criação/Submissão de Snippet
 * Permite ao usuário criar um novo code snippet usando Tailwind CSS
 */
const SubmitSnippetPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SnippetFormData>({
    defaultValues: {
      title: "",
      content: "",
      language: "javascript",
      description: "",
      tags: "",
      isPublic: true,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SnippetFormData) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Processar tags
      const processedData = {
        ...data,
        tags: data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      // Em produção, usar snippetAPI.create(processedData)
      console.log("Criando snippet:", processedData);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simular sucesso
      alert("Snippet criado com sucesso!");
      reset();
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao criar snippet:", error);
      alert("Erro ao criar snippet. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar linguagens por categoria
  const groupedLanguages = Object.entries(LANGUAGE_CATEGORIES).reduce(
    (acc, [category, languages]) => {
      acc[category] = [...languages]; // Convert readonly array to mutable
      return acc;
    },
    {} as Record<string, string[]>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para criar snippets.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Novo Snippet
          </h1>
          <p className="text-gray-600">
            Compartilhe seu código com a comunidade CodeCollab
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-md p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título *
            </label>
            <input
              id="title"
              type="text"
              {...register("title", {
                required: "Título é obrigatório",
                minLength: {
                  value: 3,
                  message: "Título deve ter pelo menos 3 caracteres",
                },
                maxLength: {
                  value: 100,
                  message: "Título não pode ter mais de 100 caracteres",
                },
              })}
              disabled={isSubmitting}
              placeholder="Ex: React Custom Hook para validação"
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.title
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Linguagem *
            </label>
            <select
              id="language"
              {...register("language", {
                required: "Selecione uma linguagem",
              })}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.language
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            >
              {Object.entries(groupedLanguages).map(([category, languages]) => (
                <optgroup key={category} label={category}>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageDisplayName(lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Código *
            </label>
            <textarea
              id="content"
              {...register("content", {
                required: "Código é obrigatório",
                minLength: {
                  value: 10,
                  message: "Código deve ter pelo menos 10 caracteres",
                },
                maxLength: {
                  value: 10000,
                  message: "Código não pode ter mais de 10.000 caracteres",
                },
              })}
              disabled={isSubmitting}
              placeholder="Cole ou digite seu código aqui..."
              rows={12}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm resize-y ${
                errors.content
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Descrição não pode ter mais de 500 caracteres",
                },
              })}
              disabled={isSubmitting}
              placeholder="Descreva o que este código faz, como usar, etc."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y ${
                errors.description
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags (opcional)
            </label>
            <input
              id="tags"
              type="text"
              {...register("tags", {
                validate: (value) => {
                  if (!value) return true;
                  const tags = value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  if (tags.length > 10) {
                    return "Máximo de 10 tags permitidas";
                  }
                  for (const tag of tags) {
                    if (tag.length > 30) {
                      return "Cada tag deve ter no máximo 30 caracteres";
                    }
                    if (!/^[a-zA-Z0-9\-_]+$/.test(tag)) {
                      return "Tags devem conter apenas letras, números, hífens e underscore";
                    }
                  }
                  return true;
                },
              })}
              disabled={isSubmitting}
              placeholder="react, hooks, validation, form (separadas por vírgula)"
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.tags
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separe as tags por vírgula (máximo 10 tags)
            </p>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>

          {/* Public/Private Toggle */}
          <div>
            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                {...register("isPublic")}
                disabled={isSubmitting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
              />
              <label
                htmlFor="isPublic"
                className="ml-2 block text-sm text-gray-900"
              >
                <span className="font-medium">Tornar público</span>
                <span className="block text-xs text-gray-500">
                  Snippets públicos podem ser vistos e curtidos por outros
                  usuários
                </span>
              </label>
            </div>
            {errors.isPublic && (
              <p className="mt-1 text-sm text-red-600">
                {errors.isPublic.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              )}
              <span>{isSubmitting ? "Criando..." : "Criar Snippet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitSnippetPage;
