'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Phone, Mail, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Customer, Policy, Claim, BillingAccount } from '../lib/types'
import { Badge } from '../components/shared/Badge'
import { Avatar } from '../components/shared/Avatar'
import { fmtUSD, fmtPhone } from '../lib/format'

const STATES = ['TX', 'CO', 'FL', 'WA', 'AZ']

type Row = Customer & {
  policies: Pick<Policy, 'id' | 'type' | 'status'>[]
  claims: Pick<Claim, 'id' | 'status'>[]
  billing_accounts: Pick<BillingAccount, 'id' | 'status' | 'balance'>[]
}

export function CustomerList() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [state, setState] = useState<string>('ALL')
  const [onlyDelinquent, setOnlyDelinquent] = useState(false)
  const [onlyClaims, setOnlyClaims] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('customers')
      .select(`
        cid, first_name, last_name, email, phone, source, mailing_address, created_at, updated_at,
        policies(id, type, status),
        claims(id, status),
        billing_accounts(id, status, balance)
      `)
      .then(({ data }) => {
        if (ignore) return
        setRows((data as Row[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (query) {
        const q = query.toLowerCase()
        const hay = `${r.first_name} ${r.last_name} ${r.email} ${r.phone}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (state !== 'ALL' && r.mailing_address?.state !== state) return false
      if (onlyDelinquent && !r.billing_accounts?.some((b) => b.status === 'past_due' || b.status === 'payment_pending')) return false
      if (onlyClaims && !r.claims?.some((c) => c.status !== 'closed' && c.status !== 'denied')) return false
      return true
    })
  }, [rows, query, state, onlyDelinquent, onlyClaims])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Filters */}
      <div
        className="card"
        style={{
          padding: 14,
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
          <Search size={14} color="var(--text-dim)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers by name, email, phone…"
            style={{
              background: 'transparent',
              border: 0,
              outline: 'none',
              color: 'var(--text)',
              width: '100%',
              fontSize: 13,
            }}
          />
        </div>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border-2)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
          }}
        >
          <option value="ALL">All States</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ToggleChip active={onlyDelinquent} onClick={() => setOnlyDelinquent((v) => !v)}>
          Delinquent
        </ToggleChip>
        <ToggleChip active={onlyClaims} onClick={() => setOnlyClaims((v) => !v)}>
          Open claim
        </ToggleChip>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr 1fr 80px',
            gap: 0,
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}
        >
          <div>Customer</div>
          <div>Location</div>
          <div>Contact</div>
          <div>Policies</div>
          <div>Billing</div>
          <div>Claims</div>
          <div />
        </div>
        {filtered.map((r) => {
          const policyTypes = Array.from(new Set(r.policies?.map((p) => p.type) ?? []))
          const worstBilling = r.billing_accounts?.find((b) => b.status === 'past_due')
            ?? r.billing_accounts?.find((b) => b.status === 'payment_pending')
            ?? r.billing_accounts?.[0]
          const openClaims = r.claims?.filter((c) => c.status !== 'closed' && c.status !== 'denied').length ?? 0
          return (
            <Link
              key={r.cid}
              href={`/customers/${r.cid}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr 1fr 80px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Avatar first={r.first_name} last={r.last_name} id={r.cid} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>
                    {r.first_name} {r.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {r.cid.slice(0, 8)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13 }}>
                <div>{r.mailing_address?.city}{r.mailing_address?.state ? `, ${r.mailing_address.state}` : ''}</div>
                {r.source && (
                  <div style={{ marginTop: 4 }}>
                    <Badge variant={r.source} size="xs" />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={11} /> {fmtPhone(r.phone)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Mail size={11} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {policyTypes.map((t) => (
                  <Badge key={t} variant={t} size="xs" />
                ))}
                {policyTypes.length === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </div>
              <div>
                {worstBilling ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Badge variant={worstBilling.status} size="xs" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      {fmtUSD(worstBilling.balance)}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                )}
              </div>
              <div>
                {openClaims > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--red)' }}>
                    <AlertTriangle size={12} /> {openClaims} open
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                )}
              </div>
              <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                <ArrowRight size={16} />
              </div>
            </Link>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No customers match.</div>
        )}
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</div>
        )}
      </div>
    </div>
  )
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        border: `1px solid ${active ? 'var(--sky)' : 'var(--border-2)'}`,
        background: active ? 'var(--sky-glow)' : 'var(--surface-2)',
        color: active ? 'var(--text)' : 'var(--text-dim)',
        fontSize: 12,
        cursor: 'pointer',
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </button>
  )
}
