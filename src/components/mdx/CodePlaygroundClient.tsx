import {
  OpenInCodeSandboxButton,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { useState } from "react";

type PlaygroundMode = "playground" | "preview";
type PlaygroundTemplate = Extract<
  SandpackPredefinedTemplate,
  "vanilla-ts" | "react" | "react-ts" | "static"
>;

interface CodePlaygroundClientProps {
  mode: PlaygroundMode;
  template: PlaygroundTemplate;
  files: SandpackFiles;
  visibleFiles?: string[];
  activeFile?: string;
  title?: string;
}

export default function CodePlaygroundClient({
  mode,
  template,
  files,
  visibleFiles,
  activeFile,
  title,
}: CodePlaygroundClientProps) {
  const [mobilePanel, setMobilePanel] = useState<"code" | "preview">("code");
  const resolvedFiles = withTemplateDefaults(template, files);
  const resolvedVisibleFiles = visibleFiles ?? Object.keys(resolvedFiles);
  const resolvedActiveFile = activeFile ?? resolvedVisibleFiles[0];
  const isPreviewOnly = mode === "preview";

  return (
    <SandpackProvider
      files={resolvedFiles}
      template={template}
      options={{
        activeFile: resolvedActiveFile,
        visibleFiles: resolvedVisibleFiles,
        recompileMode: "delayed",
        recompileDelay: 250,
      }}
    >
      <section className={`code-playground-shell code-playground-shell--${mode}`}>
        <PlaygroundHeader
          mode={mode}
          title={title}
          mobilePanel={mobilePanel}
          onMobilePanelChange={setMobilePanel}
        />
        <div className="code-playground-body">
          {!isPreviewOnly && (
            <div className={`code-playground-editor ${mobilePanel === "code" ? "is-active" : ""}`}>
              <SandpackCodeEditor showTabs showLineNumbers showInlineErrors wrapContent />
            </div>
          )}
          <div
            className={`code-playground-preview ${
              isPreviewOnly || mobilePanel === "preview" ? "is-active" : ""
            }`}
          >
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              showRestartButton={false}
              showSandpackErrorOverlay
            />
          </div>
        </div>
      </section>
    </SandpackProvider>
  );
}

function withTemplateDefaults(template: PlaygroundTemplate, files: SandpackFiles): SandpackFiles {
  if (template !== "vanilla-ts" || files["/index.html"]) {
    return files;
  }

  return {
    ...files,
    "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>Vanilla TypeScript Playground</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
    <div id="app"></div>
    <script src="/index.ts"></script>
  </body>
</html>`,
  };
}

function PlaygroundHeader({
  mode,
  title,
  mobilePanel,
  onMobilePanelChange,
}: {
  mode: PlaygroundMode;
  title?: string;
  mobilePanel: "code" | "preview";
  onMobilePanelChange: (panel: "code" | "preview") => void;
}) {
  const { sandpack } = useSandpack();
  const isPreviewOnly = mode === "preview";

  return (
    <header className="code-playground-header">
      <div className="code-playground-title">
        <span className="code-playground-dot" aria-hidden="true" />
        <span>{title ?? (isPreviewOnly ? "Preview" : "Playground")}</span>
      </div>
      {!isPreviewOnly && (
        <div className="code-playground-switcher" role="tablist">
          <button
            type="button"
            className={mobilePanel === "code" ? "is-active" : ""}
            onClick={() => onMobilePanelChange("code")}
          >
            Code
          </button>
          <button
            type="button"
            className={mobilePanel === "preview" ? "is-active" : ""}
            onClick={() => onMobilePanelChange("preview")}
          >
            Preview
          </button>
        </div>
      )}
      <div className="code-playground-actions">
        <button
          className="code-playground-action"
          type="button"
          onClick={() => sandpack.resetAllFiles()}
        >
          Reset
        </button>
        <OpenInCodeSandboxButton />
      </div>
    </header>
  );
}
