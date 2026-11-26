"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/** Live Microsoft Clarity project. Public, and overridable with NEXT_PUBLIC_CLARITY_ID. */
const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "zjr4npmzbu";

/**
 * Load Clarity only on the real production deployment. NODE_ENV is "production" on
 * every Vercel build, including previews, so also require VERCEL_ENV=production
 * (exposed to the client as NEXT_PUBLIC_VERCEL_ENV). Local dev, `next start`, and
 * preview deployments stay out of the dashboard.
 */
function isProduction(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV;
  return vercelEnv === "production";
}

/** Microsoft Clarity session replay and heatmaps. Skipped on /admin. */
export function MicrosoftClarity() {
  const pathname = usePathname();
  if (!isProduction()) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", ${JSON.stringify(PROJECT_ID)});
      `}
    </Script>
  );
}
