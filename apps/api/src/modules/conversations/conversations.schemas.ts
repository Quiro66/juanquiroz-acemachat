import { z } from "zod";

export const createConversationSchema = z.object({
  participantIds: z
    .array(z.string().uuid("ID de usuario inválido"))
    .min(1, "Debes seleccionar al menos un participante")
    .max(49, "No puedes agregar más de 49 participantes")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "No puedes agregar participantes duplicados",
    ),
  title: z
    .string()
    .trim()
    .min(1, "El nombre del grupo no puede estar vacío")
    .max(100, "El nombre del grupo es demasiado largo")
    .optional(),
});

export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>;
