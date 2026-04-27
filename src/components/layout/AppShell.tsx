'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TopBar />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            style={{ padding: 28, minWidth: 0, flex: 1 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
