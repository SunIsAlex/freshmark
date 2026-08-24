# Freshmark VPS runtime

The `vps` branch serves the generated site with Nginx and runs the existing
request handlers in one loopback-only Node process. A small atomic file store
under `/var/lib/freshmark-api` replaces Netlify Blobs.

Runtime layout:

```text
/opt/freshmark                         deployment/control checkout
/var/www/freshmark/current             atomic symlink to the active release
/var/www/freshmark/releases/*          complete static + API releases
/var/www/freshmark/build-cache/images  shared responsive-image build cache
/var/www/freshmark/build-cache/pdfs    shared content-addressed PDF cache
/var/lib/freshmark-api                 private persistent data
/etc/freshmark-api.env                 root-readable runtime configuration
/etc/freshmark-build.env               root-readable build configuration
/etc/systemd/system/freshmark-api.service
/etc/nginx/sites-available/freshmark.sunisalex.org
/etc/nginx/conf.d/freshmark-rate-limits.conf
```

Install `nginx-site.conf` after issuing the Let's Encrypt certificate. The
site uses HTTP/3 with HTTP/2 fallback, compresses text assets, gives versioned
assets an immutable one-year cache lifetime, and redirects plain HTTP requests
to HTTPS. HTTP/3 requires Nginx 1.25 or newer built with
`--with-http_v3_module`, plus inbound UDP port 443.

Install the build-time PDF renderer and Chinese font once on the host:

```bash
apt-get update
apt-get install -y weasyprint fonts-noto-cjk
weasyprint --version
```

`deploy.sh` checks for WeasyPrint before creating a release. Each normal or
incremental site build then emits an `index.pdf` beside every published article.
The shared cache skips WeasyPrint for articles whose content and PDF dependencies
did not change between releases.

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

## Atomic deployments

`deploy.sh` fetches and fast-forwards the `vps` branch, exports that exact Git
revision into a new release directory, installs dependencies, builds and
validates the site, and removes build-only dependencies. Only after every step
succeeds does it replace `/var/www/freshmark/current` with one atomic rename.
Nginx therefore sees either the complete old release or the complete new
release, never a partially rebuilt `public/` directory.

The release also contains the API source and production dependencies. After the
link switch, the script restarts `freshmark-api.service` and checks
`/api/health`. A failed restart or health check restores the previous symlink
and starts the previous API release again. The newest three complete releases
are retained by default.

The build uses `/var/cache/freshmark-npm` for npm cache and logs by default.
This keeps npm out of `/root/.npm`, which can be inaccessible when deployment
is launched through a hardened systemd service. Override it only with an
absolute, dedicated directory through `FRESHMARK_NPM_CACHE_DIR`.

Create the build-only environment file:

```bash
install -m 0600 /dev/null /etc/freshmark-build.env
printf '%s\n' \
  'FRESHMARK_BASE_URL=https://freshmark.sunisalex.org' \
  'FRESHMARK_NETLIFY_FUNCTIONS=true' \
  'FRESHMARK_COMMENTS=true' \
  'FRESHMARK_COMMENTS_AUTH=true' \
  >/etc/freshmark-build.env
```

For the one-time migration from `/opt/freshmark/public`, first create a release
without touching the currently running API:

```bash
chmod 0755 /opt/freshmark/ops/freshmark-vps/deploy.sh
/opt/freshmark/ops/freshmark-vps/deploy.sh --no-api-restart
```

Then install the release-aware Nginx and systemd files:

```bash
openssl rand -out /etc/nginx/quic_host.key 80
chmod 0600 /etc/nginx/quic_host.key
install -m 0644 /opt/freshmark/ops/freshmark-vps/freshmark-api.service \
  /etc/systemd/system/freshmark-api.service
install -m 0644 /opt/freshmark/ops/freshmark-vps/nginx-site.conf \
  /etc/nginx/sites-available/freshmark.sunisalex.org
systemctl daemon-reload
nginx -t
systemctl restart freshmark-api.service
systemctl reload nginx
ufw allow 443/udp comment 'HTTP/3 QUIC'
attempt=0
until curl --silent --fail http://127.0.0.1:8790/api/health; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 20 ] || exit 1
  sleep 1
done
```

Normal deployments then require one command:

```bash
/opt/freshmark/ops/freshmark-vps/deploy.sh
```

### Automatic deployments

Install and enable the deployment timer to check `origin/vps` once per minute:

```bash
install -m 0644 /opt/freshmark/ops/freshmark-vps/freshmark-deploy.service \
  /etc/systemd/system/freshmark-deploy.service
install -m 0644 /opt/freshmark/ops/freshmark-vps/freshmark-deploy.timer \
  /etc/systemd/system/freshmark-deploy.timer
systemctl daemon-reload
systemctl enable --now freshmark-deploy.timer
```

The timer reuses `deploy.sh`, so concurrent runs are locked and an already
active revision exits without rebuilding. A pushed `vps` commit is normally
deployed within about one minute. Inspect the schedule and recent logs with:

```bash
systemctl list-timers freshmark-deploy.timer
journalctl -u freshmark-deploy.service -n 100 --no-pager
```

Redeploy the same commit after changing `/etc/freshmark-build.env` with
`--force`. Roll back to the most recent previous release, or to an explicit
release directory name, with:

```bash
/opt/freshmark/ops/freshmark-vps/deploy.sh --rollback
/opt/freshmark/ops/freshmark-vps/deploy.sh --rollback 20260729T120000Z-0123456789ab
```

The shared image and PDF caches are outside every release, so rollbacks do not
discard expensive responsive-image or PDF rendering work. Persistent accounts,
sessions, comments, and view counts remain under `/var/lib/freshmark-api` and are never copied or
deleted by the deployment script.

The file store implements the subset of the Netlify Blobs API used by
Freshmark: strong reads, conditional JSON writes, and deletion. Each value is
written to a temporary file and atomically renamed. File names are SHA-256
digests of keys; the original key remains inside the private record to defend
against accidental collisions.
