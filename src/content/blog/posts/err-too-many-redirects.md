`ERR_TOO_MANY_REDIRECTS` means the browser followed redirect after redirect and never reached a page. URL A sends it to URL B, and B sends it back to A, or round a longer circle. Browsers give up after about 20 hops. The Fetch standard that browsers follow turns the 20th redirect into a network error, and Chrome and Firefox both stop at 20.

The good news is that redirect loops always have a cause you can see. Something in your setup disagrees about which URL is the "real" one. Here's how to find it and fix it.

## What the error looks like

| Browser | Message |
| --- | --- |
| Chrome, Edge | "This page isn't working. example.com redirected you too many times." `ERR_TOO_MANY_REDIRECTS` |
| Firefox | "The page isn't redirecting properly" |
| Safari | "Too many redirects occurred trying to open…" |

Monitors and API clients report it as too many redirects, or as a loop. The [website down checker](/tools/website-down-checker) follows up to five redirects and shows where it ended up.

## Step 1: See the loop

Don't guess, look. `curl` shows every hop with its status code and `Location` header:

```bash
curl -sIL --max-redirs 10 https://example.com | grep -iE '^(HTTP/|location:)'
```

A typical loop looks like this:

```text
HTTP/2 301
location: https://example.com/
HTTP/2 301
location: https://example.com/
HTTP/2 301
location: https://example.com/
...
```

A URL redirecting to *itself* almost always means a proxy or CDN problem (cause 1 or 4 below). Two URLs alternating, such as `www` ↔ non-`www` or `http` ↔ `https`, means two rules disagree (cause 2 or 3).

Then test in a private window. If the loop only happens in your normal browser, cookies or a cached redirect are involved (cause 5).

## The five common causes

::fig redirect-loop

### 1. CDN "Flexible" SSL plus an HTTPS redirect at the origin

This is the classic one. With Cloudflare's **Flexible** SSL mode, visitors connect to Cloudflare over HTTPS, but Cloudflare connects to your server over plain **HTTP**. If your server, or WordPress, or a plugin, redirects HTTP to HTTPS, it sends Cloudflare back to HTTPS. Cloudflare connects to the origin over HTTP again, and round it goes.

**Fix:** install a certificate on the origin (a free Let's Encrypt or Cloudflare Origin certificate) and set the SSL/TLS mode to **Full (strict)**. Other CDNs and proxies have the same setting under different names. Make sure the CDN talks to the origin over HTTPS whenever the origin forces HTTPS.

### 2. Two rules that disagree about www

The host redirects `www.example.com` → `example.com`, while the CMS is configured for `https://www.example.com` and redirects back. Each layer is "correct" by its own config.

**Fix:** pick one canonical hostname and make every layer agree: DNS/CDN rules, the web server config, `.htaccess`, and the application's own site URL. Remove the redirect from all but one layer.

### 3. A WordPress site URL that doesn't match

WordPress redirects to the address saved in **Settings → General** (the `siteurl` and `home` options). If that says `http://` while the server forces `https://`, or it names the wrong hostname, you get a loop. If you can't reach the admin, set it in `wp-config.php`:

```php
define('WP_HOME', 'https://www.example.com');
define('WP_SITEURL', 'https://www.example.com');
```

Remove these lines afterwards if you'd rather manage the URL from the dashboard. Also clear any caching plugin, because cached pages can keep serving the old redirect.

### 4. The app can't tell the request was HTTPS

Behind a load balancer or reverse proxy, the app often receives plain HTTP from the proxy even though the visitor used HTTPS. An app that forces HTTPS sees "HTTP", redirects, and loops forever. Proxies pass the original scheme in the `X-Forwarded-Proto` header. Make sure the proxy sets it and the app trusts it. In Nginx:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host $host;
```

Then configure the app to trust the proxy: `app.set('trust proxy', 1)` in Express, `SECURE_PROXY_SSL_HEADER` in Django, `TrustProxies` in Laravel. For WordPress behind a proxy:

```php
if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') { $_SERVER['HTTPS'] = 'on'; }
```

### 5. Cookies and cached redirects

Login systems sometimes loop between a login page and a protected page when a session cookie is broken or set for the wrong domain. Browsers also cache **301** redirects, sometimes for a long time. So a loop you've already fixed on the server can keep happening in a browser that saw the old one.

**Fix:** clear the cookies for that site, or test in a private window. If a loop involves cookies, check the cookie's `Domain` and `Secure` attributes match the canonical URL.

## Fix in the right order

1. Capture the loop with `curl` so you know which URLs are involved.
2. Write down every place that can redirect: CDN rules, the CDN's SSL mode, the load balancer, the web server config, `.htaccess`, the app or CMS settings, and plugins.
3. Choose the canonical URL (scheme and hostname) and keep exactly **one** layer responsible for each redirect, ideally the one closest to the visitor.
4. Test with `curl` again, then in a private window.
5. Once it's fixed, use **302** while testing and switch to **301** when you're sure. A wrong 301 gets cached by browsers.

> **Tip:** A good final state has at most one redirect for any URL a visitor might type: `http://example.com`, `http://www.example.com` and `https://example.com` should each reach the canonical `https://www.example.com` (or the non-www version) in a single hop. Fewer hops are faster, and Google follows them more reliably.

## Choosing the right redirect code

Loops are only one way redirects go wrong. The status code you choose also matters, for browsers and for search engines:

| Code | Meaning | Method kept? | Cached by browsers? | Use it for |
| --- | --- | --- | --- | --- |
| `301` | Moved permanently | Usually changes POST to GET | Yes, often for a long time | Final HTTPS and canonical-host redirects, moved pages |
| `302` | Found (temporary) | Usually changes POST to GET | No, unless headers say so | Testing, temporary moves, login redirects |
| `307` | Temporary redirect | Yes | No, unless headers say so | Temporary redirects of forms and API calls |
| `308` | Permanent redirect | Yes | Yes | Permanent moves of API endpoints that receive POST |

For SEO, Google treats `301` and `308` as strong signals that the target is the new canonical URL, and `302` and `307` as weaker, temporary ones. Chains of several hops waste crawl time and slow every visitor down, so point old URLs straight at their final destination rather than through each redirect you've added over the years.

### Check for chains, not just loops

Run the same `curl` command on your most important old URLs: the old domain, `http://` versions, and pages you moved last year. If any takes more than one hop to reach a `200`, update the first redirect to point at the final URL. On a CMS, redirect plugins often keep old rules after a page moves twice, which is how chains build up.

## Keep an eye on it

Redirect loops often appear after a change somewhere else. Someone toggles a CDN setting, a plugin update adds its own HTTPS redirect, or a site moves behind a new load balancer. An outside check notices straight away. [Uptime monitoring](/uptime-monitoring) follows up to five redirects, as a browser would, and records a loop as a "Too many redirects" error in the site's history. The [SSL checker](/tools/ssl-checker) confirms the origin certificate is valid before you switch a CDN to Full (strict).

For other errors that take sites down, see [why is my website down?](/blog/why-is-my-website-down)
