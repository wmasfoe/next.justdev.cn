const SUPPORTED_TEMPLATES = new Set(["vanilla", "vanilla-ts", "react", "react-ts", "static"]);
const SUPPORTED_LAYOUTS = new Set(["row", "col"]);

export const DEFAULT_PLAYGROUND_TEMPLATE = "vanilla-ts";
export const DEFAULT_PLAYGROUND_LAYOUT = "row";

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

  if (flags.has("row") && flags.has("col")) {
    throw new Error("Code fence cannot use both `row` and `col` layout flags.");
  }

  const layoutFlag = flags.has("col") ? "col" : flags.has("row") ? "row" : null;
  const layoutAttr = attrs.get("layout");
  if (layoutAttr && !SUPPORTED_LAYOUTS.has(layoutAttr)) {
    throw new Error(
      `Unsupported playground layout \`${layoutAttr}\`. Supported layouts: ${Array.from(
        SUPPORTED_LAYOUTS,
      ).join(", ")}.`,
    );
  }
  const layout = layoutFlag ?? layoutAttr ?? DEFAULT_PLAYGROUND_LAYOUT;

  const hideResult = flags.has("hideResult") || flags.has("hide-result");

  return {
    interactive: true,
    mode: hasPreview ? "preview" : "playground",
    file: attrs.get("file"),
    playgroup: attrs.get("playgroup"),
    template,
    hasTemplate: attrs.has("template"),
    layout,
    hasLayout: layoutFlag !== null || attrs.has("layout"),
    hideResult,
    hasHideResult: hideResult,
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

  if (template === "vanilla") {
    if (lang === "html") return "/index.html";
    if (lang === "css") return "/styles.css";
    return "/index.js";
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
