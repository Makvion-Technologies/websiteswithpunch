import { HEARTBEAT_LIMIT } from "@/lib/heartbeats/config";
import { loadHeartbeats } from "@/lib/heartbeats/load";
import type { PlanId } from "@/lib/plans";
import { HeartbeatList } from "./HeartbeatList";

/** Dashboard section (server): heartbeats with live state from the monitor Worker. */
export async function HeartbeatsSection({ userId, plan }: { userId: string; plan: PlanId }) {
  const { list } = await loadHeartbeats(userId, plan);
  return (
    <section id="heartbeats">
      <HeartbeatList list={list} plan={plan} limit={HEARTBEAT_LIMIT[plan]} serverNow={Date.now()} />
    </section>
  );
}
