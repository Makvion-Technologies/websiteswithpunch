import { Steps } from "./steps";

export const RequestLayersFigure = () => (
  <Steps
    id="fig-layers"
    title="The four layers of a web request and how each one fails"
    desc="DNS turns the name into an IP address, then a TCP connection is opened, then the TLS certificate is checked, then the server returns an HTTP status code. Each layer has its own typical errors."
    steps={[
      { title: "1 · DNS", sub: "Name → IP address", tag: "NXDOMAIN", edge: "IP found" },
      { title: "2 · Connection", sub: "TCP to port 443", tag: "refused / timeout", edge: "connected" },
      { title: "3 · TLS", sub: "Certificate valid for this name?", tag: "cert error", edge: "secure" },
      { title: "4 · HTTP", sub: "Server answers with a status code", tag: "4xx / 5xx", tone: "accent" },
    ]}
  />
);

export const SslChainFigure = () => (
  <Steps
    id="fig-chain"
    title="How a certificate chain is trusted"
    desc="A root certificate in the browser's trust store signs an intermediate certificate, which signs your site's certificate. The server must send your certificate and the intermediate; the leaf certificate is the one that expires most often."
    steps={[
      { title: "Root CA", sub: "Built into browsers and OSes", tag: "trust store", edge: "signs" },
      { title: "Intermediate CA", sub: "Sent by your server with yours", tag: "fullchain", edge: "signs" },
      { title: "Your certificate (leaf)", sub: "example.com, www.example.com", tag: "expires first", tone: "danger" },
    ]}
  />
);

export const ProxyChainFigure = () => (
  <Steps
    id="fig-proxy"
    title="Where 502, 503 and 504 errors come from"
    desc="A request passes from the browser to a CDN, a reverse proxy, the application server and the database. A 502 or 504 is reported by a proxy about the hop behind it; a 503 is a deliberate refusal; a 500 comes from the application."
    steps={[
      { title: "Browser", sub: "Shows the error page it gets", edge: "HTTPS" },
      { title: "CDN", sub: "Cloudflare 520–524 if the origin fails", tag: "52x", edge: "forwards" },
      { title: "Proxy / load balancer", sub: "Refused or bad reply → 502 · slow → 504", tag: "502 · 504", tone: "accent", edge: "proxy_pass" },
      { title: "Application server", sub: "Crash → 500 · overloaded → 503", tag: "500 · 503", edge: "queries" },
      { title: "Database", sub: "Slow queries show up as 504s", tag: "slow?" },
    ]}
  />
);

export const RenewalFlowFigure = () => (
  <Steps
    id="fig-renewal"
    numbered
    title="How Certbot renews a certificate"
    desc="A timer runs certbot renew twice a day; if a certificate is due, Certbot completes an ACME challenge, saves the new certificate, then a deploy hook reloads the web server. Outside monitoring confirms visitors get the new certificate."
    steps={[
      { title: "Timer runs certbot renew", sub: "systemd timer or cron, twice a day" },
      { title: "Is a certificate due?", sub: "~⅓ of its life left, or ARI says so" },
      { title: "ACME challenge", sub: "HTTP-01 on port 80, or DNS-01" },
      { title: "New certificate saved", sub: "live/<name>/fullchain.pem" },
      { title: "Deploy hook reloads server", sub: "Visitors only see it after this step", tone: "accent" },
    ]}
  />
);

export const IncidentStagesFigure = () => (
  <Steps
    id="fig-incident"
    numbered
    title="The four stages of an incident update"
    desc="Investigating, then Identified, then Monitoring, then Resolved. Each update promises when the next one will come."
    steps={[
      { title: "Investigating", sub: "We know something is wrong", tone: "danger", edge: "cause found" },
      { title: "Identified", sub: "Cause found, fix in progress", edge: "fix deployed" },
      { title: "Monitoring", sub: "Fix in place, watching it hold", edge: "stable" },
      { title: "Resolved", sub: "Over, with a short summary", tone: "accent" },
    ]}
  />
);

export const DomainLifecycleFigure = () => (
  <Steps
    id="fig-domain"
    title="What happens to a .com domain after it expires"
    desc="Active until the expiry date; then a renewal grace period of up to about 45 days; after deletion a 30-day redemption grace period; then 5 days of pending delete; then the name is released for anyone to register."
    steps={[
      { title: "Active", sub: "Renew any time at the normal price", tag: "until expiry", edge: "expiry date" },
      { title: "Expired · renewal grace", sub: "Site and email stop · renew now", tag: "up to ~45 days", tone: "accent", edge: "registrar deletes" },
      { title: "Redemption grace period", sub: "Restore via same registrar, extra fee", tag: "30 days", tone: "danger", edge: "not restored" },
      { title: "Pending delete", sub: "Locked: nothing can be changed", tag: "5 days", tone: "danger", edge: "purged" },
      { title: "Released", sub: "Anyone can register it", tag: "gone" },
    ]}
  />
);

export const DnsFlowFigure = () => (
  <Steps
    id="fig-dns"
    title="How a DNS lookup is resolved and cached"
    desc="The browser asks a recursive resolver. If the answer isn't cached, the resolver asks a root server, then the .com servers, then your DNS provider, and caches each answer for its TTL."
    steps={[
      { title: "Browser / device", sub: "Short local cache, then asks", edge: "lookup www.example.com" },
      { title: "Recursive resolver", sub: "Caches every answer for its TTL", tag: "ISP · 1.1.1.1", tone: "accent", edge: "1 · where is .com?" },
      { title: "Root server", sub: "Points to the .com servers", edge: "2 · where is example.com?" },
      { title: ".com TLD servers", sub: "Point to your nameservers", tag: "NS TTL 2 days", edge: "3 · what is www?" },
      { title: "Your DNS provider", sub: "A 203.0.113.10 · TTL 3600", tag: "authoritative", tone: "accent" },
    ]}
  />
);

export const RedirectLoopFigure = () => (
  <Steps
    id="fig-loop"
    title="The Flexible SSL redirect loop"
    desc="The visitor requests the HTTPS URL. The CDN in Flexible mode fetches the page from the origin over plain HTTP. The origin redirects HTTP to HTTPS, the visitor follows, and the loop repeats until the browser gives up after about 20 redirects."
    steps={[
      { title: "Visitor", sub: "Requests https://example.com", edge: "HTTPS" },
      { title: "CDN · SSL mode Flexible", sub: "Fetches the page over plain HTTP", tone: "accent", edge: "HTTP" },
      { title: "Origin server", sub: "Forces HTTPS: 301 → https://…", tag: "301", tone: "danger", edge: "back to the visitor" },
      { title: "Visitor follows the 301", sub: "…and the loop starts again", tag: "×20 → error", tone: "danger" },
    ]}
  />
);
