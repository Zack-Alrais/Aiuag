"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserCheck, Clock, Check, X, UserMinus } from "lucide-react";

// status: "" none, "requested" (I sent), "pending" (incoming), "friends", "self"
export type FriendStatus = "" | "requested" | "pending" | "friends" | "self";

interface FriendButtonProps {
  memberId: string;
  lang: string;
  initialStatus?: FriendStatus;
  onStatusChange?: (status: FriendStatus) => void;
  compact?: boolean;
}

const isAr = (lang: string) => lang === "ar";

export function resolveFriendStatus(memberId: string, myId: string | undefined): FriendStatus {
  if (!myId || memberId === myId) return "self";
  return "";
}

// Small client hook that resolves the friendship status against /api/friends.
export function useFriendStatus(memberId: string, myId: string | undefined) {
  const [status, setStatus] = useState<FriendStatus>(() => resolveFriendStatus(memberId, myId));

  useEffect(() => {
    setStatus(resolveFriendStatus(memberId, myId));
    if (!myId || memberId === myId) return;
    let cancelled = false;
    fetch(`/api/friends?with=${encodeURIComponent(memberId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.status === "friends") setStatus("friends");
        else if (d?.status === "requested") setStatus("requested");
        else if (d?.status === "pending") setStatus("pending");
        else setStatus("");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [memberId, myId]);

  return { status, setStatus };
}

export function FriendButton({
  memberId,
  lang,
  initialStatus = "",
  onStatusChange,
  compact = false,
}: FriendButtonProps) {
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [busy, setBusy] = useState(false);

  const apply = useCallback(
    (next: FriendStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange]
  );

  const sendRequest = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: memberId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل الإرسال");
      apply("requested");
      toast.success(
        isAr(lang)
          ? (d?.status === "accepted" ? "تمت إضافة الصديق بنجاح" : "تم إرسال طلب الصداقة")
          : d?.status === "accepted" ? "Friend added" : "Friend request sent"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setBusy(false);
    }
  };

  const cancelRequest = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/friends/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: memberId, action: "cancel" }),
      });
      if (!res.ok) throw new Error("فشل الإلغاء");
      apply("");
      toast.success(isAr(lang) ? "تم إلغاء الطلب" : "Request cancelled");
    } catch {
      toast.error(isAr(lang) ? "فشل الإلغاء" : "Failed to cancel");
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: memberId, action: "accept" }),
      });
      if (!res.ok) throw new Error("فشل القبول");
      apply("friends");
      toast.success(isAr(lang) ? "تمت إضافة الصديق" : "Friend added");
    } catch {
      toast.error(isAr(lang) ? "فشل القبول" : "Failed to accept");
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: memberId, action: "decline" }),
      });
      if (!res.ok) throw new Error("فشل الرفض");
      apply("");
      toast.success(isAr(lang) ? "تم رفض الطلب" : "Request declined");
    } catch {
      toast.error(isAr(lang) ? "فشل الرفض" : "Failed to decline");
    } finally {
      setBusy(false);
    }
  };

  const unfriend = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/friends?memberId=${encodeURIComponent(memberId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      apply("");
      toast.success(isAr(lang) ? "تمت إزالة الصديق" : "Friend removed");
    } catch {
      toast.error(isAr(lang) ? "فشل الحذف" : "Failed to remove");
    } finally {
      setBusy(false);
    }
  };

  const base = compact
    ? "px-2.5 py-1.5 text-xs"
    : "px-4 py-2 text-sm";
  const rounded = "rounded-lg font-medium transition-colors active:scale-95 flex items-center gap-1.5 disabled:opacity-60";

  if (status === "self") return null;

  if (status === "friends") {
    return (
      <button
        onClick={unfriend}
        disabled={busy}
        className={`${base} ${rounded} bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-[#1e2d42] dark:text-gray-300 dark:hover:bg-red-900/30`}
      >
        <UserCheck className="w-4 h-4" />
        <span className="hidden sm:inline">{isAr(lang) ? "أصدقاء" : "Friends"}</span>
      </button>
    );
  }

  if (status === "requested") {
    return (
      <button
        onClick={cancelRequest}
        disabled={busy}
        className={`${base} ${rounded} bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-[#1e2d42] dark:text-amber-300`}
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">{isAr(lang) ? "بانتظار القبول" : "Requested"}</span>
      </button>
    );
  }

  if (status === "pending") {
    return (
      <div className={`flex items-center gap-1.5 ${compact ? "" : ""}`}>
        <button
          onClick={accept}
          disabled={busy}
          className={`${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${rounded} bg-primary text-white hover:bg-primary-dark`}
        >
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">{isAr(lang) ? "قبول" : "Accept"}</span>
        </button>
        <button
          onClick={decline}
          disabled={busy}
          className={`${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${rounded} bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-gray-300`}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">{isAr(lang) ? "رفض" : "Decline"}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={busy}
      className={`${base} ${rounded} bg-primary text-white hover:bg-primary-dark`}
    >
      <UserPlus className="w-4 h-4" />
      <span className="hidden sm:inline">{isAr(lang) ? "أضف صديقاً" : "Add Friend"}</span>
    </button>
  );
}