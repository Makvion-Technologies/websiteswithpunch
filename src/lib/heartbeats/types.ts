/** One heartbeat as the dashboard shows it (dates as epoch ms so server and client render alike). */
export type ClientHb = {
  id: string;
  name: string;
  url: string;
  periodSec: number;
  graceSec: number;
  paused: boolean;
  over: boolean;
  /** waiting (no ping yet), up, down, paused, over (beyond plan limit) */
  state: "waiting" | "up" | "down" | "paused" | "over";
  lastPing: number | null;
  /** When it will be marked missed if no ping comes (null while waiting or paused). */
  alertAt: number | null;
  /** True when the live state came from the Worker (false = last state saved in the app). */
  live: boolean;
  incidents: { kind: string; at: number }[];
};
