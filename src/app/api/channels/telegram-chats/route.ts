import { NextResponse } from "next/server";
import { apiUser, bad } from "@/lib/api-user";
import { MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";
import { TG_TOKEN_RE } from "@/lib/channels/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Update = { message?: { chat?: Chat }; channel_post?: { chat?: Chat }; my_chat_member?: { chat?: Chat } };
type Chat = { id: number; type: string; title?: string; username?: string; first_name?: string };

/**
 * "Find my chat": reads the user's own bot's recent updates (Telegram getUpdates) and lists the
 * chats that messaged it, so nobody has to dig for a numeric chat ID. The token is not stored here.
 */
export async function POST(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `tg-chats:${a.user.id}`, limit: 10, windowMs: 10 * MINUTE }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const body = (await req.json().catch(() => null)) as { botToken?: unknown } | null;
  const token = typeof body?.botToken === "string" ? body.botToken.trim() : "";
  if (!TG_TOKEN_RE.test(token)) return bad("Paste the bot token from @BotFather first.");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`, { signal: AbortSignal.timeout(6000), redirect: "error" });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; result?: Update[] } | null;
    if (!res.ok || !data?.ok) return bad(res.status === 401 ? "Telegram didn't accept that token." : "Telegram didn't answer. Try again.");
    const chats = new Map<number, { id: string; name: string }>();
    for (const u of data.result ?? []) {
      const c = u.message?.chat ?? u.channel_post?.chat ?? u.my_chat_member?.chat;
      if (c) chats.set(c.id, { id: String(c.id), name: c.title || c.first_name || (c.username ? `@${c.username}` : String(c.id)) });
    }
    return NextResponse.json({ chats: [...chats.values()].slice(0, 10) });
  } catch {
    return bad("Telegram didn't answer. Try again.", 502);
  }
}
