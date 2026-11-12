import type { ArticleSection, Faq } from "@/components/seo/types";
import { HEARTBEAT_LIMIT } from "@/lib/heartbeats/config";

export const heartbeatFeature = {
  path: "/cron-job-monitoring",
  title: "Cron Job Monitoring with Heartbeat URLs",
  description:
    "Cron job and scheduled task monitoring: your job pings a secret URL each run, and we email you when a ping is missed and again when it resumes. Free plan included.",
  eyebrow: "Cron job monitoring",
  h1: "Cron job monitoring that tells you when a run goes missing",
  intro:
    "Backups, invoice runs, imports and cleanup scripts fail quietly: nothing crashes in public, the job just stops. Give each job a heartbeat, add one curl line, and Websites With Punch emails you when a run doesn't check in on time.",
  facts: [
    "A secret ping URL per job",
    "GET, POST or HEAD, from curl or wget",
    "Missed pings checked every minute",
    "Email when missed and when back",
  ],
  sections: [
    {
      h: "How a heartbeat works",
      p: [
        "Create a heartbeat on your dashboard and pick how often the job runs (every 5 minutes, 15 minutes, hour, day or week) and a grace time for runs that start late or take longer. You get a unique URL. Call it at the end of the job, for example by adding \"&& curl -fsS -m 10 --retry 3 -o /dev/null\" and your URL to the crontab line, so the ping is only sent when the job succeeds.",
        "Every minute we look for heartbeats whose last ping is older than the period plus the grace time. When one is late we mark it missed and email you once. When the next ping arrives we mark it back up and email you again.",
      ],
    },
    {
      h: "What it catches",
      list: [
        "A server that rebooted and lost its crontab or never restarted the scheduler.",
        "A job that now exits with an error (the ping after \"&&\" never runs).",
        "A script that hangs and never finishes.",
        "A scheduled task disabled during maintenance and never switched back on.",
      ],
    },
    {
      h: "Plans",
      p: [
        `Free includes ${HEARTBEAT_LIMIT.free} heartbeat with a period of an hour or longer. Pro includes ${HEARTBEAT_LIMIT.pro} and Business ${HEARTBEAT_LIMIT.business}, and both can expect pings as often as every 5 minutes. Heartbeats sit on the same dashboard as your uptime, SSL and domain checks, and alerts follow your existing email alert settings.`,
      ],
    },
    {
      h: "What it doesn't do",
      p: [
        "We don't run your jobs, read their output or store logs. A ping only says \"this run happened\". Alerts are by email; there are no SMS or chat alerts yet. To keep the service free of surprises, a heartbeat records at most two pings a minute; extra pings are accepted but not stored.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "Which HTTP methods does the ping URL accept?",
      a: "GET, POST and HEAD. Anything that can make an HTTP request works: curl, wget, PowerShell's Invoke-WebRequest, or an HTTP call at the end of your code.",
    },
    {
      q: "How quickly will I hear about a missed run?",
      a: "Within about a minute after the period plus grace time has passed. With an hourly job and 15 minutes grace, that's roughly 76 minutes after the last ping.",
    },
    {
      q: "What happens when I pause a heartbeat?",
      a: "No alerts are sent while it's paused. When you resume it, it waits for the next ping before it starts counting again, so the paused time never counts as missed.",
    },
    {
      q: "Is the ping URL secret?",
      a: "Yes. It contains a random token, so treat it like a password. Anyone with the URL can send pings for that heartbeat, but it can't read or change anything in your account.",
    },
  ] satisfies Faq[],
};
