import type { Session } from "next-auth";
import { getEffectivePlan } from "@/lib/plans";

/**
 * First-paint navbar hint. Pages stay static, so the server can't know who is signed in. After the
 * client session resolves we keep a tiny, non-secret cookie (role, plan, avatar initial). On the next
 * page load NAV_HINT_SCRIPT reads it before paint and sets <html data-nav>, and CSS (globals.css,
 * "nav hint") swaps the guest menu for a copy of the signed-in navbar until React takes over.
 * Purely cosmetic: nothing on the server trusts it, and a stale value corrects itself on load.
 */
export const NAV_HINT_COOKIE = "wwp_nav";
const MAX_AGE = 30 * 86_400;

export function navHintValue(session: Session | null): string | null {
  const user = session?.user;
  if (!user) return null;
  if (user.verified === false) return "v";
  // Same letter the real avatar shows (admin menu uses the email).
  const source = user.admin ? user.email : user.name || user.email;
  const initial = (source || "").charAt(0).toUpperCase();
  const safe = /^[A-Z0-9]$/.test(initial) ? initial : "";
  if (user.admin) return `a..${safe}`;
  return `u.${getEffectivePlan(user.plan, user.dodoStatus ?? null)}.${safe}`;
}

export function writeNavHint(value: string | null) {
  const current = document.cookie.match(/(?:^|; )wwp_nav=([^;]*)/)?.[1] ?? null;
  if (current === value) return;
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = value
    ? `${NAV_HINT_COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax${secure}`
    : `${NAV_HINT_COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
}

/** Runs in <head> before paint. "/" redirects signed-in visitors; /login and /signup are guest-only. */
export const NAV_HINT_SCRIPT = `(function(){try{var p=location.pathname;if(p==="/"||p==="/login"||p==="/signup"||p==="/verify-email")return;var m=document.cookie.match(/(?:^|; )wwp_nav=([^;]*)/);if(!m)return;var v=m[1].split(".");var r=v[0],d=document.documentElement;if(r==="u"){var pl=/^(free|pro|business)$/.test(v[1])?v[1]:"business";d.setAttribute("data-nav","u-"+pl)}else if(r==="a"||r==="v"){d.setAttribute("data-nav",r)}else return;if(/^[A-Z0-9]$/.test(v[2]||""))d.style.setProperty("--nav-initial",'"'+v[2]+'"')}catch(e){}})();`;
