const SUPPORTED_TEMPLATES = new Set(["vanilla-ts", "react", "react-ts", "static"]);

export const DEFAULT_PLAYGROUND_TEMPLATE = "vanilla-ts";

export function parseCodeFenceMeta(lang, meta = "") {
  const tokens = tokenizeMeta(meta);
  const flags = new Set();
  const attrs = new Map();

  for (const token of tokens) {
    const separatorIndex = token.indexOf("=");
    if (separatorIndex === -1) {
      flags.add(token);
      continue;
    }

    const key = token.slice(0, separatorIndex);
    const value = stripQuotes(token.slice(separatorIndex + 1));
    attrs.set(key, value);
  }

  const hasPlayground = flags.has("playground");
  const hasPreview = flags.has("preview");

  if (!hasPlayground && !hasPreview) {
    return { interactive: false, readonly: flags.has("readonly") };
  }

  if (hasPlayground && hasPreview) {
    throw new Error("Code fence cannot use both `playground` and `preview`.");
  }

  const template = attrs.get("template") ?? DEFAULT_PLAYGROUND_TEMPLATE;
  if (!SUPPORTED_TEMPLATES.has(template)) {
    throw new Error(
      `Unsupported playground template \`${template}\`. Supported templates: ${Array.from(
        SUPPORTED_TEMPLATES,
      ).join(", ")}.`,
    );
  }

  return {
    interactive: true,
    mode: hasPreview ? "preview" : "playground",
    file: attrs.get("file"),
    playgroup: attrs.get("playgroup"),
    template,
    hasTemplate: attrs.has("template"),
    lang,
  };
}

export function inferPlaygroundFile({ file, lang, mode, template }) {
  if (file) return normalizePlaygroundFile(file);

  if (template === "react-ts") return "/App.tsx";
  if (template === "react") return "/App.jsx";

  if (template === "static") {
    if (lang === "css") return "/styles.css";
    if (lang === "js" || lang === "javascript") return "/index.js";
    return "/index.html";
  }

  if (lang === "html") return "/index.html";
  if (lang === "css") return "/styles.css";
  if (lang === "js" || lang === "javascript") return "/index.js";
  if (lang === "tsx") return "/App.tsx";
  if (lang === "jsx") return "/App.jsx";
  if (mode === "preview") return "/index.ts";
  return "/index.ts";
}

export function normalizePlaygroundFile(file) {
  const normalized = file.trim();
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function tokenizeMeta(meta) {
  return Array.from(meta.matchAll(/"[^"]*"|'[^']*'|[^\s]+/g), (match) => match[0]);
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
