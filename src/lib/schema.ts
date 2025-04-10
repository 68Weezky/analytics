import { z } from "zod";
 
export const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(2),
});
export const signupSchema = z.object({
 email: z.string().email(),
 password: z.string().min(2),
 confirm_password: z.string().min(2),
});
 
export type LoginSchema = typeof loginSchema;
