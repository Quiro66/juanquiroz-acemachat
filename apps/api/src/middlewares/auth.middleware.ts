
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: "No estás autenticado",
    });
    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Formato de autenticación inválido",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET no está configurado");

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Token inválido",
      });
      return;
    }

    res.locals.userId = decoded.sub;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "La sesión ha expirado",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Token inválido o no autorizado",
    });
  }
}
