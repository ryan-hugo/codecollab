import { z } from "zod";

// Programming languages for validation
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "dart",
  "scala",
  "r",
  "matlab",
  "perl",
  "shell",
  "bash",
  "powershell",
  "html",
  "css",
  "scss",
  "sass",
  "less",
  "json",
  "xml",
  "yaml",
  "toml",
  "ini",
  "sql",
  "mongodb",
  "graphql",
  "dockerfile",
  "nginx",
  "apache",
  "react",
  "vue",
  "angular",
  "svelte",
  "nodejs",
  "express",
  "nextjs",
  "nuxt",
  "gatsby",
  "other",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Schema for creating a new snippet
export const createSnippetSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título não pode ter mais de 100 caracteres")
    .trim(),

  description: z
    .string()
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),

  content: z
    .string()
    .min(1, "Conteúdo do código é obrigatório")
    .min(10, "Código deve ter pelo menos 10 caracteres")
    .max(50000, "Código não pode ter mais de 50.000 caracteres"),

  language: z
    .enum(SUPPORTED_LANGUAGES)
    .refine((val) => SUPPORTED_LANGUAGES.includes(val as SupportedLanguage), {
      message: "Selecione uma linguagem válida",
    }),

  tags: z
    .array(
      z
        .string()
        .min(1, "Tag não pode estar vazia")
        .max(30, "Tag não pode ter mais de 30 caracteres")
        .regex(
          /^[a-zA-Z0-9\-_]+$/,
          "Tag deve conter apenas letras, números, hífens e underscore"
        )
    )
    .max(10, "Máximo de 10 tags permitidas")
    .optional()
    .default([]),

  isPublic: z.boolean().default(true),
});

export type CreateSnippetFormData = z.infer<typeof createSnippetSchema>;

// Schema for updating an existing snippet
export const updateSnippetSchema = createSnippetSchema.partial();

export type UpdateSnippetFormData = z.infer<typeof updateSnippetSchema>;

// Helper function to get language display name
export const getLanguageDisplayName = (language: string): string => {
  const languageNames: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    swift: "Swift",
    kotlin: "Kotlin",
    dart: "Dart",
    scala: "Scala",
    r: "R",
    matlab: "MATLAB",
    perl: "Perl",
    shell: "Shell",
    bash: "Bash",
    powershell: "PowerShell",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",
    less: "Less",
    json: "JSON",
    xml: "XML",
    yaml: "YAML",
    toml: "TOML",
    ini: "INI",
    sql: "SQL",
    mongodb: "MongoDB",
    graphql: "GraphQL",
    dockerfile: "Dockerfile",
    nginx: "Nginx",
    apache: "Apache",
    react: "React",
    vue: "Vue.js",
    angular: "Angular",
    svelte: "Svelte",
    nodejs: "Node.js",
    express: "Express.js",
    nextjs: "Next.js",
    nuxt: "Nuxt.js",
    gatsby: "Gatsby",
    other: "Outro",
  };

  return languageNames[language] || language;
};

// Common language categories for better UX
export const LANGUAGE_CATEGORIES = {
  "Frontend Web": ["html", "css", "scss", "sass", "less", "javascript", "typescript", "react", "vue", "angular", "svelte"],
  "Backend": ["nodejs", "express", "python", "java", "go", "rust", "php", "ruby", "csharp"],
  "Mobile": ["swift", "kotlin", "dart", "react"],
  "Data & Analytics": ["python", "r", "sql", "matlab", "mongodb"],
  "DevOps & Config": ["dockerfile", "nginx", "apache", "yaml", "toml", "ini", "shell", "bash", "powershell"],
  "Frameworks": ["nextjs", "nuxt", "gatsby", "express"],
  "Outros": ["c", "cpp", "scala", "perl", "json", "xml", "graphql", "other"],
} as const;
