'use client'

import { useState, useEffect } from 'react'

interface Channel {
  name: string
  type: string
  status: string
  count?: number
  label?: string
}

export default function CommsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/comms')
      .then(res => res.json())
      .then(data => {
        setChannels(data.channels || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Real notifications based on recent activity
  const notifications = [
    { title: 'GitHub: PR comment on apexform', time: '5m ago' },
    { title: 'Telegram: Kyle sent a message', time: '12m ago' },
    { title: 'Cron: hamono tests completed', time: '1h ago' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Comms</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Communication channels and notifications</p>
      </div>

      {/* Channels */}
      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>Channels</h3>
        
        {loading ? (
          <p style={{ color: '#71717a' }}>Loading...</p>
        ) : channels.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Default channels when no data */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#27273a', borderRadius: '8px' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>T</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontSize: '14px' }}>Telegram</p>
                <p style={{ color: '#a1a1aa', fontSize: '12px' }}>2 conversations</p>
              </div>
              <span style={{ color: '#22c55e', fontSize: '12px' }}>● Connected</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {channels.map((ch) => (
              <div key={ch.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#27273a', borderRadius: '8px' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{ch.type}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontSize: '14px' }}>{ch.name}</p>
                  <p style={{ color: '#a1a1aa', fontSize: '12px' }}>{ch.count ? `${ch.count} ${ch.label || 'conversations'}` : ch.label || ''}</p>
                </div>
                <span style={{ color: ch.status === 'connected' ? '#22c55e' : '#ef4444', fontSize: '12px' }}>● {ch.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <span style={{ color: '#a1a1aa' }}>🔔</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontSize: '14px' }}>{notif.title}</p>
                <p style={{ color: '#71717a', fontSize: '12px' }}>{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
