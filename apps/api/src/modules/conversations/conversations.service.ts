
import { prisma } from "../../config/prisma";
import type { CreateConversationInput } from "./conversations.schemas";

interface CreateConversationParams {
  currentUserId: string;
  input: CreateConversationInput;
}

export async function createConversation({
  currentUserId,
  input,
}: CreateConversationParams) {
  const participantIds = [
    ...new Set([currentUserId, ...input.participantIds]),
  ];

  const isGroup = participantIds.length > 2;

  if (!isGroup && input.title) {
    throw new Error("DIRECT_CONVERSATION_CANNOT_HAVE_TITLE");
  }

  if (isGroup && !input.title) {
    throw new Error("GROUP_TITLE_REQUIRED");
  }

  return prisma.$transaction(async (tx) => {
    const existingUsers = await tx.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUsers.length !== participantIds.length) {
      throw new Error("PARTICIPANT_NOT_FOUND");
    }

    // Evitar conversaciones directas duplicadas.
    if (!isGroup) {
      const existingConversation = await tx.conversation.findFirst({
        where: {
          isGroup: false,
          AND: participantIds.map((userId) => ({
            participants: {
              some: {
                userId,
              },
            },
          })),
        },
        include: {
          participants: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (existingConversation) {
        const existingIds = existingConversation.participants.map(
          (participant) => participant.user.id,
        );

        if (
          existingIds.length === 2 &&
          participantIds.every((id) => existingIds.includes(id))
        ) {
          return {
            conversation: existingConversation,
            created: false,
          };
        }
      }
    }

    const conversation = await tx.conversation.create({
      data: {
        title: isGroup ? input.title : null,
        isGroup,
        participants: {
          create: participantIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      conversation,
      created: true,
    };
  });
}

export async function listConversations(currentUserId: string) {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: currentUserId,
        },
      },
    },
    include: {
      participants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
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
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
