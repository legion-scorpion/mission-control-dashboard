'use client'

import { useEffect, useState } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  model: string
  status: string
  level: string
  sessions: number
  emoji?: string
  color?: string
  tagline?: string
}

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

// Agent personas
const agentPersonas: Record<string, { emoji: string, color: string, tagline: string, role: string }> = {
  'Legion': { emoji: '🦂', color: '#7c3aed', tagline: 'Fix first, chat second', role: 'Main Agent' },
  'inbox-triage': { emoji: '📧', color: '#3b82f6', tagline: 'Sorting the noise', role: 'Email Handler' },
  'Check both email inboxes': { emoji: '📬', color: '#06b6d4', tagline: 'Zero inbox warrior', role: 'Email Handler' },
  'Check for Kyle\'s GitH': { emoji: '🐙', color: '#8b5cf6', tagline: 'Hunting issues', role: 'GitHub Scout' },
  'Nightly Idea Generation': { emoji: '💡', color: '#f59e0b', tagline: 'Dreaming up features', role: 'Idea Machine' },
  'Nightly Process Impro': { emoji: '🔧', color: '#10b981', tagline: 'Always optimizing', role: 'Process Engineer' },
  'ApexForm Nightly': { emoji: '💪', color: '#3b82f6', tagline: 'Testing fitness', role: 'QA Bot' },
  'Hamono Nightly': { emoji: '⚔️', color: '#f59e0b', tagline: 'Forging blades', role: 'Game Tester' },
  'ShootRebook Nightly': { emoji: '📷', color: '#22c55e', tagline: 'Booking photographer', role: 'Scheduling Bot' },
  'StitchAI Nightly': { emoji: '🧵', color: '#8b5cf6', tagline: 'Stitching visions', role: 'Image Bot' },
  'Morning Briefing': { emoji: '☕', color: '#f97316', tagline: 'Your daily digest', role: 'News Bot' },
  'GitHub Backlog Updater': { emoji: '📋', color: '#ec4899', tagline: 'Taming the backlog', role: 'Project Manager' },
  'OpenClaw Backup': { emoji: '💾', color: '#14b8a6', tagline: 'Saving everything', role: 'Backup Bot' },
  'Weekly Workspace Reset': { emoji: '🧹', color: '#64748b', tagline: 'Fresh start weekly', role: 'Janitor' },
}

function getPersona(name: string): typeof agentPersonas['Legion'] {
  for (const [key, persona] of Object.entries(agentPersonas)) {
    if (name.includes(key) || key.includes(name)) {
      return persona
    }
  }
  // Default persona
  return { emoji: '🤖', color: '#71717a', tagline: 'Just here to help', role: 'Agent' }
}

interface Report {
  id: string
  botName: string
  content: string
  updatedAt: string
}

export default function FleetPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [crons, setCrons] = useState<CronJob[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/reports').then(r => r.json()),
    ]).then(([agentData, sessionData, reportData]) => {
      setAgents(agentData.agents || [])
      setCrons(agentData.crons || [])
      setSessions(sessionData.sessions || [])
      setReports(reportData.reports || [])
      setLoading(false)
    })
  }, [])

  const failedCrons = crons.filter(c => c.status === 'error')
  const activeCronCount = crons.length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#71717a' }}>Loading fleet...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '24px', paddingTop: '88px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>🛸 Fleet Command</h1>
        <p style={{ color: '#71717a', marginTop: '4px', fontSize: '15px' }}>Your agent army, always working</p>
      </div>

      {/* Fleet Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <FleetStat label="Agents" value={agents.length} icon="🤖" />
        <FleetStat label="Active Now" value={agents.filter(a => a.status === 'active').length} icon="⚡" />
        <FleetStat label="Worker Bots" value={crons.length} icon="⚙️" />
        <FleetStat label="Conversations" value={sessions.length} icon="💬" />
        <FleetStat label="Needs Attention" value={failedCrons.length} icon="🚨" color={failedCrons.length > 0 ? '#ef4444' : '#22c55e'} />
      </div>

      {/* All Agents Grid */}
      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🤖</span> Agents ({agents.length})
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {agents.map((agent) => {
          const persona = getPersona(agent.name)
          const color = agent.color || persona.color || '#7c3aed'
          const emoji = agent.emoji || persona.emoji || '🤖'
          const tagline = agent.tagline || persona.tagline || 'Getting things done'
          const isActive = agent.status === 'active'
          
          return (
            <div 
              key={agent.id}
              style={{ 
                background: `linear-gradient(135deg, ${color}15 0%, #0f0f14 100%)`, 
                borderRadius: '16px', 
                padding: '24px',
                border: `1px solid ${color}30`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  background: `${color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: `0 0 20px ${color}30`,
                }}>
                  {emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>{agent.name}</h4>
                    <span style={{ 
                      background: isActive ? '#22c55e20' : '#3f3f4620', 
                      color: isActive ? '#22c55e' : '#71717a', 
                      padding: '3px 8px', 
                      borderRadius: '10px', 
                      fontSize: '10px',
                      fontWeight: 600,
                    }}>
                      {isActive ? '● ACTIVE' : '○ IDLE'}
                    </span>
                  </div>
                  <p style={{ color: color, fontSize: '12px', marginTop: '2px' }}>{tagline}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                <div>
                  <span style={{ color: '#52525b', fontSize: '10px' }}>SESSIONS</span>
                  <div style={{ color: '#a1a1aa', fontSize: '14px' }}>{agent.sessions || 0}</div>
                </div>
                <div>
                  <span style={{ color: '#52525b', fontSize: '10px' }}>ROLE</span>
                  <div style={{ color: '#a1a1aa', fontSize: '14px' }}>{agent.role}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Worker Bots Grid */}
      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚙️</span> Worker Bots ({crons.length})
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {crons.map((cron) => {
          const persona = getPersona(cron.name)
          const isError = cron.status === 'error'
          
          return (
            <div 
              key={cron.id}
              style={{ 
                background: '#0f0f14', 
                borderRadius: '16px', 
                padding: '20px',
                border: isError ? '1px solid #ef444440' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: `${persona.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {persona.emoji}
                </div>
                <span style={{ 
                  background: isError ? '#ef444420' : '#22c55e20', 
                  color: isError ? '#ef4444' : '#22c55e', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  fontWeight: 600,
                }}>
                  {isError ? '❌' : '✅'} {cron.status}
                </span>
              </div>

              {/* Name & Role */}
              <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{cron.name}</h4>
              <p style={{ color: '#71717a', fontSize: '12px', marginTop: '2px' }}>{persona.role}</p>
              <p style={{ color: persona.color, fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>"{persona.tagline}"</p>

              {/* Schedule */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #27272a',
              }}>
                <div>
                  <span style={{ color: '#52525b', fontSize: '10px' }}>NEXT RUN</span>
                  <div style={{ color: '#a1a1aa', fontSize: '13px' }}>{cron.next}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#52525b', fontSize: '10px' }}>LAST RUN</span>
                  <div style={{ color: '#a1a1aa', fontSize: '13px' }}>{cron.last}</div>
                </div>
              </div>

              {/* Activity Indicator */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: isError ? '#ef4444' : '#22c55e',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ color: '#52525b', fontSize: '11px' }}>
                  {isError ? 'Needs attention!' : 'Running on schedule'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Sessions */}
      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>💬</span> Recent Conversations ({sessions.length})
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sessions.slice(0, 8).map((session) => (
          <div 
            key={session.id}
            style={{ 
              background: '#0f0f14', 
              borderRadius: '12px', 
              padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              {session.type === 'Telegram Group' ? '👥' : 
               session.type === 'Cron' ? '⏰' : 
               session.type === 'Subagent' ? '🤖' : '💬'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>{session.name}</div>
              <div style={{ color: '#52525b', fontSize: '12px' }}>{session.type}</div>
            </div>
            <div style={{ color: session.status === 'Active' ? '#22c55e' : '#71717a', fontSize: '13px' }}>
              {session.status}
            </div>
          </div>
        ))}
      </div>

      {/* Bot Reports */}
      {reports.length > 0 && (
        <>
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '16px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Latest Reports ({reports.length})
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {reports.map((report) => {
              const persona = getPersona(report.botName)
              return (
                <div 
                  key={report.id}
                  style={{ 
                    background: '#0f0f14', 
                    borderRadius: '12px', 
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{persona.emoji}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{report.botName}</div>
                      <div style={{ color: '#52525b', fontSize: '11px' }}>
                        {new Date(report.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#a1a1aa', 
                    fontSize: '13px', 
                    lineHeight: 1.5,
                    maxHeight: '100px',
                    overflow: 'hidden',
                  }}>
                    {report.content}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

function FleetStat({ label, value, icon, color = '#71717a' }: { label: string, value: number, icon: string, color?: string }) {
  return (
    <div style={{ 
      background: '#0f0f14', 
      borderRadius: '14px', 
      padding: '16px 20px',
      border: '1px solid rgba(255,255,255,0.05)',
      minWidth: '140px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span>{icon}</span>
        <span style={{ color: '#71717a', fontSize: '12px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
