'use client'

import { useEffect, useState } from 'react'

interface CronJob {
  id: string
  name: string
  next: string
  last: string
  status: string
}

interface Session {
  id: string
  name: string
  type: string
  status: string
  message: string
  time: string
}

interface SystemServer {
  name: string
  status: string
  port: number
}

export default function CommandCenter() {
  const [crons, setCrons] = useState<CronJob[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [servers, setServers] = useState<SystemServer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/cron-health').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/system-state').then(r => r.json()),
    ]).then(([cronData, sessionData, systemData]) => {
      setCrons(cronData.jobs || [])
      setSessions(sessionData.sessions || [])
      setServers(systemData.servers || [])
      setLoading(false)
    })
  }, [])

  const failedCrons = crons.filter(c => c.status === 'error')
  const activeSessions = sessions.filter(s => s.status === 'Active' || s.status.includes('m ago') === false)
  const totalSessions = sessions.length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#71717a' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '24px', paddingTop: '88px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>Command Center</h1>
        <p style={{ color: '#71717a', marginTop: '4px', fontSize: '15px' }}>What's happening, what needs attention</p>
      </div>

      {/* Alert Banner - Only shows if something is wrong */}
      {failedCrons.length > 0 && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '12px', 
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🚨</span>
          <div>
            <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '15px' }}>{failedCrons.length} Cron Job{failedCrons.length > 1 ? 's' : ''} Failed</div>
            <div style={{ color: '#fca5a5', fontSize: '13px', opacity: 0.8 }}>{failedCrons.map(c => c.name).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Active Sessions" value={totalSessions} icon="💬" color="#3b82f6" />
        <StatCard label="Cron Jobs" value={crons.length} icon="⏰" color="#8b5cf6" />
        <StatCard label="Failed Jobs" value={failedCrons.length} icon="❌" color={failedCrons.length > 0 ? '#ef4444' : '#22c55e'} />
        <StatCard label="Servers Online" value={servers.filter(s => s.status === 'up').length} total={servers.length} icon="🖥️" color="#22c55e" />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column - Needs Attention */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: failedCrons.length > 0 ? '#ef4444' : '#71717a' }}>●</span>
            Needs Attention
          </h2>
          
          {/* Failed Cron Jobs */}
          {failedCrons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {failedCrons.map((cron) => (
                <div key={cron.id} style={{ 
                  background: '#1a1a2e', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '14px' }}>{cron.name}</div>
                      <div style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>Last ran: {cron.last}</div>
                    </div>
                    <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>ERROR</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              background: '#1a1a2e', 
              borderRadius: '12px', 
              padding: '24px',
              textAlign: 'center',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
              <span style={{ fontSize: '32px' }}>✅</span>
              <div style={{ color: '#22c55e', fontWeight: 600, marginTop: '8px' }}>All Cron Jobs Healthy</div>
            </div>
          )}

          {/* Server Status */}
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginTop: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>●</span>
            System Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {servers.map((server) => (
              <div key={server.name} style={{ 
                background: '#1a1a2e', 
                borderRadius: '8px', 
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#e4e4e7', fontSize: '14px' }}>{server.name}</span>
                <span style={{ 
                  color: server.status === 'up' ? '#22c55e' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  {server.status === 'up' ? 'ONLINE' : 'DOWN'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Active Now */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#22c55e' }}>●</span>
            Recent Sessions
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} style={{ 
                background: '#1a1a2e', 
                borderRadius: '10px', 
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>{session.name}</div>
                  <div style={{ color: '#71717a', fontSize: '12px', marginTop: '2px' }}>
                    {session.type} • {session.time}
                  </div>
                </div>
                <span style={{ 
                  color: session.status === 'Active' ? '#22c55e' : '#71717a',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginTop: '24px', marginBottom: '16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <ActionButton label="Restart Gateway" icon="🔄" />
            <ActionButton label="View Logs" icon="📋" />
            <ActionButton label="Run Test" icon="🧪" />
            <ActionButton label="Open CLI" icon="💻" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, total, icon, color }: { label: string, value: number, total?: number, icon: string, color: string }) {
  return (
    <div style={{ 
      background: '#0f0f14', 
      borderRadius: '14px', 
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ color: '#71717a', fontSize: '13px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 700, color }}>
        {total ? `${value}/${total}` : value}
      </div>
    </div>
  )
}

function ActionButton({ label, icon }: { label: string, icon: string }) {
  return (
    <button style={{ 
      background: '#1a1a2e', 
      border: '1px solid rgba(255,255,255,0.08)', 
      borderRadius: '10px', 
      padding: '14px',
      color: '#a1a1aa',
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.15s ease',
    }}>
      <span>{icon}</span>
      {label}
    </button>
  )
}
