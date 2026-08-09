import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type SignUpFormSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SignInFormSchema = z.infer<typeof signInSchema>;

export const codeSchema = z.object({
  code: z.string().min(1, { message: "Enter the verification code sent on your mail." }),
});

export type CodeFormSchema = z.infer<typeof codeSchema>;
