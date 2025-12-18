import { z } from "zod";

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First Name must be at least 2 characters")
      .max(20, "First Name must be less than 20 characters")
      .regex(/^[A-Za-z]+$/, "First Name must contain only letters"),

    lastName: z
      .string()
      .min(2, "Last Name must be at least 2 characters")
      .max(20, "Last Name must be less than 20 characters")
      .regex(/^[A-Za-z]+$/, "Last Name must contain only letters"),

    email: z.string().email("Invalid email format"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!"#$%&()*,.:<>?@^{|}]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters"),

    currency: z.string().length(3).optional(),
    company_name: z.string().max(255).nullable().optional().or(z.literal("")),
    address: z.string().nullable().optional().or(z.literal("")),
    tax_id: z.string().max(50).nullable().optional().or(z.literal("")),
    logo_url: z.string().url().max(500).nullable().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"] // or you can target both firstName and lastName
  })
  .refine((data) => data.firstName !== data.lastName, {
    message: "First name and last name must be different",
    path: ["lastName"] // or you can target both firstName and lastName
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be less than 20 characters")
});
export const emailSchema = z.object({
  email: z.string().email("Invalid email format")
});

export const forgetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!"#$%&()*,.:<>?@^{|}]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"] // or you can target both firstName and lastName
  });

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(20, "Title must be less than 20 characters"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(150, "Description must be less than 150 characters")
});

export const createRawDatasetSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(20, "name must be less than 20 characters"),

  resources: z.array(z.string())
});

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" }),
    resources: z
    .string()
    .nonempty({ message: "At least one resource must be selected" }),

  numberQuestions: z.number().int().positive({ message: "Number of questions must be a positive integer" }),

});


export const createStructuredDatasetSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(20, "name must be less than 20 characters"),

  process: z.array(z.string()),

  structure: z.array(z.string()),

  rDatasets: z.array(z.string())
});

export const createResourceSchema = z.object({
    name: z.string().min(1, { message: "Please enter a name." }),
    type: z.string().min(1, { message: "Please select a type." }),
    path: z.union([
      // Option 1: A File instance (only if File is defined)
      typeof File !== "undefined"
        ? z.instanceof(File).refine(
            (file) => !!file, // Ensure a File object is provided
            {
              message: "Please select a file."
            }
          )
        : z.never(), // This prevents the validation from using File when it’s not available
      // Option 2: A valid URL
      z
        .string()
        .url({ message: "Please provide a valid link." }) // Must be a valid URL if entered
        .min(1, { message: "Please enter a link." }),
      // Option 3: A normal text input
      z.string().min(1, { message: "Please enter some text." }) // Ensure the string has some content
    ])
  });


export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const datePart = date.toISOString().split("T")[0];
  const timePart = date.toISOString().split("T")[1].split(".")[0];
  return `${datePart} | ${timePart}`;
}

export function getMonthFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const month = date.toLocaleString('default', { month: 'short' }); // 'short' returns 3-letter month name
    return month;
  }

export const userRegisterAPI = "http://localhost:5000/auth/register";
export const userLogInAPI = "http://localhost:5000/auth/login";

export const projectCreateAPI = "/api/project/createProjectRoute";
export const projectExistsAPI = "/api/project/projectExistsRoute";
export const getprojectsAPI = "/api/project/getProjectsRoute";

export const ResourceExistsAPI = "/api/resource/resourceExistsRoute";
export const ResourceCreateAPI = "/api/resource/resourceCreateRoute";
export const getResourcesAPI = "/api/resource/getResourcesRoute";
export const getResourceByIdAPI = "/api/resource/getResourceByIdRoute";

export const rawDatasetCreateAPI = "/api/dataset/rawDataset/createDatasetRoute";
export const rawDatasetExistsAPI = "/api/dataset/rawDataset/datasetExistsRoute";
export const getRawDatasetsAPI = "/api/dataset/rawDataset/getDatasetsRoute";

export const structuredDatasetCreateAPI =
  "/api/dataset/structuredDataset/createDatasetRoute";
export const structuredDatasetExistsAPI =
  "/api/dataset/structuredDataset/datasetExistsRoute";
export const getStructuredDatasetsAPI =
  "/api/dataset/structuredDataset/getDatasetsRoute";

  export const QuizExistsAPI = "/api/quiz/quizExistsRoute";
export const QuizCreateAPI = "/api/quiz/quizCreateRoute";
export const getQuizzesAPI = "/api/quiz/getQuizzesRoute";

export const getNotificationAPI = "/api/notification/getNotificationsRoute";
export const GOOGLE_SCRIPT_URL ="https://script.google.com/macros/s/AKfycbzXnzIR3nKCs8mvrFXeukXiwo0-dGzASjPiTsqMDq9ERHraiNQ8Cm48Mz5Z_n2bLZGo/exec"
export const API_URL = "https://api.mistral.ai/v1/chat/completions";
export const API_KEY = "RmdaJpXJSAkT4bv7WEi1YoR4ddmAH7wV";
