/**
 * Width system. Every page sits in the same 1152px frame as the navbar and footer, so left edges
 * always line up. Long reading text is capped at 720px inside it (about 70 characters a line).
 */
export const FRAME = "mx-auto w-full max-w-6xl px-4 sm:px-6";

/** Main column + sidebar on desktop (≥1024px); one stacked column below that. */
export const SPLIT = "grid min-w-0 gap-14 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-12 xl:gap-16";

/** Reading measure for prose (legal pages, guides, long explainers). */
export const PROSE = "max-w-[720px]";
