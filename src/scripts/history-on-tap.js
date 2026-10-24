/*
 * iOS Chrome/Edge only keep a history entry on swipe-back when pushState runs
 * during the tap. A copy of the current URL that is retargeted with
 * replaceState after the tap is one step in the session history, but WebKit
 * loads that previous URL as a new document instead of firing a same-document
 * popstate. before-preparation still runs inside the click: push the
 * destination then, already carrying { index, scrollX, scrollY }. The router
 * writes that same entry when the URL still differs. Back uses Astro's normal
 * popstate path, including scroll restoration, with no document reload.
 */
(() => {
  const activation = navigator.userActivation;
  if (!activation || window.__historyOnTapInstalled) return;
  window.__historyOnTapInstalled = true;

  const push = history.pushState;
  const replace = history.replaceState;

  const initial = history.state;
  const initialIndex = initial && typeof initial.index === "number" ? initial.index : 0;
  // Router pushState that should fill the entry created during this tap.
  let waiting = false;
  // The new entry must not keep the page we're leaving's scroll offset.
  let sealScroll = false;
  // Monotonic id for each entry. The router's private index does not advance
  // when the destination was pushed during the tap, so popstate rewrites
  // `index` to the value that private counter will compare.
  let nextSeq = initial && typeof initial.seq === "number" ? initial.seq : initialIndex;
  let astroIndex = initialIndex;

  const sameUrl = (url) => {
    if (url == null || url === "") return true;
    try {
      return new URL(url, location.href).href === location.href;
    } catch {
      return false;
    }
  };

  history.replaceState = function (state, title, url) {
    if (
      sealScroll &&
      state &&
      typeof state === "object" &&
      sameUrl(url) &&
      typeof state.scrollX === "number"
    ) {
      state = { ...state, scrollX: 0, scrollY: 0 };
    }
    return replace.call(this, state, title, url);
  };

  history.pushState = function (state, title, url) {
    if (waiting) {
      waiting = false;
      if (state && typeof state.index === "number") {
        astroIndex = state.index;
        state = { ...state, seq: nextSeq };
      }
      return replace.call(this, state, title, url);
    }
    if (state && typeof state.index === "number") {
      astroIndex = state.index;
      nextSeq = Math.max(nextSeq, state.index);
      if (typeof state.seq !== "number") state = { ...state, seq: nextSeq };
    }
    return push.call(this, state, title, url);
  };

  addEventListener(
    "popstate",
    (event) => {
      waiting = false;
      sealScroll = false;
      const state = event.state;
      if (!state || typeof state.index !== "number") return;
      const seq = typeof state.seq === "number" ? state.seq : state.index;
      const forward = seq > nextSeq;
      const wouldBeForward = state.index > astroIndex;
      if (forward !== wouldBeForward) {
        if (forward) astroIndex += 1;
        replace.call(history, { ...state, index: astroIndex, seq }, "");
      } else {
        astroIndex = state.index;
      }
      nextSeq = seq;
    },
    true,
  );

  const release = () => {
    waiting = false;
    sealScroll = false;
  };
  document.addEventListener("astro:after-swap", release);
  document.addEventListener("astro:page-load", release);

  document.addEventListener("astro:before-preparation", (event) => {
    if (event.navigationType !== "push" || event.formData || !activation.isActive) return;
    const to = event.to;
    if (!to || typeof to.href !== "string" || typeof to.pathname !== "string") return;
    if (/\.\w+$/.test(to.pathname)) return;
    if (location.href === to.href) return;

    const current = history.state;
    const index = current && typeof current.index === "number" ? current.index : 0;
    const seq = current && typeof current.seq === "number" ? current.seq : index;
    const scrollX =
      current && typeof current.scrollX === "number" ? current.scrollX : window.scrollX;
    const scrollY =
      current && typeof current.scrollY === "number" ? current.scrollY : window.scrollY;
    replace.call(history, { ...current, index, seq, scrollX, scrollY }, "", location.href);
    nextSeq = seq;

    if (!waiting) {
      nextSeq += 1;
      push.call(history, { index: nextSeq, seq: nextSeq, scrollX: 0, scrollY: 0 }, "", to.href);
      waiting = true;
      sealScroll = true;
    } else {
      nextSeq += 1;
      replace.call(history, { index: nextSeq, seq: nextSeq, scrollX: 0, scrollY: 0 }, "", to.href);
    }

    const load = event.loader;
    event.loader = async () => {
      await load();
      if (event.defaultPrevented && waiting && !event.signal.aborted) {
        waiting = false;
        sealScroll = false;
        replace.call(history, history.state, "", event.to.href);
      }
    };
  });
})();
