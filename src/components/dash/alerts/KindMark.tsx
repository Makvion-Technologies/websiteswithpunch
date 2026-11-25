import type { ChannelKind } from "@/lib/channels/types";

const STYLE: Record<ChannelKind, [string, string]> = {
  slack: ["#4A154B", "S"],
  discord: ["#5865F2", "D"],
  telegram: ["#229ED9", "T"],
  webhook: ["#1F6FEB", "{ }"],
};

/** Small square mark per channel type (brand colour, one letter). */
export function KindMark({ kind, size = "h-9 w-9" }: { kind: ChannelKind; size?: string }) {
  const [bg, letter] = STYLE[kind];
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center font-display text-sm font-semibold text-white`} style={{ background: bg }} aria-hidden>
      {letter}
    </span>
  );
}
