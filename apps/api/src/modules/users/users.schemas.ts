import { z } from "zod";

export const listUsersSchema = z.object({
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
