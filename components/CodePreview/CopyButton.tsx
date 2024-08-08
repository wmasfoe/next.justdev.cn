'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { Button } from './Button'
import { cn } from './utils'

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      setCopied(true)
      await navigator.clipboard.writeText(content)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Button onClick={onCopy} variant="ghost" size="icon" className="absolute right-2 top-2">
      <CopyIcon size={16} className={cn('transition-all', copied ? 'scale-0' : 'scale-100')} />
      <CheckIcon
        size={16}
        className={cn('absolute transition-all', copied ? 'scale-100' : 'scale-0')}
      />
    </Button>
  )
}

export default CopyButton
