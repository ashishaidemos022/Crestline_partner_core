import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  cta,
  compact,
}: {
  icon?: ReactNode
  title: string
  description?: string
  cta?: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className="card"
      style={{
        padding: compact ? 24 : 44,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        color: 'var(--muted)',
      }}
    >
      {icon && <div style={{ opacity: 0.55, color: 'var(--accent)' }}>{icon}</div>}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: compact ? 20 : 28,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {description && <div style={{ maxWidth: 460, fontSize: 13, lineHeight: 1.6 }}>{description}</div>}
      {cta && <div style={{ marginTop: 6 }}>{cta}</div>}
    </div>
  )
}
