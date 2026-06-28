import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let lastCheck = new Date()

      const sendNotifications = async () => {
        try {
          const notifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
          lastCheck = new Date()

          if (notifications.length > 0) {
            const unreadCount = await prisma.notification.count({ where: { isRead: false } })
            const data = JSON.stringify({ notifications, unreadCount })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        } catch {}
      }

      // Send initial empty heartbeat
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ heartbeat: true })}\n\n`))

      // Poll every 3 seconds for new notifications
      const interval = setInterval(sendNotifications, 3000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
