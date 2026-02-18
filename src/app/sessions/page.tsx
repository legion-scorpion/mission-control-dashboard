'use client'

import { useEffect, useState } from 'react'

interface Session {
  id: string
  name: string
  type: string
  status: string
  message: string
  time: string
  lastActive?: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const typeCounts = {
    all: sessions.length,
    'telegram-group': sessions.filter(s => s.type === 'Telegram Group').length,
    'cron': sessions.filter(s => s.type === 'Cron').length,
    'main': sessions.filter(s => s.type === 'Main').length,
    'subagent': sessions.filter(s => s.type === 'Subagent').length,
  }

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => {
        if (filter === 'telegram-group') return s.type === 'Telegram Group'
        if (filter === 'cron') return s.type === 'Cron'
        if (filter === 'main') return s.type === 'Main'
        if (filter === 'subagent') return s.type === 'Subagent'
        return true
      })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Telegram Group': return '👥'
      case 'Telegram': return '💬'
      case 'Cron': return '⏰'
      case 'Main': return '🎯'
      case 'Subagent': return '🤖'
      default: return '💭'
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'Active') return '#22c55e'
    if (status.includes('m ago') || status.includes('h ago')) return '#71717a'
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
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>Sessions</h1>
        <p style={{ color: '#71717a', marginTop: '4px', fontSize: '15px' }}>All active conversations and agent runs</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All', count: typeCounts.all },
          { id: 'telegram-group', label: 'Telegram Groups', count: typeCounts['telegram-group'] },
          { id: 'cron', label: 'Cron Jobs', count: typeCounts.cron },
          { id: 'main', label: 'Main', count: typeCounts.main },
          { id: 'subagent', label: 'Subagents', count: typeCounts.subagent },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: filter === f.id ? '#27273a' : 'transparent',
              color: filter === f.id ? 'white' : '#71717a',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {f.label}
            <span style={{ 
              background: filter === f.id ? '#3f3f46' : '#27272a',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredSessions.map((session) => (
          <div 
            key={session.id}
            style={{ 
              background: '#0f0f14', 
              borderRadius: '12px', 
              padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '24px' }}>{getTypeIcon(session.type)}</span>
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{session.name}</div>
                <div style={{ color: '#71717a', fontSize: '13px', marginTop: '2px' }}>
                  {session.type} • {session.message.substring(0, 50)}...
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: getStatusColor(session.status), fontWeight: 600, fontSize: '13px' }}>
                {session.status}
              </div>
              <div style={{ color: '#52525b', fontSize: '12px', marginTop: '2px' }}>
                {session.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px', 
          color: '#52525b' 
        }}>
          No sessions found
        </div>
      )}
    </div>
  )
}
