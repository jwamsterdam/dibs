# nginx Serving Requirements (advisory)

The embedded Linux platform and its nginx configuration are a **customer responsibility**.
This document is the front-end team's advisory spec for how the static bundle should be
served for acceptable performance on constrained hardware. Watt maintains it; the platform
team applies it.

## Requirements

1. **Pre-compressed assets.** Serve Brotli (and gzip fallback) using pre-generated `.br`/`.gz`
   files rather than compressing per request (saves CPU on the device). The build can emit
   these via a Vite compression plugin (subject to dependency approval).
2. **Immutable caching for hashed assets.** `Cache-Control: public, max-age=31536000, immutable`
   for `/assets/*` (content-hashed filenames). Never long-cache `index.html`.
3. **No-cache for the entry document.** `index.html` served with `Cache-Control: no-cache` so
   new deploys are picked up.
4. **HTTP/2** enabled for multiplexed asset delivery.
5. **SPA fallback.** Unknown routes return `index.html` (client-side routing) — but API paths
   must not be shadowed by the fallback.
6. **Security headers / CSP.** Configured at this layer (see Aegis) — CSP, `X-Content-Type-Options`,
   `Referrer-Policy`, etc.

## Reference snippet (illustrative — the platform team owns the live config)

```nginx
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  gzip_static on;
  brotli_static on;
}

location / {
  add_header Cache-Control "no-cache";
  try_files $uri /index.html;
}
```
