interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Componente LoadingSpinner
 * Exibe um spinner de carregamento com mensagem opcional
 */
const LoadingSpinner = ({ message = "Carregando..." }: LoadingSpinnerProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "1rem",
        backgroundColor: "#f7fafc",
      }}
    >
      {/* CSS Spinner */}
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #3182ce",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <div
        style={{
          fontSize: "16px",
          color: "#4a5568",
          fontWeight: "500",
        }}
      >
        {message}
      </div>

      {/* CSS Animation - pode ser movido para um arquivo CSS separado */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
