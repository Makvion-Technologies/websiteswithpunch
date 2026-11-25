import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SECTION_KEY, newCounts } from "@/lib/admin/seen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/**
 * Every /admin page sits behind this check (pages and APIs check again); non-admins get a 404.
 * Full-width shell like the dashboard: rail on lg+, tab row on smaller screens.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const n = await newCounts(admin.email!, Object.values(SECTION_KEY));
  const counts = Object.fromEntries(Object.entries(SECTION_KEY).map(([href, k]) => [href, n[k] ?? 0]));
  return (
    <div data-app-shell className="app-shell mx-auto w-full px-4 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-8 2xl:gap-10 2xl:px-10">
      <AdminSidebar counts={counts} />
      <div className="min-w-0 pb-10 pt-2 lg:py-8">
        <AdminNav counts={counts} />
        <div className="mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
