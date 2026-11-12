import type { ComponentType } from "react";
import { CertLifetimesFigure, DowntimeCostFigure, NinesFigure } from "./bars";
import { CheckIntervalsFigure } from "./diagrams";
import {
  DnsFlowFigure,
  DomainLifecycleFigure,
  IncidentStagesFigure,
  ProxyChainFigure,
  RedirectLoopFigure,
  RenewalFlowFigure,
  RequestLayersFigure,
  SslChainFigure,
} from "./flows";

/** Diagrams referenced from post markdown as "::fig name". Inline SVG: no requests, no layout shift. */
const FIGURES: Record<string, { C: ComponentType; caption: string; wide?: boolean }> = {
  nines: { wide: true, C: NinesFigure, caption: "Allowed downtime in a 30-day month. Each extra nine cuts it by ten." },
  "request-layers": { C: RequestLayersFigure, caption: "A request passes four layers; the error you see tells you which one failed." },
  "downtime-cost": { wide: true, C: DowntimeCostFigure, caption: "The worked example below: a 3-hour Friday-evening outage for a $40k/month shop." },
  "check-intervals": { wide: true, C: CheckIntervalsFigure, caption: "The same 10-minute outage, seen by four check intervals." },
  "ssl-chain": { C: SslChainFigure, caption: "Browsers trust your certificate through the intermediate that signed it." },
  "cert-lifetimes": { wide: true, C: CertLifetimesFigure, caption: "Maximum lifetime of a newly issued public TLS certificate (Ballot SC-081v3)." },
  "renewal-flow": { C: RenewalFlowFigure, caption: "Renewal only reaches visitors after the web server reloads the new file." },
  "domain-lifecycle": { C: DomainLifecycleFigure, caption: "Typical gTLD timeline (.com, .net, .org). Grace length varies by registrar." },
  "dns-flow": { C: DnsFlowFigure, caption: "Every resolver caches the answer for the TTL, which is why changes take time." },
  "proxy-chain": { C: ProxyChainFigure, caption: "Gateway errors are reported by the hop in front of the one that failed." },
  "redirect-loop": { C: RedirectLoopFigure, caption: "The classic loop: the CDN speaks HTTP to an origin that insists on HTTPS." },
  "incident-stages": { C: IncidentStagesFigure, caption: "The four stages most status pages use." },
};

export function Figure({ name }: { name: string }) {
  const f = FIGURES[name];
  if (!f) return null;
  return (
    <figure className="mt-8 border border-rule bg-surface p-4 sm:p-6">
      <div className={`mx-auto ${f.wide ? "max-w-[480px]" : "max-w-[400px]"}`}>
        <f.C />
      </div>
      <figcaption className="mt-4 border-t border-rule pt-3 text-xs leading-relaxed text-muted sm:text-sm">{f.caption}</figcaption>
    </figure>
  );
}
