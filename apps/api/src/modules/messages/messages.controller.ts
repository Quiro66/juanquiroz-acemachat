import type { Request, Response } from "express";
import {
  conversationIdSchema,
  createMessageSchema,
} from "./messages.schemas";
import {
  createMessage,
  listMessages,
} from "./messages.service";

export async function getMessages(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = conversationIdSchema.safeParse(req.params);

    if (!params.success) {
      res.status(400).json({
        success: false,
        message: "ID de conversación inválido",
      });
      return;
    }

    const currentUserId = res.locals.userId as string;

    const messages = await listMessages({
      conversationId: params.data.conversationId,
      currentUserId,
    });

    res.status(200).json({
      success: true,
      message: "Mensajes obtenidos correctamente",
      data: messages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONVERSATION_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Conversación no encontrada",
      });
      return;
    }

    console.error("Error al obtener mensajes:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}

export async function postMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = conversationIdSchema.safeParse(req.params);
    const body = createMessageSchema.safeParse(req.body);

    if (!params.success || !body.success) {
      res.status(400).json({
        success: false,
        message: "Datos del mensaje inválidos",
        errors: !body.success
          ? body.error.flatten().fieldErrors
          : undefined,
      });
      return;
    }

    const currentUserId = res.locals.userId as string;

    const message = await createMessage({
      conversationId: params.data.conversationId,
      currentUserId,
      input: body.data,
    });

    res.status(201).json({
      success: true,
      message: "Mensaje enviado correctamente",
      data: message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONVERSATION_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Conversación no encontrada",
      });
      return;
    }

    console.error("Error al enviar mensaje:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}
