import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageSquare, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { AuthEvent, Customer } from '../lib/types'
import { KpiCard } from '../components/shared/KpiCard'
import { fmtRel, daysBetween } from '../lib/format'

type Row = AuthEvent & { customer?: Pick<Customer, 'cid' | 'first_name' | 'last_name'> | null }

export function AuthActivity() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState('ALL')
  const [method, setMethod] = useState('ALL')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('auth_events')
      .select('*, customer:customers(cid, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (ignore) return
        setRows((data as Row[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const last24h = rows.filter((r) => daysBetween(r.created_at ?? '', new Date().toISOString()) <= 1)
  const success24h = last24h.filter((r) => r.result === 'success').length
  const rate = last24h.length ? Math.round((success24h / last24h.length) * 100) : 0
  const failures = rows.filter((r) => r.result === 'failure').length
  const topMethod = useMemo(() => {
    const m: Record<string, number> = {}
    rows.forEach((r) => {
      if (!r.delivery_method) return
      m[r.delivery_method] = (m[r.delivery_method] ?? 0) + 1
    })
    const [k] = Object.entries(m).sort((a, b) => b[1] - a[1])[0] ?? ['—']
    return k
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (result !== 'ALL' && r.result !== result) return false
      if (method !== 'ALL' && r.delivery_method !== method) return false
      if (query) {
        const q = query.toLowerCase()
        const hay = `${r.customer?.first_name ?? ''} ${r.customer?.last_name ?? ''} ${r.ip_address ?? ''} ${r.event_type}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, result, method, query])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <KpiCard label="Events (total)" value={rows.length} color="sky" loading={loading} />
        <KpiCard label="24h Success Rate" value={rate} suffix="%" color="green" loading={loading} />
        <KpiCard
          label="Failures (all-time)"
          value={failures}
          color="red"
          pulse={failures > 0}
          loading={loading}
        />
        <KpiCard
          label="Top Delivery"
          value={0}
          color="navy"
          hint={<span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{topMethod}</span>}
          loading={loading}
        />
      </div>

      <div className="card" style={{ padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--surface-2)',
            borderRadius: 8,
            padding: '8px 12px',
            flex: 1,
            minWidth: 240,
          }}
        >
          <Search size={14} color="var(--text-dim)" />
          <input
            placeholder="Customer, IP, event type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', width: '100%', fontSize: 13 }}
          />
        </div>
        <Select
          value={result}
          onChange={setResult}
          options={[['ALL', 'All results'], ['success', 'Success'], ['failure', 'Failure']]}
        />
        <Select
          value={method}
          onChange={setMethod}
          options={[['ALL', 'All methods'], ['sms', 'SMS'], ['voice', 'Voice'], ['email', 'Email']]}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1.6fr 1fr 1fr 1fr 1fr',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}
        >
          <div />
          <div>Customer</div>
          <div>Event</div>
          <div>Method</div>
          <div>IP</div>
          <div style={{ textAlign: 'right' }}>When</div>
        </div>
        <div style={{ maxHeight: 540, overflowY: 'auto' }}>
          {filtered.map((r) => {
            const Icon = r.delivery_method === 'voice' ? Phone : MessageSquare
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1.6fr 1fr 1fr 1fr 1fr',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: r.result === 'success' ? 'var(--green)' : 'var(--red)',
                  }}
                />
                <div>
                  {r.customer ? (
                    <Link
                      to={`/customers/${r.customer.cid}`}
                      style={{ color: 'var(--text)', textDecoration: 'none' }}
                    >
                      {r.customer.first_name} {r.customer.last_name}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>—</span>
                  )}
                  <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 10 }}>
                    {r.customer?.cid.slice(0, 8) ?? ''}
                  </span>
                </div>
                <div>{r.event_type}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)' }}>
                  {r.delivery_method && <Icon size={12} />}
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {r.delivery_method ?? '—'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{r.ip_address ?? '—'}</div>
                <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{fmtRel(r.created_at)}</div>
              </div>
            )
          })}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No auth events match.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--surface-2)',
        color: 'var(--text)',
        border: '1px solid var(--border-2)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}
