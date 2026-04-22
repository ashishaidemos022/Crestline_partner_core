import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useCounter } from '../../hooks/useCounter'

type GlowColor = 'navy' | 'sky' | 'green' | 'amber' | 'red' | 'gold'

const ACCENT: Record<GlowColor, string> = {
  navy:  'var(--ink)',
  sky:   'var(--accent)',        /* rust */
  green: 'var(--pine)',
  amber: 'var(--amber)',
  red:   'var(--red)',
  gold:  'var(--gold)',
}
const TINT: Record<GlowColor, string> = {
  navy:  'rgba(27, 34, 48, 0.06)',
  sky:   'rgba(182, 84, 51, 0.10)',
  green: 'rgba(23, 64, 59, 0.08)',
  amber: 'rgba(192, 123, 44, 0.14)',
  red:   'rgba(165, 63, 43, 0.12)',
  gold:  'rgba(184, 138, 58, 0.12)',
}

export function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  color = 'sky',
  icon,
  hint,
  decimals = 0,
  loading,
  pulse,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  color?: GlowColor
  icon?: ReactNode
  hint?: ReactNode
  decimals?: number
  loading?: boolean
  pulse?: boolean
}) {
  const live = useCounter(value, 900)
  const displayed = loading
    ? '—'
    : decimals > 0
      ? live.toFixed(decimals)
      : Math.round(live).toLocaleString('en-US')

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
        borderColor: pulse ? `${ACCENT[color]}66` : 'var(--border)',
        boxShadow: pulse
          ? `0 0 0 1px ${ACCENT[color]}44, 0 18px 40px ${TINT[color]}`
          : '0 12px 32px rgba(42, 28, 14, 0.08)',
      }}
    >
      {/* Soft radial wash toward the top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0, right: 0,
          width: 160, height: 160,
          background: `radial-gradient(circle at 100% 0%, ${TINT[color]}, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--accent-deep)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        {icon && <div style={{ color: ACCENT[color], opacity: 0.85 }}>{icon}</div>}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 48,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginTop: 12,
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
        }}
      >
        {prefix && <span style={{ fontSize: 22, color: 'var(--muted)', fontWeight: 400 }}>{prefix}</span>}
        <span>{displayed}</span>
        {suffix && <span style={{ fontSize: 22, color: 'var(--muted)', fontWeight: 400 }}>{suffix}</span>}
      </div>
      {hint && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>{hint}</div>}
    </motion.div>
  )
}
