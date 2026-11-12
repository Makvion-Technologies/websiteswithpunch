import { z } from "zod";
import { isGrace, isPeriod } from "./config";

export const hbSchema = z.object({
  name: z.string().trim().min(1).max(80),
  periodSec: z.number().int().refine(isPeriod),
  graceSec: z.number().int().refine(isGrace),
});

export const hbPatchSchema = hbSchema.partial().extend({ paused: z.boolean().optional() });
