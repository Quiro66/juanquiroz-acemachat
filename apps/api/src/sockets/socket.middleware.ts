import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

export function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void,
): void {
  const token = socket.handshake.auth?.token;

  if (typeof token !== "string" || !token) {
    next(new Error("No estás autenticado"));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET no está configurado");
    next(new Error("Error interno de autenticación"));
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
      next(new Error("Token inválido"));
      return;
    }

    // Guardamos la identidad autenticada en el socket.
    socket.data.userId = decoded.sub;

    next();
  } catch {
    next(new Error("Token inválido o expirado"));
  }
}
