import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const SLUG_RE = /^[a-zA-Z0-9_/-]{1,160}$/;
const KEY = (slug: string) => `likes:${slug}`;

function extractSlug(req: VercelRequest): string {
  // Prefer Vercel's parsed query param (works on Next-style routes).
  const raw = req.query.slug;
  if (Array.isArray(raw)) return raw.join("/");
  if (typeof raw === "string" && raw.length > 0) return raw;
  // Fallback: parse from req.url. Generic /api/ directory on non-Next
  // projects may not populate req.query for catch-all segments.
  const url = req.url ?? "";
  const path = url.split("?")[0] ?? "";
  const m = path.match(/^\/api\/likes\/(.+)$/);
  if (!m) return "";
  return decodeURIComponent(m[1]);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const slug = extractSlug(req);
  if (!SLUG_RE.test(slug) || slug.includes("..")) {
    return res
      .status(400)
      .json({ error: "bad slug", received: slug, url: req.url });
  }

  if (req.method === "GET") {
    const count = (await redis.get<number>(KEY(slug))) ?? 0;
    // Disable any CDN/proxy caching — count changes on every POST and we
    // have no way to invalidate the edge cache from within the function.
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ count });
  }

  if (req.method === "POST") {
    const body =
      typeof req.body === "string"
        ? safeParse(req.body)
        : (req.body as Record<string, unknown> | undefined);
    const delta = Number(body?.delta);
    if (!Number.isInteger(delta) || delta < 1 || delta > 20) {
      return res.status(400).json({ error: "delta must be integer in [1,20]" });
    }
    const count = await redis.incrby(KEY(slug), delta);
    return res.status(200).json({ count });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}

function safeParse(s: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
