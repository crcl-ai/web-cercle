// sruper.com — the two paths GitHub Pages cannot serve itself.
//
//   /i/<CODE>                                  the invitation ticket
//   /.well-known/apple-app-site-association    the domain association
//
// Every ordinary website request goes directly to GitHub Pages. This Worker
// has no root-domain route and does not rewrite website HTML at runtime.

const RENDERER = "https://exykhwfcacdvaacexrqy.functions.supabase.co/invite-page";
const SITE = "https://sruper.com";

// Maintain parity with /.well-known/apple-app-site-association. The Circle IDs
// are first; the legacy IDs remain during the app migration.
const AASA = {
  appclips: {
    apps: [
      "4BGNC2AG74.com.sruper.crcl.Clip",
      "4BGNC2AG74.com.sruper.capsule.Clip",
    ],
  },
  applinks: {
    apps: [],
    details: [
      {
        appIDs: [
          "4BGNC2AG74.com.sruper.crcl",
          "4BGNC2AG74.com.sruper.capsule",
        ],
        components: [{ "/": "/i/*", comment: "Invitation links" }],
      },
    ],
  },
};

const responseHeaders = {
  "access-control-allow-origin": "*",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/apple-app-site-association") {
      return new Response(JSON.stringify(AASA), {
        headers: {
          ...responseHeaders,
          "content-type": "application/json",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (!url.pathname.startsWith("/i/")) {
      return new Response("Not found", { status: 404, headers: responseHeaders });
    }

    const code = url.pathname.replace(/^\/i\/?/, "").split("/")[0];

    try {
      const upstream = await fetch(
        `${RENDERER}?code=${encodeURIComponent(code)}&brand=Circle`,
        { headers: { "user-agent": request.headers.get("user-agent") ?? "" } },
      );
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          ...responseHeaders,
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=60",
          "x-robots-tag": "noindex",
        },
      });
    } catch {
      return Response.redirect(SITE, 302);
    }
  },
};
