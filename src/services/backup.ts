import prisma from "@/lib/prisma"

interface BackupData {
  version: string
  date: string
  tables: {
    name: string
    count: number
    records: any[]
  }[]
  summary: {
    totalTables: number
    totalRecords: number
    sizeBytes: number
  }
}

const EXCLUDED_MODELS = ["Backup", "VerificationToken", "PasswordReset", "Notification", "Settings"]

// Get all Prisma model names dynamically
function getModelNames(): string[] {
  return Object.keys(prisma).filter((key) => !key.startsWith("$") && !key.startsWith("_") && typeof (prisma as any)[key]?.findMany === "function")
}

export async function createBackup(type: "manual" | "auto" = "manual"): Promise<BackupData> {
  const modelNames = getModelNames().filter((m) => !EXCLUDED_MODELS.includes(m))

  let totalRecords = 0
  const tables: BackupData["tables"] = []

  for (const name of modelNames) {
    try {
      const records = await (prisma as any)[name].findMany()
      totalRecords += records.length
      tables.push({ name, count: records.length, records })
    } catch (error) {
      console.warn(`Skipping table ${name}:`, error)
    }
  }

  const json = JSON.stringify(tables)
  const sizeBytes = new TextEncoder().encode(json).length

  const backupData: BackupData = {
    version: "1.0",
    date: new Date().toISOString(),
    tables,
    summary: {
      totalTables: tables.length,
      totalRecords,
      sizeBytes,
    },
  }

  // Store in DB
  await prisma.backup.create({
    data: {
      type,
      status: "completed",
      size: sizeBytes,
      tables: tables.length,
      data: json,
      summary: JSON.stringify(backupData.summary),
    },
  })

  return backupData
}

export async function listBackups(limit = 20, offset = 0) {
  const [backups, total] = await Promise.all([
    prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        status: true,
        size: true,
        tables: true,
        createdAt: true,
      },
    }),
    prisma.backup.count(),
  ])
  return { backups, total }
}

export async function getBackup(id: string) {
  const backup = await prisma.backup.findUnique({ where: { id } })
  if (!backup) return null
  return {
    id: backup.id,
    type: backup.type,
    status: backup.status,
    size: backup.size,
    tables: backup.tables,
    createdAt: backup.createdAt,
    data: JSON.parse(backup.data) as BackupData["tables"],
    summary: JSON.parse(backup.summary),
  }
}

export async function deleteBackup(id: string): Promise<boolean> {
  try {
    await prisma.backup.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

async function restoreTables(tables: BackupData["tables"]): Promise<{ success: boolean; message: string }> {
  let restoredCount = 0
  for (const table of tables) {
    const model = (prisma as any)[table.name]
    if (!model) continue
    await model.deleteMany()
    for (const record of table.records) {
      await model.create({ data: record })
      restoredCount++
    }
  }
  return { success: true, message: `Restored ${tables.length} tables (${restoredCount} records)` }
}

export async function restoreFromBackup(id: string): Promise<{ success: boolean; message: string }> {
  const backup = await prisma.backup.findUnique({ where: { id } })
  if (!backup) return { success: false, message: "Backup not found" }
  try {
    const tables = JSON.parse(backup.data) as BackupData["tables"]
    return await restoreTables(tables)
  } catch (error: any) {
    return { success: false, message: error.message || "Restore failed" }
  }
}

export async function restoreFromFile(jsonData: BackupData): Promise<{ success: boolean; message: string }> {
  try {
    return await restoreTables(jsonData.tables)
  } catch (error: any) {
    return { success: false, message: error.message || "Restore failed" }
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
