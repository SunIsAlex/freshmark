# Freshmark VPS runtime

The `vps` branch serves the generated site with Nginx and runs the existing
request handlers in one loopback-only Node process. A small atomic file store
under `/var/lib/freshmark-api` replaces Netlify Blobs.

Runtime layout:

```text
/opt/freshmark                         checked-out vps branch
/var/lib/freshmark-api                 private persistent data
/etc/freshmark-api.env                 root-readable runtime configuration
/etc/systemd/system/freshmark-api.service
/etc/nginx/sites-available/freshmark.sunisalex.org
/etc/nginx/conf.d/freshmark-rate-limits.conf
```

Install `nginx-site.conf` after issuing the Let's Encrypt certificate. The
site uses HTTP/2 over TLS, compresses text assets, gives versioned assets an
immutable one-year cache lifetime, and redirects plain HTTP requests to HTTPS.

Required environment:

```text
NODE_ENV=production
FRESHMARK_API_HOST=127.0.0.1
FRESHMARK_API_PORT=8790
FRESHMARK_DATA_DIR=/var/lib/freshmark-api
FRESHMARK_NETLIFY_FUNCTIONS=true
FRESHMARK_COMMENTS=true
FRESHMARK_COMMENTS_AUTH=true
FRESHMARK_MAILER_ENDPOINT=https://mail.sunisalex.org/api/mail/comment-code
FRESHMARK_MAILER_TOKEN=<shared mailer token>
FRESHMARK_COMMENTS_ADMIN_TOKEN=<independent random token>
```

Build the static site with:

```bash
FRESHMARK_BASE_URL=https://freshmark.sunisalex.org \
FRESHMARK_NETLIFY_FUNCTIONS=true \
FRESHMARK_COMMENTS=true \
FRESHMARK_COMMENTS_AUTH=true \
npm run build
```

The file store implements the subset of the Netlify Blobs API used by
Freshmark: strong reads, conditional JSON writes, and deletion. Each value is
written to a temporary file and atomically renamed. File names are SHA-256
digests of keys; the original key remains inside the private record to defend
against accidental collisions.
