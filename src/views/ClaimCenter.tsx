'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CalendarDays, MapPin, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { Claim, Customer, Policy, Vehicle } from '../lib/types'
import { Badge } from '../components/shared/Badge'
import { Avatar } from '../components/shared/Avatar'
import { CopyField } from '../components/shared/CopyField'
import { SectionHeader } from '../components/shared/SectionHeader'
import { fmtDate, fmtRel, fmtPhone, daysBetween } from '../lib/format'

const COLUMNS: { key: string; label: string }[] = [
  { key: 'reported', label: 'Reported' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'under_investigation', label: 'Under Investigation' },
  { key: 'estimate_pending', label: 'Estimate Pending' },
  { key: 'closed', label: 'Closed' },
]

type ClaimRow = Claim & {
  customer?: Pick<Customer, 'cid' | 'first_name' | 'last_name'> | null
  policy?: Pick<Policy, 'id' | 'policy_number' | 'type'> | null
  vehicle?: Pick<Vehicle, 'id' | 'year' | 'make' | 'model' | 'trim' | 'vin'> | null
}

export function ClaimCenter() {
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [selected, setSelected] = useState<ClaimRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('claims')
      .select(`
        *,
        customer:customers(cid, first_name, last_name),
        policy:policies(id, policy_number, type),
        vehicle:vehicles(id, year, make, model, trim, vin)
      `)
      .order('loss_date', { ascending: false })
      .then(({ data }) => {
        if (ignore) return
        setClaims((data as ClaimRow[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const grouped = useMemo(() => {
    const g: Record<string, ClaimRow[]> = {}
    COLUMNS.forEach((c) => (g[c.key] = []))
    claims.forEach((c) => {
      if (!g[c.status]) g[c.status] = []
      g[c.status].push(c)
    })
    return g
  }, [claims])

  const open = claims.filter((c) => c.status !== 'closed' && c.status !== 'denied')
  const avgDaysOpen = open.length
    ? Math.round(
        open.reduce((a, c) => a + daysBetween(c.loss_date, new Date().toISOString()), 0) / open.length,
      )
    : 0
  const lossTypeMix = useMemo(() => {
    const m: Record<string, number> = {}
    claims.forEach((c) => (m[c.loss_type] = (m[c.loss_type] ?? 0) + 1))
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [claims])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Open Claims
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>{open.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Avg Days Open
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>{avgDaysOpen}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>
            Loss Mix
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lossTypeMix.map(([lt, n]) => (
              <Badge key={lt} variant={lt} size="xs">
                {lt.replace(/_/g, ' ').toUpperCase()} · {n}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 14,
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))`,
            gap: 12,
            minWidth: 1000,
          }}
        >
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 2px 10px',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 10,
                }}
              >
                <span>{col.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{grouped[col.key]?.length ?? 0}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(grouped[col.key] ?? []).map((c, i) => (
                  <motion.button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      textAlign: 'left',
                      border: selected?.id === c.id ? '1px solid var(--sky)' : '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      borderRadius: 10,
                      padding: 12,
                      cursor: 'pointer',
                      color: 'inherit',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.claim_number}</span>
                      <Badge variant={c.loss_type} size="xs" />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      {c.customer?.first_name} {c.customer?.last_name}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                      <CalendarDays size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                      {fmtDate(c.loss_date)}
                    </div>
                    {c.adjuster_name && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                        Adj: {c.adjuster_name}
                      </div>
                    )}
                  </motion.button>
                ))}
                {!loading && (grouped[col.key]?.length ?? 0) === 0 && (
                  <div
                    style={{
                      padding: 14,
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      border: '1px dashed var(--border)',
                      borderRadius: 10,
                    }}
                  >
                    None
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <ClaimDrawer claim={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ClaimDrawer({ claim, onClose }: { claim: ClaimRow; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 520,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border-2)',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.4)',
        padding: 22,
        overflowY: 'auto',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={20} color="var(--amber)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}>{claim.claim_number}</span>
          <Badge variant={claim.loss_type} size="xs" />
          <Badge variant={claim.status} size="xs" />
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionHeader eyebrow="FNOL" title="Loss Details" />
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
          {claim.loss_description ?? '—'}
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
          <KV label="Loss date" value={fmtDate(claim.loss_date)} />
          <KV label="Reported" value={fmtRel(claim.created_at)} />
          <KV
            label="Location"
            value={
              claim.loss_location ? (
                <span>
                  <MapPin size={11} style={{ verticalAlign: -1 }} /> {claim.loss_location}
                </span>
              ) : (
                '—'
              )
            }
          />
          <KV label="Police report" value={claim.police_report_number ? <span style={{ fontFamily: 'var(--font-mono)' }}>{claim.police_report_number}</span> : '—'} />
        </div>
      </div>

      {claim.adjuster_name && (
        <div style={{ marginTop: 18 }}>
          <SectionHeader eyebrow="Staff" title="Adjuster" />
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Avatar
              first={claim.adjuster_name.split(' ')[0]}
              last={claim.adjuster_name.split(' ')[1] ?? ''}
              id={claim.id}
              size={36}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{claim.adjuster_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Assigned adjuster</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 11 }}>
              {claim.adjuster_phone && <CopyField value={claim.adjuster_phone} dim>{fmtPhone(claim.adjuster_phone)}</CopyField>}
              {claim.adjuster_email && <CopyField value={claim.adjuster_email} dim>{claim.adjuster_email}</CopyField>}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <SectionHeader eyebrow="Related" title="Policy & Vehicle" />
        {claim.policy && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: 'var(--surface-2)',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Badge variant={claim.policy.type} size="xs" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{claim.policy.policy_number}</span>
          </div>
        )}
        {claim.vehicle && (
          <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface-2)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
              {claim.vehicle.trim ? ` · ${claim.vehicle.trim}` : ''}
            </div>
            {claim.vehicle.vin && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                VIN {claim.vehicle.vin}
              </div>
            )}
          </div>
        )}
      </div>

      {claim.customer && (
        <div style={{ marginTop: 18 }}>
          <Link
            href={`/customers/${claim.customer.cid}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              borderRadius: 10,
              background: 'var(--navy-glow)',
              border: '1px solid var(--navy)',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            <Avatar first={claim.customer.first_name} last={claim.customer.last_name} id={claim.customer.cid} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>
                Open {claim.customer.first_name} {claim.customer.last_name} in Customer 360 →
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {claim.customer.cid.slice(0, 8)}
              </div>
            </div>
          </Link>
        </div>
      )}
    </motion.div>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ marginTop: 4 }}>{value}</div>
    </div>
  )
}
