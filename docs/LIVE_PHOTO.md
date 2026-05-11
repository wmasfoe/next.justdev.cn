# Live Photo 组件使用文档

## 简介

Live Photo 组件允许你在博客文章中嵌入动态照片效果。点击静态图片后会播放对应的视频，提供类似 Apple Live Photo 的体验。

## 功能特性

- ✅ 点击触发视频播放
- ✅ 支持循环播放
- ✅ 支持静音/有声音
- ✅ 响应式设计
- ✅ 平滑过渡动画
- ✅ iOS 微信兼容性优化
- ✅ 自定义样式支持

## 在 MDX 中使用

### 基础用法

```mdx
import LivePhoto from "@/components/LivePhoto.tsx";

<LivePhoto
  client:load
  photoSrc="/images/my-photo.jpg"
  videoSrc="/images/my-video.mp4"
/>
```

### 完整参数示例

```mdx
<LivePhoto
  client:load
  photoSrc="/images/my-photo.jpg"
  videoSrc="/images/my-video.mp4"
  loop={true}
  muted={false}
  className="my-custom-class"
  alt="我的 Live Photo"
/>
```

**注意**: `client:load` 指令告诉 Astro 在页面加载时立即水合这个 React 组件，使其具有交互性。

## 参数说明

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `photoSrc` | string | ✅ | - | 静态图片的 URL |
| `videoSrc` | string | ✅ | - | 视频文件的 URL |
| `loop` | boolean | ❌ | false | 是否循环播放视频 |
| `muted` | boolean | ❌ | true | 是否静音播放 |
| `volume` | number | ❌ | 100 | 音量大小（0-100） |
| `useApple` | boolean | ❌ | false | 是否使用 Apple 官方 SDK |
| `className` | string | ❌ | "" | 自定义 CSS 类名 |
| `alt` | string | ❌ | "Live Photo" | 图片的 alt 文本 |

## 两种实现方式

### 1. 自定义实现（默认，推荐）

```mdx
<LivePhoto
  client:load
  photoSrc="./photo.jpg"
  videoSrc="./video.mp4"
/>
```

**优点**：

- ✅ 更好的兼容性（包括 iOS 微信）
- ✅ 支持声音控制和音量调节
- ✅ 无跨域问题
- ✅ 更轻量

**缺点**：

- 播放效果相对简单（直接切换）

### 2. Apple 官方 SDK

```mdx
<LivePhoto
  client:load
  photoSrc="./photo.jpg"
  videoSrc="./video.mp4"
  useApple={true}
/>
```

**优点**：

- ✅ 更丰富的播放效果（帧解析）
- ✅ 支持长按触发（移动端）
- ✅ 与 iOS 系统一致的体验

**缺点**：

- ❌ iOS 微信中可能异常
- ❌ 需要处理跨域问题
- ❌ 仅支持静音播放

## 使用建议

### 1. 文件格式

- **图片**: 推荐使用 JPG 或 WebP 格式
- **视频**: 推荐使用 MP4 格式（H.264 编码）

### 2. 文件大小

- 图片建议控制在 500KB 以内
- 视频建议控制在 5MB 以内
- 视频时长建议 2-5 秒

### 3. 视频优化

```bash
# 使用 ffmpeg 压缩视频
ffmpeg -i input.mov -vcodec h264 -acodec aac -b:v 2M output.mp4
```

### 4. 文件存放位录

根据 AGENTS.md 的图片工作流（Scheme C），建议将图片和视频放在博客文章同目录：

```
src/content/blog/my-post/
├── index.md
├── hero.jpg
└── hero.mp4
```

然后在 MDX 中使用相对路径：

```mdx
<LivePhoto
  photoSrc="./hero.jpg"
  videoSrc="./hero.mp4"
/>
```

## 样式自定义

### 使用自定义类名

```mdx
<LivePhoto
  photoSrc="./photo.jpg"
  videoSrc="./video.mp4"
  className="rounded-xl shadow-2xl"
/>
```

### 覆盖默认样式

在你的自定义 CSS 中：

```css
.my-custom-class.live-photo {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.my-custom-class .live-trigger {
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  color: black;
}
```

## 示例场景

### 1. 旅行照片

```mdx
<LivePhoto
  client:load
  photoSrc="./sunset.jpg"
  videoSrc="./sunset.mp4"
  alt="海边日落"
  loop={true}
/>
```

### 2. 产品展示

```mdx
<LivePhoto
  client:load
  photoSrc="./product.jpg"
  videoSrc="./product-demo.mp4"
  muted={false}
  alt="产品演示"
/>
```

### 3. 教程截图

```mdx
<LivePhoto
  client:load
  photoSrc="./tutorial-step.jpg"
  videoSrc="./tutorial-step.mp4"
  loop={true}
  alt="操作步骤演示"
/>
```

## 技术实现

组件基于以下技术实现：

- **React**: 状态管理和交互逻辑
- **Astro**: 服务端渲染和客户端水合
- **CSS**: 动画和样式
- **HTML5 Video API**: 视频播放控制

## 浏览器兼容性

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ 微信内置浏览器（已优化）

## 故障排除

### 视频不播放

1. 检查视频文件路径是否正确
2. 确认视频格式为 MP4 (H.264)
3. 检查浏览器控制台是否有错误

### iOS 微信中不工作

组件已包含针对 iOS 微信的兼容性修复。如果仍有问题，请确保：

- 视频文件可以正常访问
- 视频编码格式正确

### 样式显示异常

确保在使用组件的页面中正确导入了样式文件。Astro 组件会自动导入样式，但如果直接使用 React 组件，需要手动导入：

```tsx
import "../styles/live-photo.css";
```

## 参考资料

- [原始实现参考](https://lynan.cn/live-photo/)
- [Apple Live Photos Kit JS](https://developer.apple.com/documentation/livephotoskitjs)
- [HTML5 Video API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
