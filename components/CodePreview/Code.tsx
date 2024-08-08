'use client'

import hljs from 'highlight.js'
import { useMemo } from 'react'

const Code = ({ code: rawCode }: { code: string }) => {
  const code = useMemo(() => (rawCode ?? '').trim(), [rawCode])
  return (
    <pre className="overflow-x-auto">
      <code
        className="hljs language-tsx"
        dangerouslySetInnerHTML={{
          __html: hljs.highlight(code, { language: 'javascript' }).value,
        }}
      />
    </pre>
  )
}

export default Code
