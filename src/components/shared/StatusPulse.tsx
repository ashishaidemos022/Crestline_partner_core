import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Tone = 'red' | 'amber' | 'green' | 'sky'
const COLORS: Record<Tone, string> = {
  red:   '#A53F2B', /* deep rust-red */
  amber: '#C07B2C', /* burnt orange */
  green: '#17403b', /* pine */
  sky:   '#b65433', /* rust */
}

export function StatusPulse({
  tone = 'red',
  children,
  radius = 14,
  padding = 16,
}: {
  tone?: Tone
  children: ReactNode
  radius?: number
  padding?: number
}) {
  const color = COLORS[tone]
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 1px ${color}33, 0 8px 24px ${color}00`,
          `0 0 0 1px ${color}88, 0 18px 40px ${color}38`,
          `0 0 0 1px ${color}33, 0 8px 24px ${color}00`,
        ],
      }}
      transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      style={{
        padding,
        borderRadius: radius,
        background: 'var(--surface)',
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </motion.div>
  )
}
