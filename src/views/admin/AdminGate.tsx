'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import type { SessionAgent } from '../../lib/agent-types'

type Status = 'loading' | 'ok' | 'forbidden'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const agent = (d.agent ?? null) as SessionAgent | null
        if (!agent) {
          router.replace('/login')
          return
        }
        setStatus(agent.role === 'admin' ? 'ok' : 'forbidden')
      })
      .catch(() => !cancelled && setStatus('forbidden'))
    return () => {
      cancelled = true
    }
  }, [router])

  if (status === 'loading') {
    return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Checking permissions…</div>
  }
  if (status === 'forbidden') {
    return (
      <div className="card" style={{ padding: 28, maxWidth: 520, display: 'flex', gap: 14, alignItems: 'center' }}>
        <ShieldAlert size={28} color="var(--red)" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Admin access required</div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)' }}>
            This area is restricted to administrators. Ask an admin to elevate your account or sign in with one that has the role.
          </div>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
