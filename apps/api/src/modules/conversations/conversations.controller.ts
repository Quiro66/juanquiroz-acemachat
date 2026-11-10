
import type { Request, Response } from "express";
import type { Server } from "socket.io";

import { createConversationSchema } from "./conversations.schemas";
import {
  createConversation,
  listConversations,
} from "./conversations.service";

export async function postConversation(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = createConversationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Datos de la conversación inválidos",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = res.locals.userId as string;

    const result = await createConversation({
      currentUserId,
      input: validation.data,
    });

    const { conversation, created } = result;

    // Notificar a los participantes solamente si es nueva.
    if (created) {
      const io = req.app.get("io") as Server;

      for (const participant of conversation.participants) {
        io.to(`user:${participant.user.id}`).emit("conversation:new", {
          conversationId: conversation.id,
        });
      }
    }

    res.status(created ? 201 : 200).json({
      success: true,
      message: created
        ? "Conversación creada correctamente"
        : "La conversación ya existía",
      data: conversation,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, { status: number; message: string }> = {
        PARTICIPANT_NOT_FOUND: {
          status: 404,
          message: "Uno o más participantes no existen",
        },
        GROUP_TITLE_REQUIRED: {
          status: 400,
          message: "El grupo necesita un nombre",
        },
        DIRECT_CONVERSATION_CANNOT_HAVE_TITLE: {
          status: 400,
          message: "Una conversación directa no puede tener nombre",
        },
      };

      const knownError = messages[error.message];

      if (knownError) {
        res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
        return;
      }
    }

    console.error("Error al crear conversación:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}

export async function getConversations(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const currentUserId = res.locals.userId as string;

    const conversations = await listConversations(currentUserId);

    res.status(200).json({
      success: true,
      message: "Conversaciones obtenidas correctamente",
      data: conversations,
    });
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}
