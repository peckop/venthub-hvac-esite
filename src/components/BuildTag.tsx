import React from 'react'

const commit = (import.meta as any).env?.VITE_COMMIT_SHA as string | undefined
const branch = (import.meta as any).env?.VITE_BRANCH as string | undefined

export const BuildTag: React.FC = () => {
  const short = commit ? commit.slice(0, 7) : ''
  if (!short && !branch) return null
  return (
    <span className="text-xs text-steel-gray select-all" title={commit || ''}>
      {branch || 'local'}@{short || 'dev'}
    </span>
  )
}

export default BuildTag
