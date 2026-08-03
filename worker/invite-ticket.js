// capsule.ad/i/<CODE> — the invitation ticket.
//
// Cloudflare runs this in front of the site for /i/* only. The page itself is
// rendered by the `invite-page` edge function (it holds the keys to look the
// code up); this worker exists so the invitation is served from capsule.ad
// under our own headers — Supabase forces text/plain and a sandbox CSP on
// function responses, which no browser would render.
//
// Deploy:  npx wrangler login  &&  npx wrangler deploy   (from this folder)

const RENDERER = "https://exykhwfcacdvaacexrqy.functions.supabase.co/invite-page";
const SITE = "https://capsule.ad";

export default {
  async fetch(request) {
    const code = new URL(request.url).pathname.replace(/^\/i\/?/, "").split("/")[0];

    try {
      const upstream = await fetch(`${RENDERER}?code=${encodeURIComponent(code)}`, {
        headers: { "user-agent": request.headers.get("user-agent") ?? "" },
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=60",
          "x-robots-tag": "noindex",   // an invitation is not a page to be found
        },
      });
    } catch {
      // Better the front door than an error page.
      return Response.redirect(SITE, 302);
    }
  },
};
