import { z } from "zod";

export const statusPageBody = z.object({
  title: z.string().trim().min(2).max(80),
  slug: z.string().trim().toLowerCase().max(40),
  description: z.string().trim().max(240).optional().default(""),
  siteIds: z.array(z.string().max(40)).min(1).max(50),
  published: z.boolean().default(true),
});

export const statusPagePatch = statusPageBody.partial();
