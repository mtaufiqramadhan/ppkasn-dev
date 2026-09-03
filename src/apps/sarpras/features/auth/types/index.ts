import { type LoginInput } from "../schemas/login-schema";

export type { LoginInput };

export type LoginState = {
  error?: string;
  email?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
} | null;

export type LoginErrors = {
  email?: string[];
  password?: string[];
};
