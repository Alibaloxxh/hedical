import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { path, referrer, session_id } = await request.json();

    if (!path || !session_id) {
      return NextResponse.json({ error: "path and session_id are required" }, { status: 400 });
    }

    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "ignored" }, { status: 200 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("page_visits").insert({
      path,
      referrer: referrer || null,
      session_id,
      user_id: user?.id || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
}
