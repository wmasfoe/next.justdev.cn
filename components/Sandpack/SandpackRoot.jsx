'use client'
/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import { Children, useState } from 'react'
import * as React from 'react'
import { SandpackProvider } from '@codesandbox/sandpack-react'
import { SandpackLogLevel } from '@codesandbox/sandpack-client'
import { CustomPreset } from './CustomPreset'
import { createFileMap } from './createFileMap'
import { CustomTheme } from './Themes'

const sandboxStyle = `
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 20px;
  padding: 0;
}

h1 {
  margin-top: 0;
  font-size: 22px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

h3 {
  margin-top: 0;
  font-size: 18px;
}

h4 {
  margin-top: 0;
  font-size: 16px;
}

h5 {
  margin-top: 0;
  font-size: 14px;
}

h6 {
  margin-top: 0;
  font-size: 12px;
}

code {
  font-size: 1.2em;
}

ul {
  padding-left: 20px;
}
`.trim()

function SandpackRoot(props) {
  let { children, autorun = true, showDevTools = false } = props
  const [devToolsLoaded, setDevToolsLoaded] = useState(false)
  const codeSnippets = Children.toArray(children)
  const files = createFileMap(codeSnippets)

  files['/styles.css'] = {
    code: [sandboxStyle, files['/styles.css']?.code ?? ''].join('\n\n'),
    hidden: !files['/styles.css']?.visible,
  }

  console.log(files, children, props)

  return (
    <div className="sandpack sandpack--playground my-8 w-full">
      <SandpackProvider
        template="react"
        files={files}
        theme={CustomTheme}
        options={{
          autorun,
          initMode: 'user-visible',
          initModeObserverOptions: { rootMargin: '1400px 0px' },
          bundlerURL: 'https://1e4ad8f7.sandpack-bundler-4bw.pages.dev',
          logLevel: SandpackLogLevel.None,
        }}
      >
        <CustomPreset
          showDevTools={showDevTools}
          onDevToolsLoad={() => setDevToolsLoaded(true)}
          devToolsLoaded={devToolsLoaded}
          providedFiles={Object.keys(files)}
        />
      </SandpackProvider>
    </div>
  )
}

export default SandpackRoot
