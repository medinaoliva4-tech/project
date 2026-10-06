// Fuente del service worker; __VERSION__ se reemplaza con el commit del deploy.
const SW_SOURCE = "// Project service worker\n// - Navegación: network-first (la data siempre fresca), fallback a cache si no hay red.\n// - Assets estáticos de Next (_next/static) y /icons: cache-first (tienen hash).\n// - Nueva versión: espera a que el usuario toque \"Actualizar\" (SKIP_WAITING).\nconst VERSION = \"__VERSION__\";\nconst STATIC_CACHE = `project-static-${VERSION}`;\nconst PAGES_CACHE = `project-pages-${VERSION}`;\n\nself.addEventListener(\"install\", (event) => {\n  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll([\"/icons/icon-192.png\", \"/logo.svg\"])));\n});\n\nself.addEventListener(\"activate\", (event) => {\n  event.waitUntil(\n    (async () => {\n      const keys = await caches.keys();\n      await Promise.all(\n        keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)),\n      );\n      await self.clients.claim();\n    })(),\n  );\n});\n\nself.addEventListener(\"message\", (event) => {\n  if (event.data === \"SKIP_WAITING\") self.skipWaiting();\n});\n\nself.addEventListener(\"fetch\", (event) => {\n  const { request } = event;\n  if (request.method !== \"GET\") return;\n  const url = new URL(request.url);\n  if (url.origin !== self.location.origin) return;\n  if (url.pathname.startsWith(\"/api/\") || url.pathname.startsWith(\"/auth/\")) return;\n\n  if (url.pathname.startsWith(\"/_next/static/\") || url.pathname.startsWith(\"/icons/\")) {\n    event.respondWith(\n      caches.open(STATIC_CACHE).then(async (cache) => {\n        const hit = await cache.match(request);\n        if (hit) return hit;\n        const res = await fetch(request);\n        if (res.ok) cache.put(request, res.clone());\n        return res;\n      }),\n    );\n    return;\n  }\n\n  if (request.mode === \"navigate\") {\n    event.respondWith(\n      (async () => {\n        try {\n          const res = await fetch(request);\n          if (res.ok) (await caches.open(PAGES_CACHE)).put(request, res.clone());\n          return res;\n        } catch {\n          const hit = await caches.match(request);\n          return (\n            hit ||\n            new Response(\n              '<html><body style=\"background:#0b0b0b;color:#efe6d8;font-family:system-ui;display:grid;place-items:center;height:100vh\"><p>Sin conexión. Intenta de nuevo en un momento.</p></body></html>',\n              { headers: { \"Content-Type\": \"text/html; charset=utf-8\" } },\n            )\n          );\n        }\n      })(),\n    );\n  }\n});\n";


export const dynamic = "force-static";

export function GET() {
  const version = (process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 8);
  return new Response(SW_SOURCE.replace("__VERSION__", version), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
