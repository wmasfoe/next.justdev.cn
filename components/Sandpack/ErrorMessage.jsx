/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

export function ErrorMessage({ error, ...props }) {
  const { message, title } = error

  return (
    <div className="border-red-40 rounded-lg border-2 bg-white p-6" {...props}>
      <h2 className="text-red-40 mb-4 text-xl">{title || 'Error'}</h2>
      <pre className="text-secondary whitespace-pre-wrap break-words leading-tight">{message}</pre>
    </div>
  )
}
