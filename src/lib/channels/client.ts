import type { AlertChannel } from "@prisma/client";
import type { ChannelEvent, ChannelKind, ClientChannel } from "./types";

export function toClientChannel(c: AlertChannel): ClientChannel {
  return {
    id: c.id,
    kind: c.kind as ChannelKind,
    name: c.name,
    hint: c.hint,
    events: c.events as ChannelEvent[],
    allSites: c.allSites,
    siteIds: c.siteIds,
    enabled: c.enabled,
    lastSentAt: c.lastSentAt?.toISOString() ?? null,
    lastError: c.lastError,
  };
}
