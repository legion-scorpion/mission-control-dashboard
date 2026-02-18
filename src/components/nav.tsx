'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Command Center', icon: '🎯' },
  { href: '/projects', label: 'Projects', icon: '🚀' },
  { href: '/fleet', label: 'Fleet', icon: '🛸' },
  { href: '/knowledge', label: 'Knowledge', icon: '📚' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '64px', background: '#0a0a0f', borderBottom: '1px solid #222' }}>
      <div style={{ height: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>Mission Control</span>
        </Link>

        {/* Nav Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                  color: isActive ? '#a78bfa' : '#71717a',
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ marginRight: '6px' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }} />
          <span style={{ fontSize: '12px', color: '#52525b', fontWeight: 500 }}>ONLINE</span>
        </div>
      </div>
    </header>
  )
}
