import prisma from "@/lib/prisma";
import { triggerEvent } from "@/lib/pusher";

export interface NotifyInput {
  recipientId: string;
  actorId?: string | null;
  type: string; // friend_request, friend_accept, message, reaction, comment
  entityType?: string | null;
  entityId?: string | null;
  titleAr: string;
  titleEn: string;
  bodyAr?: string | null;
  bodyEn?: string | null;
}

// Create a persisted notification and deliver a realtime event to the user
// channel. Notification creation is best-effort: failures are logged but never
// block the primary operation (sending a message, accepting a friend...).
export async function notifyMember(input: NotifyInput): Promise<string | null> {
  try {
    const notif = await prisma.userNotification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId ?? null,
        type: input.type,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        titleAr: input.titleAr,
        titleEn: input.titleEn,
        bodyAr: input.bodyAr ?? null,
        bodyEn: input.bodyEn ?? null,
      },
    });
    await triggerEvent(`private-user-${input.recipientId}`, "notification:new", {
      notification: {
        id: notif.id,
        type: notif.type,
        titleAr: notif.titleAr,
        titleEn: notif.titleEn,
        bodyAr: notif.bodyAr,
        bodyEn: notif.bodyEn,
        entityType: notif.entityType,
        entityId: notif.entityId,
        isRead: notif.isRead,
        createdAt: notif.createdAt.toISOString(),
      },
    });
    return notif.id;
  } catch (e) {
    console.error("notifyMember failed", e);
    return null;
  }
}

// Tell each participant of a conversation that something changed (badge update,
// list refresh). Payload is intentionally light.
export async function notifyConversationParticipants(
  conversationId: string,
  participantIds: string[],
  payload: Omit<
    {
      conversationId: string;
      event: "new-message" | "read" | "participants" | "typing";
      preview?: string;
      senderName?: string;
      senderId?: string;
      conversationName?: string;
    },
    "conversationId"
  >
): Promise<void> {
  await Promise.all(
    participantIds.map((memberId) =>
      triggerEvent(`private-user-${memberId}`, "conversation:update", {
        conversationId,
        ...payload,
      })
    )
  );
}