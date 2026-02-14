'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/ops', label: 'Ops' },
  { href: '/agents', label: 'Agents' },
  { href: '/chat', label: 'Chat' },
  { href: '/content', label: 'Content' },
  { href: '/comms', label: 'Comms' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/code', label: 'Code' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '64px', background: '#0a0a0f', borderBottom: '1px solid #333' }}>
      <div style={{ height: '100%', maxWidth: '1920px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Mission Control</span>
        </Link>

        {/* Nav Items - simple horizontal list */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', overflowX: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  background: isActive ? '#27273a' : 'transparent',
                  color: isActive ? 'white' : '#a1a1aa',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#71717a' }}>LIVE</span>
        </div>
      </div>
    </header>
  )
}
