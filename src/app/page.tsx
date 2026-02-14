import { systemState, agents, cronHealth, projects, apiCosts, recentActivity } from '@/lib/api'

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default async function HomePage() {
  const [sysData, agentData, cronData, projectData, costs, activity] = await Promise.all([
    systemState(),
    agents(),
    cronHealth(),
    projects(),
    apiCosts(),
    recentActivity()
  ])

  const healthyJobs = cronData?.jobs?.filter((j: any) => j.status === 'ok')?.length ?? 0
  const upServers = sysData?.servers?.filter((s: any) => s.status === 'up')?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Mission Control</h1>
        <p style={{ color: '#71717a', marginTop: '4px' }}>System overview • {new Date().toLocaleDateString()}</p>
      </div>

      {/* Top Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <StatCard value={upServers} label="Servers Up" icon="🖥️" color="#22c55e" />
        <StatCard value={`$${costs.total}`} label="API Costs" icon="💰" color="#f59e0b" />
        <StatCard value={agentData?.sessionCount ?? 0} label="Sessions" icon="💬" color="#8b5cf6" />
        <StatCard value={`${healthyJobs}/${cronData?.jobs?.length ?? 0}`} label="Tests" icon="✅" color={healthyJobs === (cronData?.jobs?.length ?? 0) ? '#22c55e' : '#ef4444'} />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        
        {/* Server Health - Real Checks */}
        <Card title="Server Health" icon="❤️">
          {sysData?.servers?.map((server: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < (sysData?.servers?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: server.status === 'up' ? '#22c55e' : '#ef4444', boxShadow: server.status === 'up' ? '0 0 8px #22c55e' : 'none' }} />
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{server.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#71717a', fontSize: '13px', fontFamily: 'monospace' }}>:{server.port}</span>
                <span style={{ color: server.status === 'up' ? '#22c55e' : '#ef4444', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: server.status === 'up' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                  {server.status}
                </span>
              </div>
            </div>
          ))}
        </Card>

        {/* Project Status */}
        <Card title="Projects" icon="📁">
          {projectData?.projects?.map((project: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < (projectData?.projects?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: project.dirty ? '#f59e0b' : '#22c55e' }} />
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 500, textTransform: 'capitalize' }}>{project.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#8b5cf6', fontSize: '12px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(139,92,246,0.15)' }}>
                  {project.branch}
                </span>
                {project.dirty && (
                  <span style={{ color: '#f59e0b', fontSize: '11px' }}>●</span>
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Cron Jobs */}
        <Card title="Scheduled Jobs" icon="⏰">
          {cronData?.jobs?.map((job: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < (cronData?.jobs?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: job.status === 'ok' ? '#22c55e' : job.status === 'running' ? '#3b82f6' : '#ef4444', fontSize: '14px' }}>
                  {job.status === 'ok' ? '✓' : job.status === 'running' ? '⟳' : '✗'}
                </span>
                <span style={{ color: 'white', fontSize: '14px' }}>{job.name}</span>
              </div>
              <span style={{ color: '#71717a', fontSize: '12px', fontFamily: 'monospace' }}>
                {job.schedule}
              </span>
            </div>
          ))}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" icon="🕐">
          {activity?.sessions?.length > 0 ? (
            activity.sessions.map((session: any, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < (activity?.sessions?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '12px', fontFamily: 'monospace' }}>{session.id.substring(0, 20)}...</span>
                  <span style={{ color: '#52525b', fontSize: '11px' }}>{formatTimeAgo(session.lastActive)}</span>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.lastMessage}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: '#52525b', fontSize: '13px' }}>No recent activity</p>
          )}
        </Card>

      </div>

      <style>{`
        @media (min-width: 768px) {
          div[style*="gridTemplateColumns: repeat(2"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          div[style*="gridTemplateColumns: 1fr"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1280px) {
          div[style*="gridTemplateColumns: 1fr"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}

function StatCard({ value, label, icon, color }: { value: string | number; label: string; icon: string; color: string }) {
  return (
    <div style={{ background: '#18181b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <p style={{ fontSize: '26px', fontWeight: '700', color: color || 'white', margin: 0 }}>{value}</p>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#18181b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
        <h3 style={{ fontSize: '13px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}
