import { ThemeToggle } from "@/components/ThemeToggle";

const BTN = "rounded-none px-3 py-1.5 text-sm font-medium";
const PRIMARY = `${BTN} bg-accent text-white`;
const SECONDARY = `${BTN} border border-rule text-ink`;

/**
 * Pre-hydration copy of the signed-in navbar (no session needed, so the static HTML is the same for
 * everyone). Hidden unless the head script set <html data-nav>; CSS picks which parts show. React
 * replaces it with the real navbar as soon as the session resolves. Same classes as the real one,
 * so nothing moves; Business and admin accounts never see an upgrade button here either.
 */
export function NavShell() {
  return (
    <div className="nav-shell ml-auto shrink-0 items-center gap-2 text-sm">
      <span className="nav-shell-admin border border-accent/30 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent">
        Admin
      </span>
      <div className="nav-shell-up items-center gap-2" data-up="pro">
        <span className={PRIMARY}>Upgrade to Business</span>
      </div>
      <div className="nav-shell-up items-center gap-2" data-up="free">
        <span className={PRIMARY}>Upgrade to Pro</span>
        <span className={SECONDARY}>Upgrade to Business</span>
      </div>
      <ThemeToggle />
      <span
        aria-hidden="true"
        className="nav-shell-avatar h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule bg-accent-soft text-sm font-medium text-ink"
      />
    </div>
  );
}
