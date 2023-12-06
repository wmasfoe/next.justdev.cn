'use client'
/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
import { memo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  useSandpack,
  useActiveCode,
  SandpackCodeEditor,
  // SandpackReactDevTools,
  SandpackLayout,
} from '@codesandbox/sandpack-react'
import cn from 'classnames'

import { NavigationBar } from './NavigationBar'
import { Preview } from './Preview'

import { useSandpackLint } from './useSandpackLint'

export const CustomPreset = memo(function CustomPreset({
  showDevTools,
  onDevToolsLoad,
  devToolsLoaded,
  providedFiles,
}) {
  const { lintErrors, lintExtensions } = useSandpackLint()
  const { sandpack } = useSandpack()
  const { code } = useActiveCode()
  const { activeFile } = sandpack
  const lineCountRef = useRef({})
  if (!lineCountRef.current[activeFile]) {
    lineCountRef.current[activeFile] = code.split('\n').length
  }
  const lineCount = lineCountRef.current[activeFile]
  const isExpandable = lineCount > 16
  return (
    <SandboxShell
      showDevTools={showDevTools}
      onDevToolsLoad={onDevToolsLoad}
      devToolsLoaded={devToolsLoaded}
      providedFiles={providedFiles}
      lintErrors={lintErrors}
      lintExtensions={lintExtensions}
      isExpandable={isExpandable}
    />
  )
})

const SandboxShell = memo(function SandboxShell({
  showDevTools,
  onDevToolsLoad,
  devToolsLoaded,
  providedFiles,
  lintErrors,
  lintExtensions,
  isExpandable,
}) {
  const containerRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <>
      <div
        className="dark:shadow-lg-dark rounded-lg shadow-lg"
        ref={containerRef}
        style={{
          contain: 'content',
        }}
      >
        <NavigationBar providedFiles={providedFiles} />
        <SandpackLayout
          className={cn(
            showDevTools && devToolsLoaded && 'sp-layout-devtools',
            !(isExpandable || isExpanded) && 'overflow-hidden rounded-b-lg',
            isExpanded && 'sp-layout-expanded'
          )}
        >
          <Editor lintExtensions={lintExtensions} />
          <Preview
            className="order-last xl:order-2"
            isExpanded={isExpanded}
            lintErrors={lintErrors}
          />
          {(isExpandable || isExpanded) && (
            <button
              translate="yes"
              className="sandpack-expand dark:border-card-dark bg-wash dark:bg-card-dark border-b-1 relative top-0 z-10 order-2 flex w-full items-center justify-between p-1 text-base xl:order-last"
              onClick={() => {
                const nextIsExpanded = !isExpanded
                flushSync(() => {
                  setIsExpanded(nextIsExpanded)
                })
                if (!nextIsExpanded && containerRef.current !== null) {
                  // @ts-ignore
                  if (containerRef.current.scrollIntoViewIfNeeded) {
                    // @ts-ignore
                    containerRef.current.scrollIntoViewIfNeeded()
                  } else {
                    containerRef.current.scrollIntoView({
                      block: 'nearest',
                      inline: 'nearest',
                    })
                  }
                }
              }}
            >
              <span className="text-primary dark:text-primary-dark flex p-2 leading-[20px] focus:outline-none">
                {isExpanded ? 'Show less' : 'Show more'}
              </span>
            </button>
          )}
        </SandpackLayout>

        {/* {showDevTools && (
          // @ts-ignore TODO(@danilowoz): support devtools
          <SandpackReactDevTools onLoadModule={onDevToolsLoad} />
        )} */}
      </div>
    </>
  )
})

const Editor = memo(function Editor({ lintExtensions }) {
  return (
    <SandpackCodeEditor
      showLineNumbers
      showInlineErrors
      showTabs={false}
      showRunButton={false}
      extensions={lintExtensions}
    />
  )
})
