/*
 * iOS Chrome/Edge hide pushState entries that were not created during a tap.
 * The client router pushes only after fetch(), so the edge swipe skips every
 * in-site page and lands on the first full load. before-preparation still runs
 * inside the click: push a copy of this entry then, and let the router's later
 * pushState replace that same entry. View transitions are unchanged.
 * Inline this before the ClientRouter module so the wrapper is installed first.
 */
(() => {
  const activation = navigator.userActivation;
  if (!activation || window.__historyOnTapInstalled) return;
  window.__historyOnTapInstalled = true;

  const push = history.pushState;
  const replace = history.replaceState;
  // True while an entry created during a tap is waiting for the router's push.
  let waiting = false;

  history.pushState = function (state, title, url) {
    if (!waiting) return push.call(this, state, title, url);
    waiting = false;
    return replace.call(this, state, title, url);
  };

  // A back/forward that arrives before the router writes the new entry means
  // that navigation was abandoned. Don't retarget whatever entry is current.
  addEventListener(
    "popstate",
    () => {
      waiting = false;
    },
    true,
  );

  document.addEventListener("astro:before-preparation", (event) => {
    if (event.navigationType !== "push" || event.formData || !activation.isActive) return;
    const to = event.to;
    if (!to || typeof to.pathname !== "string") return;
    // A file link (PDF, feed, markdown) is not swapped in place. Leave it alone
    // so a full load does not stack on top of a provisional entry.
    if (/\.\w+$/.test(to.pathname)) return;
    // Already on this URL: the router moved the address itself.
    if (location.href === to.href) return;

    if (!waiting) {
      push.call(history, history.state, "", location.href);
      waiting = true;
    }

    const load = event.loader;
    event.loader = async () => {
      await load();
      // The router is about to load this URL in full (failed fetch, or the
      // next page has no client router). Point the provisional entry there
      // first so that load replaces it instead of leaving a duplicate behind.
      if (event.defaultPrevented && waiting && !event.signal.aborted) {
        waiting = false;
        replace.call(history, history.state, "", to.href);
      }
    };
  });
})();
