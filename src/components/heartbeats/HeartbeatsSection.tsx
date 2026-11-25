import { heartbeatLimit } from "@/lib/heartbeats/config";
import { loadHeartbeats } from "@/lib/heartbeats/load";
import type { PlanId } from "@/lib/plans";
import { HeartbeatList } from "./HeartbeatList";

/** Dashboard section (server): heartbeats with live state from the monitor Worker. */
export async function HeartbeatsSection({ userId, plan, legacyFree = true }: { userId: string; plan: PlanId; legacyFree?: boolean }) {
  const { list } = await loadHeartbeats(userId, plan);
  return (
    <section id="heartbeats">
      <HeartbeatList list={list} plan={plan} limit={heartbeatLimit(plan, legacyFree)} serverNow={Date.now()} />
    </section>
  );
}
