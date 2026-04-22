import { useState, type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyField({
  value,
  children,
  mono,
  dim,
}: {
  value: string | null | undefined
  children?: ReactNode
  mono?: boolean
  dim?: boolean
}) {
  const [copied, setCopied] = useState(false)
  if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* noop */
    }
  }

  return (
    <button
      onClick={onCopy}
      title="Copy"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '2px 6px',
        margin: '-2px -6px',
        border: 'none',
        background: 'transparent',
        color: dim ? 'var(--text-dim)' : 'var(--text)',
        cursor: 'pointer',
        borderRadius: 6,
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        fontSize: 'inherit',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
    >
      <span>{children ?? value}</span>
      <span style={{ opacity: 0.6 }}>
        {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
      </span>
    </button>
  )
}
