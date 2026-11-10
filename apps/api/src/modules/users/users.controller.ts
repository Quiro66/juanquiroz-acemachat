import type { Request, Response } from "express";
import { listUsersSchema } from "./users.schemas";
import { listUsers } from "./users.service";

export async function getUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = listUsersSchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Parámetros de búsqueda inválidos",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = res.locals.userId as string;

    const result = await listUsers({
      ...validation.data,
      currentUserId,
    });

    res.status(200).json({
      success: true,
      message: "Usuarios obtenidos correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}
