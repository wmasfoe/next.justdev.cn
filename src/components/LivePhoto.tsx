import { useRef, useState, useEffect } from "react";
import "../styles/live-photo.css";

interface LivePhotoProps {
  /** 静态图片的 URL */
  photoSrc: string;
  /** 视频文件的 URL */
  videoSrc: string;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 音量（0-100） */
  volume?: number;
  /** 是否使用 Apple 官方 LivePhotosKit SDK */
  useApple?: boolean;
  /** 自定义 CSS 类名 */
  className?: string;
  /** 图片的 alt 文本 */
  alt?: string;
}

/**
 * Apple LivePhotosKit React 包装组件
 * 使用 Apple 官方 JS SDK 实现 Live Photo
 */
function LivePhotosKitReact({
  className,
  photoSrc,
  videoSrc,
}: {
  className?: string;
  photoSrc: string;
  videoSrc: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    let cancelled = false;
    // 动态导入 livephotoskit，避免 SSR 问题
    import("livephotoskit").then((LivePhotosKit) => {
      if (cancelled || !nodeRef.current) return;
      const player = LivePhotosKit.Player(nodeRef.current);
      player.photoSrc = photoSrc;
      player.videoSrc = videoSrc;
    });
    return () => {
      cancelled = true;
    };
  }, [photoSrc, videoSrc]);

  return <div ref={nodeRef} className={className} />;
}

/**
 * LivePhoto 组件
 *
 * 支持两种实现方式：
 * 1. 自定义实现（默认）：兼容性更好，无跨域问题
 * 2. Apple SDK（useApple=true）：使用官方 LivePhotosKit JS SDK
 *
 * @see https://lynan.cn/live-photo/
 * @see https://github.com/LynanBreeze/live-photo
 * @see https://developer.apple.com/documentation/livephotoskitjs
 */
export default function LivePhoto({
  photoSrc,
  videoSrc,
  loop = false,
  muted = true,
  volume = 100,
  useApple = false,
  className = "",
  alt = "Live Photo",
}: LivePhotoProps) {
  const [imageReady, setImageReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoRunning, setVideoRunning] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRunning) {
      videoRef.current.pause();
    } else {
      setVideoPlaying(true);
      videoRef.current.play();
      // 非静音模式下设置音量
      if (!muted) {
        videoRef.current.volume = Math.max(0, Math.min(1, volume / 100));
      }
    }
  };

  const onImageLoad = () => {
    setImageReady(true);
    // iOS 微信内 onCanPlay 和 onLoadedMetadata 不会被触发的 Hack
    if (/iphone/i.test(navigator.userAgent) && /micromessenger/i.test(navigator.userAgent)) {
      setTimeout(() => {
        setVideoReady(true);
      }, 500);
    }
  };

  // 使用 Apple SDK
  if (useApple) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg bg-gray-100 ${className}`}>
        <LivePhotosKitReact className="block w-full" photoSrc={photoSrc} videoSrc={videoSrc} />
      </div>
    );
  }

  // 自定义实现（默认）
  return (
    <div
      className={`relative w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${className}`}
    >
      {/* 触发按钮 */}
      <div
        className="trigger absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:bg-black/70"
        onClick={playVideo}
        style={{ opacity: videoReady ? 1 : 0 }}
      >
        <div
          className="trigger-icon relative h-3.5 w-3.5 rounded-full border-2 border-white"
          style={{
            animation: "live-pulse 2s ease-in-out infinite",
            animationPlayState: videoRunning ? "running" : "paused",
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        <span className="trigger-text select-none">LIVE</span>
      </div>

      {/* 静态图片 */}
      <img
        className="block h-auto w-full transition-opacity duration-300"
        src={photoSrc}
        alt={alt}
        onLoad={onImageLoad}
        style={{ opacity: imageReady ? 1 : 0 }}
      />

      {/* 视频 */}
      <video
        ref={videoRef}
        className="absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-300"
        src={videoSrc}
        loop={loop}
        muted={muted}
        playsInline
        style={{ opacity: videoPlaying ? 1 : 0 }}
        onCanPlay={() => setVideoReady(true)}
        onLoadedMetadata={() => setVideoReady(true)}
        onPlaying={() => setVideoRunning(true)}
        onPause={() => setVideoRunning(false)}
        onEnded={() => setVideoPlaying(false)}
      />
    </div>
  );
}
