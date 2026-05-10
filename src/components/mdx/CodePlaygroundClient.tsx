import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  SandpackProvider,
  UnstyledOpenInCodeSandboxButton,
  useSandpack,
  useSandpackNavigation,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { useState } from "react";

type PlaygroundMode = "playground" | "preview";
type PlaygroundTemplate = Extract<
  SandpackPredefinedTemplate,
  "vanilla" | "vanilla-ts" | "react" | "react-ts" | "static"
>;
type PlaygroundLayout = "row" | "col";
type PreviewPanel = "result" | "console";

interface CodePlaygroundClientProps {
  mode: PlaygroundMode;
  template: PlaygroundTemplate;
  layout?: PlaygroundLayout;
  files: SandpackFiles;
  visibleFiles?: string[];
  activeFile?: string;
  title?: string;
  hideResult?: boolean;
}

export default function CodePlaygroundClient({
  mode,
  template,
  layout = "row",
  files,
  visibleFiles,
  activeFile,
  title,
  hideResult = false,
}: CodePlaygroundClientProps) {
  const [mobilePanel, setMobilePanel] = useState<"code" | "preview">("code");
  const [previewPanel, setPreviewPanel] = useState<PreviewPanel>(hideResult ? "console" : "result");
  const resolvedFiles = withTemplateDefaults(template, files);
  const resolvedVisibleFiles = visibleFiles ?? Object.keys(resolvedFiles);
  const resolvedActiveFile = activeFile ?? resolvedVisibleFiles[0];
  const isPreviewOnly = mode === "preview";
  const showTabs = resolvedVisibleFiles.length > 1;
  const activePreview: PreviewPanel = hideResult ? "console" : previewPanel;

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
      <section
        className={`code-playground-shell code-playground-shell--${mode} code-playground-shell--${layout}`}
        data-layout={layout}
      >
        <PlaygroundHeader
          mode={mode}
          title={title}
          mobilePanel={mobilePanel}
          onMobilePanelChange={setMobilePanel}
        />
        <div className="code-playground-body">
          {!isPreviewOnly && (
            <div className={`code-playground-editor ${mobilePanel === "code" ? "is-active" : ""}`}>
              <SandpackCodeEditor
                showTabs={showTabs}
                showLineNumbers
                showInlineErrors
                wrapContent
              />
            </div>
          )}
          <div
            className={`code-playground-preview ${
              isPreviewOnly || mobilePanel === "preview" ? "is-active" : ""
            }`}
          >
            <PreviewTabs
              hideResult={hideResult}
              activePreview={activePreview}
              onChange={setPreviewPanel}
            />
            <div className="code-playground-preview-panes">
              {!hideResult && (
                <div
                  className="code-playground-preview-pane code-playground-preview-pane--result"
                  data-active={activePreview === "result"}
                >
                  <SandpackPreview
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                    showRefreshButton={false}
                    showRestartButton={false}
                    showSandpackErrorOverlay
                  />
                </div>
              )}
              <div
                className="code-playground-preview-pane code-playground-preview-pane--console"
                data-active={activePreview === "console"}
              >
                <SandpackConsole showHeader={false} resetOnPreviewRestart />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SandpackProvider>
  );
}

function withTemplateDefaults(template: PlaygroundTemplate, files: SandpackFiles): SandpackFiles {
  if (template !== "vanilla-ts" && template !== "vanilla") {
    return files;
  }
  if (files["/index.html"]) {
    return files;
  }

  const entry = template === "vanilla-ts" ? "/index.ts" : "/index.js";

  return {
    ...files,
    "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>${template === "vanilla-ts" ? "Vanilla TypeScript" : "Vanilla JavaScript"} Playground</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
    <div id="app"></div>
    <script src="${entry}"></script>
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
          type="button"
          className="code-playground-icon-button"
          aria-label="Reset playground"
          title="Reset"
          onClick={() => sandpack.resetAllFiles()}
        >
          <IconRefresh />
          <span className="sr-only">Reset</span>
        </button>
        <UnstyledOpenInCodeSandboxButton
          className="code-playground-icon-button"
          aria-label="Open in CodeSandbox"
          title="Open in CodeSandbox"
        >
          <IconExternalLink />
          <span className="sr-only">Open in CodeSandbox</span>
        </UnstyledOpenInCodeSandboxButton>
      </div>
    </header>
  );
}

function PreviewTabs({
  hideResult,
  activePreview,
  onChange,
}: {
  hideResult: boolean;
  activePreview: PreviewPanel;
  onChange: (panel: PreviewPanel) => void;
}) {
  const { refresh } = useSandpackNavigation();

  return (
    <div className="code-playground-preview-tabs">
      {!hideResult && (
        <div className="code-playground-preview-tablist" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activePreview === "result"}
            className={`code-playground-preview-tab ${
              activePreview === "result" ? "is-active" : ""
            }`}
            onClick={() => onChange("result")}
          >
            Result
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePreview === "console"}
            className={`code-playground-preview-tab ${
              activePreview === "console" ? "is-active" : ""
            }`}
            onClick={() => onChange("console")}
          >
            Console
          </button>
        </div>
      )}
      <button
        type="button"
        className="code-playground-icon-button code-playground-icon-button--sm"
        aria-label="Refresh preview"
        title="Refresh preview"
        onClick={() => refresh()}
      >
        <IconRotateClockwise />
        <span className="sr-only">Refresh preview</span>
      </button>
    </div>
  );
}

function IconRefresh() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function IconRotateClockwise() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.95 11A8 8 0 1 0 12 20" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="M11 13l9-9" />
      <path d="M15 4h5v5" />
    </svg>
  );
}
