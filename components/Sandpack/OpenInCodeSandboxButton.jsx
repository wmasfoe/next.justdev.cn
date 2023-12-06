/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import { UnstyledOpenInCodeSandboxButton } from '@codesandbox/sandpack-react'

export const OpenInCodeSandboxButton = () => {
  return (
    <UnstyledOpenInCodeSandboxButton
      className="mx-1 ml-2 inline-flex items-center text-sm text-primary transition duration-100 ease-in hover:text-link dark:text-primary-dark md:ml-1"
      title="Open in CodeSandbox"
    >
      <span className="hidden md:block">Fork</span>
    </UnstyledOpenInCodeSandboxButton>
  )
}
