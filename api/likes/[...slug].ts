import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const SLUG_RE = /^[a-zA-Z0-9_/-]{1,160}$/;
const KEY = (slug: string) => `likes:${slug}`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const raw = req.query.slug;
  const slug = Array.isArray(raw) ? raw.join("/") : String(raw ?? "");
  if (!SLUG_RE.test(slug) || slug.includes("..")) {
    return res.status(400).json({ error: "bad slug" });
  }

  if (req.method === "GET") {
    const count = (await redis.get<number>(KEY(slug))) ?? 0;
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=300",
    );
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
