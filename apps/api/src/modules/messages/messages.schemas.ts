import { z } from "zod";

export const conversationIdSchema = z.object({
  conversationId: z.string().uuid("ID de conversación inválido"),
});

export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(5000, "El mensaje no puede superar los 5000 caracteres"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

