/*
 * iOS Chrome and Edge swipe back through WKWebView's back-forward list.
 * A pushState entry is not restored in place: the gesture loads that URL, so
 * the client router's popstate path never runs. WebKit skips script-created
 * items that had no user gesture (bug 248303); Chromium iOS does the same
 * ("skip automatic items"). A gesture-timed pushState still comes back as a
 * document load on device, and history.back() in desktop WebKit does not.
 *
 * Link taps in CriOS/EdgiOS stay ordinary document navigations so the list
 * holds real documents. Those can return from the back/forward cache with
 * scroll intact. Safari and desktop keep the client router.
 */
(() => {
  if (!/CriOS|EdgiOS/.test(navigator.userAgent) || window.__iosChromeDocumentNav) return;
  window.__iosChromeDocumentNav = true;

  const allowScrollRestore = () => {
    try {
      history.scrollRestoration = "auto";
    } catch {
      /* Older WebKit can throw if the document is not fully active. */
    }
  };
  allowScrollRestore();
  // The client router sets scrollRestoration to "manual" when its module runs,
  // which is after this inline script and before DOMContentLoaded.
  document.addEventListener("DOMContentLoaded", allowScrollRestore);
  addEventListener("load", allowScrollRestore);
  document.addEventListener("astro:page-load", allowScrollRestore);
  setTimeout(allowScrollRestore, 0);

  // Capture runs before the client router's bubble listener, which would
  // preventDefault and pushState. Stopping here leaves the browser's default
  // navigation in place.
  document.addEventListener(
    "click",
    (event) => {
      const node = event.composedPath ? event.composedPath()[0] : event.target;
      const el = node instanceof Element ? node : node instanceof Node ? node.parentElement : null;
      const link = el?.closest?.("a, area") ?? null;
      if (!link) return;
      event.stopPropagation();
    },
    true,
  );
})();
