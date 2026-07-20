"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  const key = "hv_sid";
  let id = document.cookie
    .split("; ")
    .find((r) => r.startsWith(key + "="))
    ?.split("=")[1];
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `${key}=${id};path=/;max-age=${60 * 60 * 24 * 30};sameSite=lax`;
  }
  return id;
}

export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const session_id = getOrCreateSessionId();

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        session_id,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
