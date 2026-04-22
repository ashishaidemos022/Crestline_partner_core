import type { ReactNode } from 'react'

export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string
  title: ReactNode
  right?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--accent-deep)',
              textTransform: 'uppercase',
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      </div>
      {right}
    </div>
  )
}
