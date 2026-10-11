# sruper.com migration runbook

This change moves the existing GitHub Pages site to `sruper.com`. GitHub Pages
remains the origin for all ordinary website requests. The Cloudflare Worker is
limited to the invitation and AASA paths listed in `worker/wrangler.toml`; it is
not an HTML proxy and has no root-domain custom route.

Nothing in this runbook has been deployed.

## Verified pre-deployment state

Checked on 2026-10-11:

- GitHub Pages publishes `main` from `crcl-ai/web-cercle` and currently uses the
  legacy domain in production.
- `sruper.com` is delegated to Cloudflare but has no apex A, AAAA, or CNAME
  answer.
- `www.sruper.com` is proxied by Cloudflare and currently redirects to
  `https://circleios.app/`; that redirect must be removed.
- The source `CNAME` in this branch is `sruper.com`.
- The Worker declares only `sruper.com/i/*` and
  `sruper.com/.well-known/apple-app-site-association`.

## Activation order

1. In GitHub organization settings, verify ownership of `sruper.com` with the
   requested DNS TXT record. Do this before pointing the domain at Pages.
2. In Cloudflare DNS, add the apex records below as **DNS only** while GitHub
   provisions its origin certificate:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `crcl-ai.github.io` |

3. Merge and push the verified source to `main`. In **Repository Settings →
   Pages**, confirm that the publishing source is `main` at `/`, the custom
   domain is `sruper.com`, and HTTPS enforcement becomes available. Do not add
   a second CNAME or change the Pages branch.
4. Wait for the Pages deployment and certificate, then verify the home, privacy,
   terms, and contact URLs over HTTPS while the records are still DNS only.
   GitHub Pages will redirect a correctly configured `www` variant to the apex.
5. Remove the current Cloudflare rule that sends `www.sruper.com` to
   `circleios.app`. Turn the `sruper.com` and `www` records to **Proxied** so
   Cloudflare Worker routes can execute in front of the existing Pages origin.
6. From `worker/`, authenticate Wrangler and deploy the existing
   `capsule-invite-ticket` Worker. Retaining its internal Worker name lets the
   deployment replace the old route configuration. In **Workers & Pages →
   Settings → Domains & Routes**, confirm there are exactly two routes and no
   `sruper.com` or `www.sruper.com` custom domain.
7. Deploy the reviewed Supabase functions with public invocation enabled:

   ```text
   supabase functions deploy invite-page --no-verify-jwt
   supabase functions deploy invite-pass --no-verify-jwt
   ```

   The Worker explicitly requests `brand=Circle`, so invitation pages and
   Wallet passes use Circle even before the optional `BRAND=Circle` fallback
   secret is changed.
8. After the new domain passes every check below, configure a Cloudflare Single
   Redirect for the legacy domain. Preserve the request path and query string,
   use status 301, and redirect to `https://sruper.com`. Remove any old Worker
   routes on the legacy zone if they remain.

## Acceptance checks after activation

```text
curl -fsSIL https://sruper.com/
curl -fsSIL https://sruper.com/privacy
curl -fsSIL https://sruper.com/terms
curl -fsSIL https://sruper.com/contact
curl -fsSI https://sruper.com/.well-known/apple-app-site-association
curl -fsS https://sruper.com/.well-known/apple-app-site-association
curl -fsSIL https://www.sruper.com/privacy
curl -fsSIL https://capsule.ad/privacy
curl -fsS https://sruper.com/i/VALID_CODE
```

Expected results:

- the four public/App Review URLs finish at HTTP 200 over HTTPS;
- `www.sruper.com/*` redirects to the same path on `sruper.com`;
- AASA returns HTTP 200 directly with `Content-Type: application/json` and both
  Circle identifiers;
- a valid invitation renders Circle copy, and its Wallet action downloads a
  Circle-branded `application/vnd.apple.pkpass` response;
- the legacy domain redirects to the equivalent `sruper.com` path;
- unrelated paths do not invoke the Worker.

Check the home, legal pages, and one invitation in narrow mobile and wide
desktop viewports before considering the migration complete.

## Access required

Activation requires a GitHub repository/organization administrator, Cloudflare
DNS/Rules/Workers access for both zones, Wrangler authentication, and Supabase
deployment access. Source preparation and local verification require none of
those production mutations.
