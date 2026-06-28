import prisma from "./prisma";

interface AuditLogParams {
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  entity?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const where: any = {};
  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = filters.action;
  if (filters?.entity) where.entity = filters.entity;
  if (filters?.from || filters?.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pages: Math.ceil(total / limit) };
}

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
  });
  if (!user) return null;

  const [totalActions, actionCounts, entityCounts, lastLogins, recentLogs, member] = await Promise.all([
    prisma.auditLog.count({ where: { userId } }),
    prisma.auditLog.groupBy({ by: ["action"], where: { userId }, _count: true }),
    prisma.auditLog.groupBy({ by: ["entity"], where: { userId }, _count: true }),
    prisma.auditLog.findMany({
      where: { userId, action: "login" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { createdAt: true, ipAddress: true },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.member.findUnique({
      where: { userId },
      select: {
        id: true, membershipNumber: true, faculty: true, specialization: true,
        graduationYear: true, status: true, country: true,
      },
    }),
  ]);

  return {
    user,
    member,
    totalActions,
    actionCounts: actionCounts.map((a) => ({ action: a.action, count: a._count })),
    entityCounts: entityCounts.map((e) => ({ entity: e.entity, count: e._count })),
    lastLogins,
    recentLogs,
  };
}

export async function getAllUserSummaries() {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, image: true, createdAt: true,
      member: { select: { id: true, membershipNumber: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const userIds = users.map((u) => u.id);

  const [actionCounts, lastLogs] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: true,
    }),
    prisma.auditLog.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["userId"],
      select: { userId: true, createdAt: true, action: true, entity: true },
    }),
  ]);

  const countMap = new Map(actionCounts.map((a) => [a.userId, a._count]));
  const lastLogMap = new Map(lastLogs.map((l) => [l.userId, l]));

  return users.map((u) => ({
    ...u,
    totalActions: countMap.get(u.id) || 0,
    lastActivity: lastLogMap.get(u.id) || null,
  }));
}
