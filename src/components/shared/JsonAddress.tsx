import type { Address } from '../../lib/types'

export function JsonAddress({
  value,
  inline,
  dim,
}: {
  value: Address
  inline?: boolean
  dim?: boolean
}) {
  if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const street = value.street ?? ''
  const street2 = value.street2
  const city = value.city ?? ''
  const state = value.state ?? ''
  const zip = value.zip ?? value.postal_code ?? ''
  const cityLine = [city, state].filter(Boolean).join(', ')
  const rest = [cityLine, zip].filter(Boolean).join(' ')

  if (inline) {
    return (
      <span style={{ color: dim ? 'var(--text-dim)' : 'var(--text)' }}>
        {[street, street2, rest].filter(Boolean).join(' · ') || '—'}
      </span>
    )
  }
  return (
    <div style={{ color: dim ? 'var(--text-dim)' : 'var(--text)', lineHeight: 1.4 }}>
      {street && <div>{street}</div>}
      {street2 && <div>{street2}</div>}
      {rest && <div>{rest}</div>}
      {!street && !rest && '—'}
    </div>
  )
}
