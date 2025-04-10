import { z } from "zod";
 
export const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(2),
});

export const signupSchema = z.object({
 email: z.string().email(),
 password: z.string().min(2),
 confirm_password: z.string().min(2),
}).superRefine(({ password, confirm_password }, ctx) => {
  if (password != confirm_password) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ['confirmPassword']
    });
  }
});
 
export type LoginSchema = typeof loginSchema;
export type SignupSchema = typeof signupSchema;
