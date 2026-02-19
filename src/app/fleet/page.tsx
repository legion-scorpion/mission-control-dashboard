'use client'

import { useEffect, useState } from 'react'

interface Agent {
  id: string
  name: string
  personalName?: string
  title?: string
  role: string
  model: string
  status: string
  level: string
  sessions: number
  emoji?: string
  color?: string
  tagline?: string
  personality?: string
  avatar?: string
  isMain?: boolean
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

      {/* Office Header - Like a dev team board */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f14 100%)', 
        borderRadius: '20px', 
        padding: '24px 32px',
        marginBottom: '32px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            🏢 Dev Team Office
          </h2>
          <p style={{ color: '#71717a', marginTop: '4px' }}>
            {agents.length} agents • {agents.filter(a => a.status === 'active').length} working • {crons.length} automated tasks
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
            🟢 Online
          </span>
        </div>
      </div>

      {/* Fleet Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <FleetStat label="Team Size" value={agents.length} icon="👥" />
        <FleetStat label="At Desks" value={agents.filter(a => a.status === 'active').length} icon="💻" />
        <FleetStat label="Running Tasks" value={crons.length} icon="⚙️" />
        <FleetStat label="Conversations" value={sessions.length} icon="💬" />
        <FleetStat label="Issues" value={failedCrons.length} icon="🚨" color={failedCrons.length > 0 ? '#ef4444' : '#22c55e'} />
      </div>

      {/* Leadership - Main Agent */}
      {agents.filter(a => a.isMain).map((agent) => (
        <div key={agent.id} style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            👑 Leadership
          </h3>
          <div style={{ 
            background: `linear-gradient(135deg, ${agent.color}20 0%, #0f0f14 100%)`, 
            borderRadius: '20px', 
            padding: '32px',
            border: `2px solid ${agent.color}40`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              {/* Avatar */}
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '24px', 
                background: `${agent.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px',
                boxShadow: `0 0 60px ${agent.color}40`,
                overflow: 'hidden',
              }}>
                {agent.avatar ? (
                  <img src={agent.avatar} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  agent.emoji
                )}
              </div>
              
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{ color: 'white', fontSize: '32px', fontWeight: 700, margin: 0 }}>{agent.personalName}</h2>
                  <span style={{ 
                    background: agent.status === 'active' ? '#22c55e20' : '#3f3f4620', 
                    color: agent.status === 'active' ? '#22c55e' : '#71717a', 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {agent.status === 'active' ? '● AT DESK' : '○ OFFLINE'}
                  </span>
                </div>
                <p style={{ color: agent.color, fontSize: '16px', marginTop: '4px' }}>{agent.title}</p>
                <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '8px', fontStyle: 'italic' }}>"{agent.tagline}"</p>
                
                <div style={{ display: 'flex', gap: '32px', marginTop: '20px' }}>
                  <div>
                    <span style={{ color: '#52525b', fontSize: '12px' }}>PERSONALITY</span>
                    <div style={{ color: 'white', fontSize: '14px' }}>{agent.personality}</div>
                  </div>
                  <div>
                    <span style={{ color: '#52525b', fontSize: '12px' }}>ACTIVE SESSIONS</span>
                    <div style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>{agent.sessions || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Project Agents - The Team */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          👨‍💻 Development Team
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {agents.filter(a => !a.isMain).map((agent) => {
            const isActive = agent.status === 'active'
            
            return (
              <div 
                key={agent.id}
                style={{ 
                  background: `linear-gradient(135deg, ${agent.color}10 0%, #0f0f14 100%)`, 
                  borderRadius: '16px', 
                  padding: '20px',
                  border: `1px solid ${agent.color}30`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '16px', 
                    background: `${agent.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    overflow: 'hidden',
                    boxShadow: `0 0 20px ${agent.color}30`,
                  }}>
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      agent.emoji
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>{agent.personalName}</h4>
                      <span style={{ 
                        background: isActive ? '#22c55e20' : '#3f3f4620', 
                        color: isActive ? '#22c55e' : '#71717a', 
                        padding: '2px 8px', 
                        borderRadius: '8px', 
                        fontSize: '10px',
                        fontWeight: 600,
                      }}>
                        {isActive ? '●' : '○'} {isActive ? 'Working' : 'Idle'}
                      </span>
                    </div>
                    <p style={{ color: agent.color, fontSize: '12px', marginTop: '2px' }}>{agent.title}</p>
                  </div>
                </div>
                
                <p style={{ color: '#71717a', fontSize: '13px', marginTop: '12px', fontStyle: 'italic' }}>"{agent.tagline}"</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                  <div>
                    <span style={{ color: '#52525b', fontSize: '10px' }}>PROJECT</span>
                    <div style={{ color: agent.color, fontSize: '13px' }}>{agent.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#52525b', fontSize: '10px' }}>SESSIONS</span>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: 600 }}>{agent.sessions || 0}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
