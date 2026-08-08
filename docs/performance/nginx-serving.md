# Static PWA Serving Notes

Dibs can be served as a static PWA. Hosting should provide:

- HTTPS
- immutable caching for hashed assets
- short cache for `index.html`
- gzip or brotli compression
- correct service-worker cache strategy once PWA offline behavior is finalized
