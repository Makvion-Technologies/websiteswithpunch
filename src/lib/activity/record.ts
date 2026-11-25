import { prisma } from "@/lib/prisma";
import { deviceFromUA, geoFromHeaders, header, type HeaderBag } from "./geo";
import { MIN_WRITE_GAP_MS, shouldRecord } from "./status";
import { parseFirstTouch, readCookie, SOURCE_COOKIE } from "./source";

/** Browser-session cookie the proxy sets on the first dashboard visit (no Max-Age = ends with the browser). */
export const SESSION_COOKIE = "wwp_s";

/**
 * Login or new dashboard session: one write with time, coarse geo and device, plus a timeline row.
 * Never called per request. Skipped when the last one was under a minute ago (login then dashboard).
 */
export async function recordSessionStart(userId: string, h: HeaderBag, kind: "login" | "session", now = new Date()) {
  const geo = geoFromHeaders(h);
  const device = deviceFromUA(header(h, "user-agent"));
  const cutoff = new Date(now.getTime() - MIN_WRITE_GAP_MS);
  // Keep the last known location when a request carries no geo headers (local dev, some proxies).
  const loc = {
    ...(geo.country && { lastCountry: geo.country, lastRegion: geo.region, lastCity: geo.city }),
    ...(device && { lastDevice: device }),
  };
  // Conditional update = atomic throttle: parallel calls can't both pass.
  const res = await prisma.user.updateMany({
    where: { id: userId, OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }] },
    data: { lastActiveAt: now, ...(kind === "login" && { lastLoginAt: now }), ...loc },
  });
  if (res.count === 0) {
    // A login right after a session start still counts as a login.
    if (kind === "login") await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: now, ...loc } });
    else return false;
  }
  await prisma.userActivity.create({ data: { userId, kind, country: geo.country, city: geo.city, device, at: now } });
  return true;
}

/** At signup: location, device, first-touch source and the first timeline row. */
export async function recordSignup(userId: string, req: Request, now = new Date()) {
  const geo = geoFromHeaders(req.headers);
  const device = deviceFromUA(req.headers.get("user-agent"));
  const touch = parseFirstTouch(readCookie(req.headers.get("cookie"), SOURCE_COOKIE));
  await prisma.user.update({
    where: { id: userId },
    data: {
      signupCountry: geo.country, signupCity: geo.city,
      lastCountry: geo.country, lastRegion: geo.region, lastCity: geo.city, lastDevice: device,
      signupSource: touch?.source ?? "direct",
      ...(touch && { signupUtm: touch }),
    },
  });
  await prisma.userActivity.create({ data: { userId, kind: "signup", country: geo.country, city: geo.city, device, at: now } });
}

export { shouldRecord };
