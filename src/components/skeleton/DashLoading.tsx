"use client";

import { usePathname } from "next/navigation";
import { Sk, SkBtn, SkCard, SkStatus } from "./Sk";
import { MonitorsSkeleton } from "./DashboardSkeleton";
import { SiteSkeleton } from "./SiteSkeleton";

const TITLES: Record<string, [string, string]> = {
  "cron-jobs": ["Cron jobs", "Heartbeat monitoring for backups and scheduled tasks · 0/10 used"],
  expiry: ["Expiry calendar", "Every SSL certificate and domain renewal date across your sites."],
  "status-pages": ["Status pages", "Public pages with live status and 90-day uptime bars."],
  alerts: ["Alerts & integrations", "Choose where alerts go and which ones each place gets."],
  reports: ["Weekly report", "Uptime, incidents and upcoming expiries in one email a week."],
  settings: ["Settings", "Your profile, plan and account preferences."],
};

function Header({ title, text, button }: { title: string; text: string; button?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-medium"><Sk>{title}</Sk></h1>
        <p className="mt-1 text-sm"><Sk>{text}</Sk></p>
      </div>
      {button && <SkBtn className="px-4 py-2 text-sm font-medium">{button}</SkBtn>}
    </div>
  );
}

function Rows({ n, title }: { n: number; title: string }) {
  return (
    <SkCard className="">
      <div className="border-b border-rule px-4 py-3 text-sm"><Sk>{title}</Sk></div>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="border-b border-rule px-4 py-3 last:border-b-0">
          <p className="text-sm"><Sk>Example site name</Sk></p>
          <p className="text-xs"><Sk>example.com · details</Sk></p>
        </div>
      ))}
    </SkCard>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <Header title="Overview" text="Welcome back. Here's what needs you today." button="Add site" />
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4">
        {["Monitors up", "Incidents", "Uptime", "Next expiry"].map((t) => (
          <div key={t} className="bg-surface p-4">
            <p className="label-caps"><Sk>{t}</Sk></p>
            <p className="mt-1.5 font-display text-2xl font-medium"><Sk>9/9</Sk></p>
            <p className="mt-0.5 text-xs"><Sk>All responding</Sk></p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6"><Rows n={1} title="Needs attention" /><Rows n={3} title="Incidents, last 7 days" /></div>
        <div className="space-y-6"><Rows n={3} title="Upcoming expiries" /><Rows n={2} title="Alerts go to" /></div>
      </div>
    </div>
  );
}

/** One loading boundary for the dashboard: draws the skeleton of the page being opened. */
export function DashLoading() {
  const path = usePathname() ?? "";
  const seg = path.split("/")[2] ?? "";
  let body;
  if (!seg) body = <Overview />;
  else if (seg === "monitors") body = <MonitorsSkeleton />;
  else if (seg === "sites") return <SiteSkeleton />;
  else {
    const [title, text] = TITLES[seg] ?? ["Loading", "Just a moment."];
    body = (
      <div className="space-y-6">
        <Header title={title} text={text} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Rows n={3} title="Loading" />
          <Rows n={4} title="Loading details" />
        </div>
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true">
      <SkStatus label="Loading…" />
      {body}
    </div>
  );
}
