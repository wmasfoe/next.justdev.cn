import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Normalize a blog entry to a public slug.
 * Supports directory-based posts like `src/content/blog/my-post/index.md`.
 */
export function normalizeBlogSlug(id: string, filePath?: string) {
  const source = filePath
    ? filePath
        .replace(BLOG_PATH, "")
        .replace(/^\/+/, "")
        .replace(/\.(md|mdx)$/u, "")
    : id;

  return source
    .replace(/\/index$/u, "")
    .split("/")
    .filter((segment) => segment !== "")
    .filter((segment) => !segment.startsWith("_"))
    .map((segment) => slugifyStr(segment))
    .join("/");
}

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(id: string, filePath: string | undefined, includeBase = true) {
  const slug = normalizeBlogSlug(id, filePath);
  const basePath = includeBase ? "/posts" : "";

  return [basePath, slug].join("/");
}
