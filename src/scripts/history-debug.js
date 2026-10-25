/*
 * Opt-in history log for a real iPhone. Invisible unless this origin has
 * localStorage debug-history=1. Open any page with ?debug-history=1 to turn
 * it on (the flag sticks across navigations). ?debug-history=0 turns it off.
 */
(() => {
  const params = new URLSearchParams(location.search);
  let enabled = false;
  try {
    if (params.get("debug-history") === "0") localStorage.removeItem("debug-history");
    else if (params.get("debug-history") === "1") localStorage.setItem("debug-history", "1");
    enabled = localStorage.getItem("debug-history") === "1";
  } catch {
    enabled = params.get("debug-history") === "1";
  }
  if (!enabled || window.__historyDebugInstalled) return;
  window.__historyDebugInstalled = true;

  const started = performance.now();
  const lines = [];
  let lastPageshow = null;

  const stateText = (state) => {
    if (!state || typeof state !== "object") return "null";
    const brief = {};
    for (const key of ["index", "seq", "scrollX", "scrollY"]) {
      if (typeof state[key] === "number") brief[key] = state[key];
    }
    const extra = Object.keys(state).filter((key) => !(key in brief));
    if (extra.length) brief.keys = extra.join(",");
    return JSON.stringify(brief);
  };

  const nav = () => performance.getEntriesByType("navigation")[0];

  const panel = document.createElement("aside");
  panel.setAttribute("data-history-debug", "");
  panel.style.cssText = [
    "position:fixed",
    "left:0",
    "right:0",
    "bottom:0",
    "z-index:2147483646",
    "max-height:42vh",
    "overflow:auto",
    "box-sizing:border-box",
    "margin:0",
    "padding:8px 10px calc(8px + env(safe-area-inset-bottom))",
    "background:rgba(12,12,12,.92)",
    "color:#f2f2f2",
    "font:11px/1.35 ui-monospace,monospace",
    "white-space:pre-wrap",
    "word-break:break-word",
    "pointer-events:auto",
  ].join(";");

  const summary = document.createElement("div");
  summary.style.cssText = "position:sticky;top:0;background:#111;padding-bottom:6px";
  const log = document.createElement("div");
  const off = document.createElement("button");
  off.type = "button";
  off.textContent = "turn off";
  off.style.cssText =
    "margin-left:8px;font:inherit;color:#111;background:#eee;border:0;border-radius:4px;padding:0 6px";
  off.addEventListener("click", () => {
    try {
      localStorage.removeItem("debug-history");
    } catch {
      /* ignore */
    }
    panel.remove();
  });
  panel.append(summary, log);

  const mount = () => {
    if (!panel.isConnected) document.documentElement.append(panel);
  };

  const render = () => {
    const entry = nav();
    const ua = navigator.userAgent;
    const crios = /CriOS\/[\d.]+|EdgiOS\/[\d.]+/.exec(ua);
    const rocket = !!document.querySelector(
      'script[src*="rocket-loader"], script[data-cfasync], script[src*="email-decode"]',
    );
    const sw = navigator.serviceWorker?.controller ? "controlled" : "none";
    const mode = window.__iosChromeDocumentNav ? "document" : "client";
    let result = "loaded as " + (entry?.type || "unknown");
    if (lastPageshow === true) result = "bfcache restore (pageshow persisted=true)";
    else if (entry?.type === "back_forward")
      result = "full document load on back (nav=back_forward, persisted=false)";
    else if (lines.some((line) => /\spopstate\s/.test(line)))
      result = "same document (popstate, load did not run again)";
    const reasons = entry?.notRestoredReasons?.reasons?.map((item) => item.reason).join(",") || "";
    summary.textContent = "";
    summary.append(result + "\n");
    summary.append(
      (crios ? crios[0] : "not CriOS") +
        " mode=" +
        mode +
        " sw=" +
        sw +
        " cfScript=" +
        (rocket ? "yes" : "no") +
        " len=" +
        history.length +
        " nav=" +
        (entry?.type || "?") +
        " persisted=" +
        String(lastPageshow) +
        (reasons ? " blocked=" + reasons : "") +
        "\nstate " +
        stateText(history.state) +
        " " +
        location.pathname,
    );
    summary.append(off);
    log.textContent = lines.join("\n");
  };

  const note = (label) => {
    const entry = nav();
    lines.push(
      Math.round(performance.now() - started) +
        "ms " +
        label +
        " len=" +
        history.length +
        " nav=" +
        (entry?.type || "?") +
        " " +
        location.pathname +
        " state=" +
        stateText(history.state),
    );
    if (lines.length > 24) lines.shift();
    render();
  };

  const push = history.pushState;
  const replace = history.replaceState;
  history.pushState = function (state, title, url) {
    const result = push.apply(this, arguments);
    note("pushState " + (url == null || url === "" ? "(same)" : String(url)));
    return result;
  };
  history.replaceState = function (state, title, url) {
    const result = replace.apply(this, arguments);
    note("replaceState " + (url == null || url === "" ? "(same)" : String(url)));
    return result;
  };

  addEventListener("popstate", () => note("popstate"));
  addEventListener("pageshow", (event) => {
    lastPageshow = event.persisted;
    note("pageshow persisted=" + event.persisted);
  });
  addEventListener("pagehide", (event) => note("pagehide persisted=" + event.persisted));
  addEventListener("load", () => note("load"));
  document.addEventListener("astro:after-swap", () => {
    note("astro:after-swap");
    mount();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
  render();
  note("debug on");
})();
