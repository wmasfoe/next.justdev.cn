# MDX Code Playground 使用说明

博客文章里的 fenced code block 可以直接渲染成交互式代码组件。普通代码块仍然保持静态高亮；只有写了 `playground` 或 `preview` 的代码块才会被转换。

## 普通代码块

不加 `playground` / `preview` 时，代码块不会运行，只展示高亮和复制按钮。

````md
```js
console.log(123);
```
````

可以写 `readonly` 表达语义，但它不会改变普通代码块的渲染方式。

````md
```js readonly
console.log(123);
```
````

## 单文件 Playground

给代码块添加 `playground` 即可启用编辑和预览。默认模板是 `vanilla-ts`。

````md
```ts playground file=index.ts
const root = document.querySelector("#root");

if (root) {
  root.innerHTML = `<button>hello</button>`;
}
```
````

配置说明：

- `playground`：启用可编辑 playground。
- `file=index.ts`：当前代码块对应的文件名。建议显式填写。
- `template`：可选，省略时默认是 `vanilla-ts`。

`vanilla-ts` 默认 HTML 同时提供 `#root` 和 `#app` 两个挂载点，所以上面的 `#root` 写法可以直接运行。

## 多文件 Playground

多个连续代码块使用同一个 `playgroup`，会合并成一个 playground，并显示为多个文件 tab。

````md
```tsx playground file=App.tsx playgroup=counter template=react-ts
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      count: {count}
    </button>
  );
}
```

```css playground file=styles.css playgroup=counter
button {
  border: 0;
  border-radius: 6px;
  padding: 10px 14px;
  background: #006cac;
  color: white;
}
```
````

配置说明：

- `playgroup=counter`：同组代码块会合并。
- 多文件时每个代码块都必须写 `file=...`。
- `template=react-ts` 只写在第一块。同组后续代码块不要再写 `template`。
- 同一个 `playgroup` 的代码块必须连续，中间不能插入正文或普通代码块。

## 纯预览

使用 `preview` 可以只展示运行结果，不显示代码编辑器。纯预览仍然保留轻控件，例如 Reset 和 Open in CodeSandbox。

````md
```html template=static preview
<main>
  <h1>Hello Preview</h1>
  <p>这里只展示渲染结果。</p>
</main>

<style>
  body {
    display: grid;
    min-height: 100vh;
    place-items: center;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
</style>
```
````

配置说明：

- `preview`：启用纯预览模式。
- `template=static`：适合 HTML / CSS / JS 静态示例。
- 单文件 `preview` 可以省略 `file`，系统会根据模板和语言推断入口文件。

## 多文件预览

`preview` 也支持多文件分组，规则与 `playground` 相同，只是不展示代码编辑器。

````md
```tsx preview file=App.tsx playgroup=card template=react-ts
import "./styles.css";

export default function App() {
  return <div className="card">Hello Card</div>;
}
```

```css preview file=styles.css playgroup=card
.card {
  border: 1px solid #d8dee9;
  border-radius: 8px;
  padding: 24px;
  background: white;
}
```
````

## 支持的模板

当前支持 4 个模板：

- `vanilla-ts`：默认模板，适合 TypeScript 原生 DOM 示例。
- `static`：适合纯 HTML / CSS / JS 预览。
- `react`：适合 JavaScript React 示例。
- `react-ts`：适合 TypeScript React 示例。

## 规则和限制

- `playground` 和 `preview` 互斥，同一个代码块只能写一个。
- 多文件示例必须通过 `playgroup=...` 分组。
- 多文件同组代码块必须连续。
- 多文件同组只有第一块允许写 `template=...`。
- 多文件同组每个代码块都必须写 `file=...`。
- 单文件 `preview` 可以省略 `file`，单文件 `playground` 建议显式写 `file=...`。
- 非连续重复出现的同名 `playgroup` 会被当作不同实例。
