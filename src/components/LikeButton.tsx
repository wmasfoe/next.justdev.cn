import { useCallback, useEffect, useId, useRef, useState } from "react";

const MAX_LIKES = 20;
const DEBOUNCE_MS = 1000;

type Props = { slug: string };

const storageKey = (slug: string) => `likes:${slug}`;
// Encode "/" as "~" so the slug is always a single URL segment, then
// percent-encode each segment for any other reserved chars.
const encodeSlug = (s: string) => s.split("/").map(encodeURIComponent).join("~");
const apiUrl = (slug: string) => `/api/likes/post/${encodeSlug(slug)}`;

export default function LikeButton({ slug }: Props) {
  const [serverTotal, setServerTotal] = useState(0);
  const [localCount, setLocalCount] = useState(0);
  const pendingRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const stored = Number(localStorage.getItem(storageKey(slug)) ?? 0);
    if (Number.isInteger(stored) && stored > 0) {
      setLocalCount(Math.min(MAX_LIKES, stored));
    }
    let cancelled = false;
    fetch(apiUrl(slug))
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d: { count?: number }) => {
        if (!cancelled && typeof d.count === "number") {
          setServerTotal(d.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const delta = pendingRef.current;
    if (delta <= 0 || inFlightRef.current) return;
    pendingRef.current = 0;
    inFlightRef.current = true;
    try {
      const res = await fetch(apiUrl(slug), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { count: number };
      setServerTotal(data.count);
      const committed = Math.min(
        MAX_LIKES,
        Number(localStorage.getItem(storageKey(slug)) ?? 0) + delta,
      );
      localStorage.setItem(storageKey(slug), String(committed));
    } catch {
      setServerTotal((t) => Math.max(0, t - delta));
      setLocalCount((c) => Math.max(0, c - delta));
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current > 0) {
        timerRef.current = setTimeout(flush, DEBOUNCE_MS);
      }
    }
  }, [slug]);

  useEffect(() => {
    const beacon = () => {
      if (pendingRef.current <= 0) return;
      const delta = pendingRef.current;
      const committed = Math.min(
        MAX_LIKES,
        Number(localStorage.getItem(storageKey(slug)) ?? 0) + delta,
      );
      localStorage.setItem(storageKey(slug), String(committed));
      pendingRef.current = 0;
      const blob = new Blob([JSON.stringify({ delta })], {
        type: "application/json",
      });
      navigator.sendBeacon(apiUrl(slug), blob);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") beacon();
    };
    window.addEventListener("pagehide", beacon);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", beacon);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [slug]);

  const onClick = () => {
    if (localCount >= MAX_LIKES) return;
    setLocalCount((c) => Math.min(MAX_LIKES, c + 1));
    setServerTotal((t) => t + 1);
    pendingRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  };

  const fillPercent = Math.min(100, (localCount / MAX_LIKES) * 100);
  const isMax = localCount >= MAX_LIKES;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isMax}
      aria-label={
        isMax
          ? `Liked (max ${MAX_LIKES}). Total ${serverTotal}.`
          : `Like this post (${localCount}/${MAX_LIKES}). Total ${serverTotal}.`
      }
      className="group inline-flex items-center gap-1 bg-transparent px-2 py-1 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-default disabled:hover:scale-100 xl:gap-2 xl:px-3 xl:py-1.5"
    >
      <HeartSvg fillPercent={fillPercent} trackMouse={!isMax} className="block h-6 w-auto xl:h-9" />
      <span className="tabular-nums text-xs text-foreground/70 xl:text-sm">{serverTotal}</span>
    </button>
  );
}

const HEART_PATH =
  "M13.2537 0.0255029C23.4033 0.0255029 25.0273 10.5191 25.0273 10.5191C25.0273 10.5191 26.6512 -0.60088 37.6129 0.0255029C44.3441 0.410148 48.7484 6.32169 48.9804 12.1981C49.7924 32.7656 28.7678 41.5 25.0273 41.5C21.2868 41.5 -0.549833 32.3459 1.07416 12.1981C1.54782 6.32169 6.29929 0.0255029 13.2537 0.0255029Z";

// Max pupil offset from neutral position, in viewBox units (heart is 50x42).
const MAX_PUPIL_OFFSET = 1.6;

function HeartSvg({
  fillPercent,
  trackMouse,
  className,
}: {
  fillPercent: number;
  trackMouse: boolean;
  className?: string;
}) {
  // useId() returns ":r0:" style strings — strip ":" for SVG-safe IDs.
  const rid = useId().replace(/:/g, "");
  const idActive = `lk-active-${rid}`;
  const idInactive = `lk-inactive-${rid}`;
  const idMask = `lk-mask-${rid}`;

  const svgRef = useRef<SVGSVGElement>(null);
  const [eyeDir, setEyeDir] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!trackMouse) {
      setEyeDir({ x: 0, y: 0 });
      return;
    }
    let rafId: number | null = null;
    let pendingEvent: { clientX: number; clientY: number } | null = null;

    const compute = () => {
      rafId = null;
      const e = pendingEvent;
      pendingEvent = null;
      const svg = svgRef.current;
      if (!e || !svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const norm = Math.hypot(dx, dy);
      if (norm < 1) {
        setEyeDir({ x: 0, y: 0 });
        return;
      }
      setEyeDir({
        x: (dx / norm) * MAX_PUPIL_OFFSET,
        y: (dy / norm) * MAX_PUPIL_OFFSET,
      });
    };

    const onMove = (e: MouseEvent) => {
      pendingEvent = { clientX: e.clientX, clientY: e.clientY };
      if (rafId === null) rafId = requestAnimationFrame(compute);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [trackMouse]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 50 42"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={
        {
          "--empty-heart-lower": "rgb(156, 163, 175)",
          "--empty-heart-upper": "rgb(209, 213, 219)",
          "--face-color": "rgba(255, 255, 255, 0.95)",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={idActive}
          x1="25"
          y1="42"
          x2="26.3796"
          y2="0.0453673"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(353deg, 100%, 52%)" />
          <stop offset="1" stopColor="hsl(313deg, 100%, 52%)" />
        </linearGradient>
        <linearGradient
          id={idInactive}
          x1="15"
          y1="41"
          x2="42"
          y2="-1.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--empty-heart-lower)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--empty-heart-upper)" stopOpacity="0.8" />
        </linearGradient>
        <mask id={idMask} maskUnits="userSpaceOnUse" x="0" y="0" width="50" height="42">
          <path d={HEART_PATH} fill="#fff" />
        </mask>
      </defs>

      <g mask={`url(#${idMask})`}>
        {/* Inactive (gray) base */}
        <path d={HEART_PATH} fill={`url(#${idInactive})`} />

        {/* Active (red→pink) overlay, clipped from top by inset() so it fills bottom→up */}
        <path
          d={HEART_PATH}
          fill={`url(#${idActive})`}
          style={{
            clipPath: `inset(${100 - fillPercent}% 0 0 0)`,
            transition: "clip-path 220ms ease-out",
          }}
        />

        {/* Eyes — pupils translate toward mouse direction */}
        <circle cx={15 + eyeDir.x} cy={22 + eyeDir.y} r="2" fill="var(--face-color)" />
        <circle cx={35 + eyeDir.x} cy={22 + eyeDir.y} r="2" fill="var(--face-color)" />

        {/* Smile */}
        <path
          d="M 20 30 Q 25 33.6 30 30"
          stroke="var(--face-color)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle bottom-right shadow + top-left highlight strokes */}
        <path
          d="M53.5 18.5L47 5C47 5 53.5 31.9722 24.5 36C-4.5 40.0278 1 1.5 1 1.5L-6.5 25L8.00002 44.5L15.5 52L39 49L53.5 18.5Z"
          fill="black"
          fillOpacity="0.1"
        />
        <path
          d="M6.14471 8.44525C6.64924 7.12038 7.41962 5.99208 8.36394 5.15003C9.30652 4.30953 10.3901 3.78182 11.5089 3.58622"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M31.7084 5.95975C32.7822 4.70067 34.1021 3.81419 35.484 3.37609"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
