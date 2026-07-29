# Freshmark mailer

This is the small, authenticated HTTP-to-sendmail bridge used by optional
comment email verification. It accepts only one request shape, binds to
`127.0.0.1`, validates the recipient and six-digit code, and submits a fixed
transactional template to the local Postfix queue.

Production paths:

```text
/opt/freshmark-mailer/server.mjs
/etc/freshmark-mailer.env
/etc/systemd/system/freshmark-mailer.service
/etc/nginx/snippets/freshmark-mailer.conf
/etc/nginx/sites-available/mail.sunisalex.org
```

The environment file contains one root-readable value:

```text
MAILER_TOKEN=<64 random hexadecimal characters>
```

The same value is configured in Netlify as
`FRESHMARK_MAILER_TOKEN`. The public endpoint is configured as
`FRESHMARK_MAILER_ENDPOINT`; for the production deployment this is
`https://mail.sunisalex.org/api/mail/comment-code`.

The service unit intentionally grants write access only to Postfix's local
maildrop and public socket paths. Postfix itself listens on loopback only, and
OpenDKIM signs mail from `sunisalex.org` using the `mail` selector.
