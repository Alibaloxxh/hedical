import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

async function callPost(body: unknown) {
  const req = new NextRequest("http://localhost/api/track-visit", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("POST /api/track-visit", () => {
  beforeAll(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
  });

  it("rejects missing path", async () => {
    const res = await callPost({ session_id: "abc" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("path");
  });

  it("rejects missing session_id", async () => {
    const res = await callPost({ path: "/test" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("session_id");
  });

  it("rejects api routes", async () => {
    const res = await callPost({ path: "/api/foo", session_id: "abc" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBe("ignored");
  });

  it("accepts valid payload", async () => {
    const res = await callPost({ path: "/pricing", session_id: "abc" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
