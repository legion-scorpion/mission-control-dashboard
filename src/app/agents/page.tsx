'use client'

import { useState, useEffect } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  model: string
  status: string
  level: string
}

interface CronJob {
  name: string
  schedule: string
  status: string
  nextRun?: string
}

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState('agents')
  const [agents, setAgents] = useState<Agent[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || [])
        setCronJobs(data.crons || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Agents & Jobs</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Agent registry, models, and scheduled jobs</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('agents')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'agents' ? '#27273a' : 'transparent',
            color: activeTab === 'agents' ? 'white' : '#a1a1aa',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'jobs' ? '#27273a' : 'transparent',
            color: activeTab === 'jobs' ? 'white' : '#a1a1aa',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cron Jobs ({cronJobs.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : activeTab === 'agents' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {agents.length === 0 ? (
            <p style={{ color: '#52525b' }}>No agents found</p>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>{agent.name}</h3>
                      <span style={{ color: '#22c55e', fontSize: '12px' }}>● {agent.status}</span>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{agent.role}</p>
                    <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>{agent.model} | {agent.level}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {cronJobs.length === 0 ? (
            <p style={{ color: '#52525b' }}>No cron jobs found</p>
          ) : (
            cronJobs.map((job, i) => (
              <div key={i} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: job.status === 'ok' ? '#22c55e' : '#ef4444', fontSize: '14px' }}>
                      {job.status === 'ok' ? '✓' : job.status === 'running' ? '⟳' : '✗'}
                    </span>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>{job.name}</h3>
                  </div>
                  <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>{job.schedule}</p>
                </div>
                {job.nextRun && (
                  <span style={{ color: '#8b5cf6', fontSize: '11px', fontFamily: 'monospace' }}>
                    {job.nextRun}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
