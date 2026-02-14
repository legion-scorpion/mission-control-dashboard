'use client'

import { useState, useEffect } from 'react'

interface Session {
  id: string
  name: string
  type: string
  status: string
  message: string
  time: string
  lastActive?: number
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || [])
        if (data.sessions?.length > 0) {
          setSelectedSession(data.sessions[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Chat</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Sessions and conversations</p>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : sessions.length === 0 ? (
        <p style={{ color: '#52525b' }}>No active sessions</p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '8px' }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                style={{
                  background: selectedSession?.id === session.id ? '#27273a' : '#1a1a2e',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>{session.name}</span>
                      <span style={{ color: '#22c55e', fontSize: '12px' }}>● {session.status}</span>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>{session.message}</p>
                  </div>
                  <span style={{ color: '#71717a', fontSize: '12px' }}>{session.time}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedSession && (
            <div style={{ marginTop: '24px', background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: 'white', fontSize: '16px' }}>{selectedSession.name}</h3>
                <p style={{ color: '#22c55e', fontSize: '12px' }}>{selectedSession.type} • {selectedSession.status}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  readOnly
                  style={{
                    flex: 1,
                    background: '#27273a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#71717a',
                    fontSize: '14px'
                  }}
                />
                <button disabled style={{ background: '#7c3aed50', border: 'none', borderRadius: '8px', padding: '12px', color: '#71717a', cursor: 'not-allowed' }}>
                  Send
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
