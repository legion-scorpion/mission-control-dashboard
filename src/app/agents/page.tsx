'use client'

import { useEffect, useState } from 'react'

interface CronJob {
  id: string
  name: string
  next: string
  last: string
  status: string
}

interface Agent {
  id: string
  name: string
  role: string
  model: string
  status: string
  level: string
  sessions: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [crons, setCrons] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || [])
        setCrons(data.crons || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const failedCrons = crons.filter(c => c.status === 'error')
  const okCrons = crons.filter(c => c.status === 'ok')

  const getStatusColor = (status: string) => {
    if (status === 'error') return '#ef4444'
    if (status === 'ok') return '#22c55e'
    return '#71717a'
  }

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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>Agents</h1>
        <p style={{ color: '#71717a', marginTop: '4px', fontSize: '15px' }}>Agent instances and cron job schedules</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#0f0f14', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#71717a', fontSize: '13px' }}>Total Agents</div>
          <div style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>{agents.length}</div>
        </div>
        <div style={{ background: '#0f0f14', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#71717a', fontSize: '13px' }}>Cron Jobs</div>
          <div style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>{crons.length}</div>
        </div>
        <div style={{ background: '#0f0f14', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0x05)' }}>
          <div style={{ color: '#71717a', fontSize: '13px' }}>Failed</div>
          <div style={{ color: failedCrons.length > 0 ? '#ef4444' : '#22c55e', fontSize: '32px', fontWeight: 700 }}>{failedCrons.length}</div>
        </div>
      </div>

      {/* Agent Cards */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Active Agents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {agents.map(agent => (
          <div key={agent.id} style={{ 
            background: '#0f0f14', 
            borderRadius: '14px', 
            padding: '20px',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>{agent.name}</div>
                <div style={{ color: '#71717a', fontSize: '13px', marginTop: '4px' }}>{agent.role}</div>
              </div>
              <span style={{ 
                background: '#22c55e20', 
                color: '#22c55e', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '11px',
                fontWeight: 600,
              }}>
                ACTIVE
              </span>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
              <div>
                <div style={{ color: '#52525b', fontSize: '11px' }}>MODEL</div>
                <div style={{ color: '#a1a1aa', fontSize: '13px' }}>{agent.model}</div>
              </div>
              <div>
                <div style={{ color: '#52525b', fontSize: '11px' }}>LEVEL</div>
                <div style={{ color: '#a1a1aa', fontSize: '13px' }}>{agent.level}</div>
              </div>
              <div>
                <div style={{ color: '#52525b', fontSize: '11px' }}>SESSIONS</div>
                <div style={{ color: '#a1a1aa', fontSize: '13px' }}>{agent.sessions}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cron Jobs */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Cron Jobs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {crons.map(cron => (
          <div 
            key={cron.id}
            style={{ 
              background: '#0f0f14', 
              borderRadius: '10px', 
              padding: '14px 18px',
              border: cron.status === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>{cron.name}</div>
              <div style={{ color: '#52525b', fontSize: '12px', marginTop: '2px' }}>Next: {cron.next} • Last: {cron.last}</div>
            </div>
            <span style={{ 
              color: getStatusColor(cron.status),
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {cron.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
