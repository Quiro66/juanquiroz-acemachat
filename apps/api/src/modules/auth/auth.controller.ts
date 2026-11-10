import type { Request, Response } from "express";
import { registerSchema } from "./auth.schemas";
import { registerUser } from "./auth.service";
import { loginSchema } from "./auth.schemas";
import { loginUser } from "./auth.service";
import { prisma } from "../../config/prisma";

export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Los datos enviados no son válidos",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  try {
    const user = await registerUser(validation.data);

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        success: false,
        message: "Ya existe una cuenta con ese correo electrónico",
      });

      return;
    }

    console.error("Error al registrar usuario:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Los datos enviados no son válidos",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  try {
    const result = await loginUser(validation.data);

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        success: false,
        message: "Correo electrónico o contraseña incorrectos",
      });

      return;
    }

    console.error("Error al iniciar sesión:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}


export async function getMe(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = res.locals.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "La sesión ya no es válida",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Usuario autenticado correctamente",
      data: user,
    });
  } catch (error) {
    console.error("Error al consultar el usuario:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}
