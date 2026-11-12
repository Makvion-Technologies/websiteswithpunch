Sooner or later every site needs to go offline on purpose: a database migration, a platform move, a big redesign. Done carelessly, a few hours of maintenance can leave Google with error pages, "coming soon" text in your search snippets, or URLs dropped from the index.

Done properly, Google barely notices. The method is simple, and it's in Google's own documentation: return **HTTP 503 with a `Retry-After` header**, keep it short, and don't touch `robots.txt`.

## What Google recommends

Google Search Central covers this in its guidance on [pausing or disabling a site](https://developers.google.com/search/docs/crawling-indexing/pause-online-business) and on reducing crawl rate. The key points:

- **Use 503 for short outages.** If you need to take a site down for a day or two, return an informational error page with a `503 Service Unavailable` status instead of the normal content.
- **Add `Retry-After`.** RFC 9110 defines it as a delay in seconds or an HTTP date, and Google's crawlers use it to decide when to come back.
- **Keep it short.** Google warns that if Googlebot sees the same URLs return 503 for more than a day or two, they may be dropped from the index. For longer closures it recommends an indexable placeholder page served with `200`.
- **Don't 503 `robots.txt`.** Google says not to return 503 for `robots.txt`, because that blocks all crawling. Don't change it to `Disallow: /` either, which can remove the site's content from search.
- **Don't use 403, 404, 410 or `noindex`.** These tell Google the pages are gone and remove them from search.
- **Content on a 503 page is ignored.** Google doesn't index it, so your snippets keep showing the real page's title and description.

> **Note:** A 503 doesn't make Google think your site is "down" in a way that hurts rankings by itself. It reads it as "come back later", which is exactly what you mean.

## The status codes compared

| Approach | What Google does | Use it? |
| --- | --- | --- |
| `503` + `Retry-After` | Slows crawling, keeps indexed pages, retries later | Yes, for up to a day or two |
| `200` with a "down for maintenance" page | May index the maintenance text and replace your snippets | No, except as a long-term placeholder |
| `302` redirect to `/maintenance` | May treat the maintenance page as the content of every URL | No |
| `404` / `410` | Starts removing URLs from the index | Never for maintenance |
| `robots.txt` → `Disallow: /` | Stops crawling and may remove content from search | Never for maintenance |

## How to return a proper 503

The idea is the same on every stack. Turn maintenance on with a switch (a file or an environment variable), let yourself through, keep `robots.txt` reachable, and send `503` plus `Retry-After` to everyone else.

### Nginx

```nginx
# Let your own IP through to test the site during maintenance
map $remote_addr $maint_bypass {
    default       0;
    203.0.113.10  1;
}

server {
    # ...your existing listen / server_name / ssl lines...

    location = /robots.txt { try_files $uri =404; }

    location / {
        set $maint 0;
        if (-f /var/www/maintenance.on) { set $maint 1; }
        if ($maint_bypass) { set $maint 0; }
        if ($maint) { return 503; }
        # ...your normal try_files / proxy_pass here...
    }

    error_page 503 /maintenance.html;
    location = /maintenance.html {
        root /var/www/maintenance;
        add_header Retry-After 3600 always;
        internal;
    }
}
```

`touch /var/www/maintenance.on` switches maintenance on, and deleting the file switches it off. No reload needed. `error_page` keeps the 503 status while serving your friendly page.

### Apache (.htaccess)

```apache
RewriteEngine On
RewriteCond %{DOCUMENT_ROOT}/maintenance.on -f
RewriteCond %{REMOTE_ADDR} !^203\.0\.113\.10$
RewriteCond %{REQUEST_URI} !^/(robots\.txt|maintenance\.html)$
RewriteRule ^ - [R=503,L]
ErrorDocument 503 /maintenance.html
Header always set Retry-After "3600" "expr=%{REQUEST_STATUS} == 503"
```

### Next.js (middleware)

```ts
// middleware.ts — set MAINTENANCE=1 in the environment and redeploy to switch on
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (process.env.MAINTENANCE !== "1" || req.nextUrl.pathname === "/robots.txt") return;
  return new NextResponse("<h1>Back soon</h1><p>Planned maintenance until 14:00 UTC.</p>", {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "3600" },
  });
}
```

### WordPress

WordPress's built-in maintenance mode (during core and plugin updates) already returns 503. Maintenance and "coming soon" plugins vary: some return 503, others return 200, which you don't want. Always check (below).

## Check the headers before you rely on them

```bash
curl -sI https://example.com/ | grep -iE '^(HTTP/|retry-after)'
# HTTP/2 503
# retry-after: 3600

curl -sI https://example.com/robots.txt | head -1
# HTTP/2 200
```

Check a deep URL as well as the homepage. Some setups only catch `/`.

## A maintenance checklist

**Before**

1. Pick a low-traffic window from your analytics, and tell customers in advance: a banner, an email, a status page.
2. Take and test a backup. "Test" means you've restored it somewhere.
3. Prepare the 503 page: static HTML, inline CSS, no external requests. Say what's happening and when you expect to be back, with the timezone.
4. Pause paid ad campaigns that send traffic to affected pages.

**During**

1. Switch maintenance on and check the headers with `curl`.
2. Keep `robots.txt` reachable and unchanged.
3. Post updates where customers will look. [How to set up a status page](/blog/status-page-guide) has templates.

**After**

1. Switch maintenance off and check that the homepage and a few deep pages return `200`.
2. Clear CDN and application caches so nobody keeps getting the maintenance page.
3. Check SSL with the [SSL checker](/tools/ssl-checker), especially after a server move. A new server needs its certificate too.
4. Watch Google Search Console's page indexing and crawl stats reports for a few days for unexpected server errors.

## Can you avoid the downtime altogether?

The best maintenance page is the one nobody sees. Many "we need to take the site down" jobs can be done without it:

- **Read-only mode instead of offline.** For a database move, keep pages readable and switch off only the things that write: checkout, comments, account changes. Google's own advice for pausing a business is to limit functionality rather than take the whole site down, because people can still find and read your pages.
- **Blue-green deploys.** Build the new version alongside the old one, test it, then switch traffic over in one step. Switching back is just as quick if something's wrong.
- **Expand, then contract, database changes.** Add new columns or tables first, deploy code that writes to both, move the data, and only remove the old structure in a later release. Each step is small and reversible.
- **Lower DNS TTLs before a server move,** so the switch takes minutes instead of hours. [DNS propagation explained](/blog/dns-propagation-explained) has the timeline.
- **Use your host's or CDN's features.** Many platforms can show a maintenance page from the edge, or keep serving cached pages while the origin is offline.

When real downtime *is* needed, keep it short, schedule it, and use the 503 approach above.

## How long is too long?

Google's guidance gives the limit plainly: a day or two of 503s is fine, and longer starts to risk pages dropping out of the index. If a job might overrun, plan for it:

| Expected downtime | Approach |
| --- | --- |
| Minutes to a few hours | 503 + `Retry-After`, no other changes |
| Up to 1–2 days | 503 + `Retry-After` with a realistic time, status updates, ads paused |
| Several days or more | Serve a normal, indexable `200` page explaining the situation; keep `robots.txt` and the sitemap unchanged |
| Closing for good | Redirect pages to their closest equivalents (`301`), or return `410` for content that's gone |

## Monitoring during planned maintenance

Any honest uptime monitor will report a 503 as down, because it *is* down for visitors. In Website Health, any 4xx or 5xx answer is recorded as down, so planned maintenance shows up in the history and the uptime percentage. That's accurate. Note the window in your own records so you can explain the dip, or exclude it if your SLA leaves out scheduled maintenance. [What 99.9% uptime really means](/blog/uptime-percentage-explained) explains how SLAs treat it.

When you switch maintenance off, press **Recheck** on the site in your dashboard to confirm it's back straight away rather than waiting for the next scheduled check. Or run the free [website down checker](/tools/website-down-checker) on any URL. If something else breaks along the way, [502 vs 503 vs 504 errors](/blog/fix-502-503-504-errors) explains how to tell a deliberate 503 from a real failure.
