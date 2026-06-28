import prisma from "./prisma";

interface CreateNotificationParams {
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type?: "info" | "success" | "warning" | "error";
  entityType?: string;
  entityId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        titleAr: params.titleAr,
        titleEn: params.titleEn,
        messageAr: params.messageAr,
        messageEn: params.messageEn,
        type: params.type || "info",
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        isGlobal: true,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUnreadCount() {
  try {
    return await prisma.notification.count({
      where: { isRead: false },
    });
  } catch {
    return 0;
  }
}
