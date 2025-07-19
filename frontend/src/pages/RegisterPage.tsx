import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthAPI, useAuth } from "../store";
import { registerSchema, type RegisterFormData } from "../schemas/authSchema";

/**
 * Página de Registro
 * Permite que novos usuários criem uma conta
 */
const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { registerWithAPI } = useAuthAPI();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Usuário já está logado, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerWithAPI({
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
      });

      if (result.success) {
        console.log("Registro realizado com sucesso!", result.user);
        navigate("/dashboard", { replace: true });
      } else {
        setError("root", {
          message: result.error || "Erro no registro",
        });
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("root", {
        message: "Erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">CodeCollab</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Criar Conta
          </h2>
          <p className="text-gray-500">
            Junte-se à comunidade de desenvolvedores
          </p>
        </div>

        {/* Register Form */}
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className="w-full">
              <label
                htmlFor="username"
                className="block mb-2 font-medium text-gray-700"
              >
                Username *
              </label>
              <input
                id="username"
                type="text"
                placeholder="meuusername"
                {...register("username")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* First Name Field */}
            <div className="w-full">
              <label
                htmlFor="firstName"
                className="block mb-2 font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Seu nome"
                {...register("firstName")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="w-full">
              <label
                htmlFor="lastName"
                className="block mb-2 font-medium text-gray-700"
              >
                Sobrenome
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Seu sobrenome"
                {...register("lastName")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="w-full">
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-gray-700"
              >
                Senha *
              </label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="w-full">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium text-gray-700"
              >
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                {...register("confirmPassword")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Root Error Message */}
            {errors.root && (
              <div className="w-full p-3 bg-red-50 border border-red-300 rounded-md">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm text-center">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:text-blue-500 transition-colors"
          >
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
