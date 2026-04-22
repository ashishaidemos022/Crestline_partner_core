import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  CreditCard,
  FilePlus,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Item = { to: string; icon: LucideIcon; label: string }
const ITEMS: Item[] = [
  { to: '/', icon: LayoutDashboard, label: 'Book Overview' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/policies', icon: FileText, label: 'PolicyCenter' },
  { to: '/claims', icon: AlertTriangle, label: 'ClaimCenter' },
  { to: '/billing', icon: CreditCard, label: 'BillingCenter' },
  { to: '/quotes', icon: FilePlus, label: 'Quotes' },
  { to: '/activity', icon: ShieldCheck, label: 'Auth & Activity' },
]

export function Sidebar() {
  return (
    <aside
      style={{
        width: 72,
        minHeight: '100vh',
        background: 'rgba(255, 250, 245, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '16px 0',
        transition: 'width 220ms ease',
        overflow: 'hidden',
        zIndex: 10,
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.width = '232px')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.width = '72px')}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #b65433, #8f381f)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            fontSize: 20,
            fontWeight: 500,
            flexShrink: 0,
            boxShadow: '0 10px 22px rgba(182, 84, 51, 0.32)',
          }}
        >
          C
        </div>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              fontWeight: 500,
            }}
          >
            Crestline
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--accent-deep)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Core · CSR Workbench
          </div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
        {ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 22px',
              color: isActive ? 'var(--accent-deep)' : 'var(--muted)',
              borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              background: isActive
                ? 'linear-gradient(90deg, rgba(182, 84, 51, 0.12), transparent)'
                : 'transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 150ms, background 150ms',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
            })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--pine)',
              boxShadow: '0 0 8px rgba(23, 64, 59, 0.5)',
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: 'var(--accent-deep)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Core Live
          </span>
        </div>
      </div>
    </aside>
  )
}
