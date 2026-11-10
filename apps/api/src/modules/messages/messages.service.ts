import { prisma } from "../../config/prisma";
import type { CreateMessageInput } from "./messages.schemas";

interface MessageParams {
  conversationId: string;
  currentUserId: string;
}

interface CreateMessageParams extends MessageParams {
  input: CreateMessageInput;
}

export async function listMessages({
  conversationId,
  currentUserId,
}: MessageParams) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: currentUserId,
        conversationId,
      },
    },
  });

  if (!participant) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  return prisma.message.findMany({
    where: {
      conversationId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 100,
  });
}

export async function createMessage({
  conversationId,
  currentUserId,
  input,
}: CreateMessageParams) {
  return prisma.$transaction(async (tx) => {
    const participant = await tx.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: currentUserId,
          conversationId,
        },
      },
    });

    if (!participant) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const message = await tx.message.create({
      data: {
        content: input.content,
        conversationId,
        userId: currentUserId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await tx.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  });
}
