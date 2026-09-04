"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export interface CommunityMember {
  // Member.id from the database. This is the id used as `authorId` for posts
  // and `memberId` for comments, reactions and shares.
  id: string
  name: string
  email?: string
  image?: string
}

interface UseMemberResult {
  /** next-auth session status: "loading" | "authenticated" | "unauthenticated" */
  status: "loading" | "authenticated" | "unauthenticated"
  /** Whether a resolvable Member identity is available */
  isAuthenticated: boolean
  member: CommunityMember | null
}

// Older client code stored the member under this key. Keep it as a fallback so
// previously stored sessions keep working, but the session is authoritative.
const LEGACY_KEY = "memberData"

function readLegacyMember(): CommunityMember | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CommunityMember
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

/**
 * Single source of truth for the currently logged-in member across the whole
 * app (profile, posts feed, post detail, comments, shares, ...).
 *
 * The value is derived from the NextAuth session (server-backed JWT) instead of
 * an unreliable localStorage copy, so the latest avatar/name are always used.
 *
 * The fallback localStorage read is deferred to a post-mount effect so the
 * server-rendered HTML always matches the first client render (hydration-safe).
 */
export function useMember(): UseMemberResult {
  const { data: session, status } = useSession()
  const user = session?.user

  const [legacyMember, setLegacyMember] = useState<CommunityMember | null>(null)

  useEffect(() => {
    setLegacyMember(readLegacyMember())
  }, [])

  if (user?.memberId) {
    return {
      status,
      isAuthenticated: true,
      member: {
        id: user.memberId,
        name: user.name || "",
        email: user.email || "",
        image: user.image || undefined,
      },
    }
  }

  if (legacyMember) {
    return { status, isAuthenticated: true, member: legacyMember }
  }

  return { status, isAuthenticated: false, member: null }
}