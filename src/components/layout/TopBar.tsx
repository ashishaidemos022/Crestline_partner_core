import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Customer } from '../../lib/types'

const TITLES: Record<string, string> = {
  '/': 'Book Overview',
  '/customers': 'Customers',
  '/policies': 'PolicyCenter',
  '/claims': 'ClaimCenter',
  '/billing': 'BillingCenter',
  '/quotes': 'Quotes',
  '/activity': 'Auth & Activity',
}

export function TopBar() {
  const { pathname } = useLocation()
  const customerMatch = pathname.match(/^\/customers\/([^/]+)$/)
  const id = customerMatch?.[1]

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)
  useEffect(() => {
    let ignore = false
    if (!id) {
      setActiveCustomer(null)
      return
    }
    supabase
      .from('customers')
      .select('*')
      .eq('cid', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!ignore) setActiveCustomer((data as Customer) ?? null)
      })
    return () => {
      ignore = true
    }
  }, [id])

  const title = id ? 'Customer 360' : TITLES[pathname] ?? 'Crestline Core'
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <header
      style={{
        height: 60,
        background: 'rgba(255, 250, 245, 0.82)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          {title}
        </div>
        {activeCustomer && (
          <Link
            to={`/customers/${activeCustomer.cid}`}
            style={{
              display: 'inline-flex',
              gap: 8,
              alignItems: 'center',
              padding: '6px 12px',
              border: '1px solid var(--border-2)',
              borderRadius: 999,
              fontSize: 12,
              color: 'var(--muted)',
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {activeCustomer.first_name} {activeCustomer.last_name}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{activeCustomer.cid.slice(0, 8)}</span>
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--muted)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--pine)',
              boxShadow: '0 0 10px rgba(23, 64, 59, 0.4)',
              animation: 'topbar-pulse 1.8s ease-in-out infinite',
            }}
          />
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontSize: 10,
              color: 'var(--accent-deep)',
              fontWeight: 700,
            }}
          >
            Core Sync
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>{now}</div>
      </div>
      <style>{`@keyframes topbar-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>
    </header>
  )
}
