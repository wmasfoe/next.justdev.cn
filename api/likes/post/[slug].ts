import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
// Single-segment slug. Slashes in canonical post slugs are transported as "~"
// to avoid Vercel's catch-all routing issues in the bare /api/ directory.
const SLUG_RE = /^[a-zA-Z0-9_~-]{1,160}$/;
const KEY = (slug: string) => `likes:${slug}`;

function extractEncodedSlug(req: VercelRequest): string {
  const raw = req.query.slug;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0] ?? "";
  // Fallback: parse from URL when query.slug is missing.
  const path = (req.url ?? "").split("?")[0] ?? "";
  const m = path.match(/^\/api\/likes\/post\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const encoded = extractEncodedSlug(req);
  if (!SLUG_RE.test(encoded) || encoded.includes("..")) {
    return res.status(400).json({ error: "bad slug", received: encoded, url: req.url });
  }
  // Decode "~" → "/" to recover the canonical post slug used as the storage key.
  const slug = encoded.replace(/~/g, "/");

  if (req.method === "GET") {
    const count = (await redis.get<number>(KEY(slug))) ?? 0;
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
