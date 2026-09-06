// capsule.ad — the two paths GitHub Pages cannot serve correctly itself.
//
//   /i/<CODE>                                  the invitation ticket
//   /.well-known/apple-app-site-association    the domain association
//
// The site is hosted on GitHub Pages, which has no way to set a response
// content-type: it serves the extension-less association file as
// application/octet-stream, and Apple requires application/json. The repo's
// `_headers` file cannot fix that — that is a Cloudflare Pages feature and
// Pages is not what serves this domain. So Cloudflare runs this worker in
// front of those two paths and nothing else.
//
// Deploy:  npx wrangler login  &&  npx wrangler deploy   (from this folder)

const RENDERER = "https://exykhwfcacdvaacexrqy.functions.supabase.co/invite-page";
const SITE = "https://capsule.ad";

// Served inline rather than proxied from the origin: a subrequest to a path
// this worker itself claims would loop. Keep in sync with the copy at
// /.well-known/apple-app-site-association — this one is what Apple actually reads.
const AASA = {
  appclips: {
    apps: ["4BGNC2AG74.com.sruper.capsule.Clip"],
  },
  applinks: {
    apps: [],
    details: [
      {
        appIDs: ["4BGNC2AG74.com.sruper.capsule"],
        components: [{ "/": "/i/*", comment: "Invitation links" }],
      },
    ],
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/apple-app-site-association") {
      return new Response(JSON.stringify(AASA), {
        headers: {
          // The whole reason this route exists.
          "content-type": "application/json",
          "cache-control": "public, max-age=3600",
          "access-control-allow-origin": "*",
        },
      });
    }

    const code = url.pathname.replace(/^\/i\/?/, "").split("/")[0];

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
