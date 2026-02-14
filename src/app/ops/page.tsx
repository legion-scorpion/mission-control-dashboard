'use client'

import { useState, useEffect } from 'react'

interface BacklogItem {
  title: string
  status?: string
  added?: string
  location?: string
  note?: string
  notes?: string
  source?: string
  model?: string
}

interface Issue {
  number?: number
  title: string
  labels?: string[]
  project?: string
  owner?: string
  type?: string
  status?: string
  added?: string
  location?: string
  notes?: string
}

function getProjectColor(project: string): string {
  const colors: Record<string, string> = {
    apexform: '#3b82f6',
    hamono: '#f59e0b', 
    shootrebook: '#22c55e',
    stitchai: '#8b5cf6',
  }
  return colors[project] || '#71717a'
}

function getProjectUrl(project: string, owner: string): string {
  return `https://github.com/${owner}/${project}`
}

function getIssueUrl(project: string, owner: string, number: number): string {
  return `https://github.com/${owner}/${project}/issues/${number}`
}

export default function KanbanPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Issue[]>([])
  
  useEffect(() => {
    fetch('/api/kanban')
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const columns = [
    { id: 'backlog', title: 'Backlog', color: '#ef4444' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#22c55e' },
  ]

  const backlogIssues = issues.filter(i => !i.type || (i.type !== 'idea' && i.type !== 'task'))
  const ideas = issues.filter(i => i.type === 'idea' || i.type === 'task')
  const allBacklog = [...backlogIssues, ...ideas]

  const stats = {
    apexform: issues.filter(i => i.project === 'apexform').length,
    hamono: issues.filter(i => i.project === 'hamono').length,
    shootrebook: issues.filter(i => i.project === 'shootrebook').length,
    stitchai: issues.filter(i => i.project === 'stitchai').length,
    ideas: ideas.length,
    total: issues.length
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#71717a' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Kanban Board</h1>
        <p style={{ color: '#71717a', marginTop: '4px' }}>
          {stats.total} items ({stats.total - stats.ideas} GitHub issues + {stats.ideas} ideas/tasks)
          <span style={{ marginLeft: '16px' }}>
            <span style={{ color: '#3b82f6' }}>apexform: {stats.apexform}</span>
            <span style={{ marginLeft: '12px', color: '#f59e0b' }}>hamono: {stats.hamono}</span>
            <span style={{ marginLeft: '12px', color: '#22c55e' }}>shootrebook: {stats.shootrebook}</span>
            <span style={{ marginLeft: '12px', color: '#8b5cf6' }}>stitchai: {stats.stitchai}</span>
          </span>
        </p>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {columns.map((col) => {
          const items = col.id === 'backlog' ? allBacklog : col.id === 'in-progress' ? [] : []
          
          return (
            <div key={col.id} style={{ background: '#18181b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '500px' }}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{col.title}</h3>
                </div>
                <span style={{ fontSize: '12px', color: '#52525b', background: '#27272a', padding: '2px 8px', borderRadius: '4px' }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedIssue(item)}
                    style={{ 
                      background: '#27272a', 
                      borderRadius: '8px', 
                      padding: '12px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3f3f46'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#27272a'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Type/Project Badge */}
                    <div style={{ marginBottom: '8px' }}>
                      {item.type === 'idea' || item.type === 'task' ? (
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#fbbf24',
                          background: '#fbbf2420',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          💡 {item.type === 'idea' ? 'Idea' : 'Task'}
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '10px', 
                          color: getProjectColor(item.project || ''),
                          background: `${getProjectColor(item.project || '')}20`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          {item.project}
                        </span>
                      )}
                      {item.number && (
                        <span style={{ fontSize: '10px', color: '#52525b', marginLeft: '6px' }}>
                          #{item.number}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <p style={{ color: '#e4e4e7', fontSize: '13px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {item.title}
                    </p>
                    
                    {/* Meta for ideas */}
                    {(item.type === 'idea' || item.type === 'task') && (
                      <div style={{ fontSize: '10px', color: '#71717a' }}>
                        {item.location && <span>📁 {item.location}</span>}
                        {item.added && <span style={{ marginLeft: '8px' }}>📅 {item.added}</span>}
                      </div>
                    )}
                    
                    {/* Labels */}
                    {item.labels && item.labels.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {item.labels.slice(0, 3).map((label, j) => (
                          <span key={j} style={{ 
                            fontSize: '9px', 
                            color: '#a1a1aa',
                            background: '#3f3f46',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>
                            {label}
                          </span>
                        ))}
                        {item.labels.length > 3 && (
                          <span style={{ fontSize: '9px', color: '#52525b' }}>
                            +{item.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#52525b', fontSize: '13px' }}>
                    No items
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedIssue && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedIssue(null)}
        >
          <div 
            style={{
              background: '#18181b',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                {(selectedIssue.type === 'idea' || selectedIssue.type === 'task') ? (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#fbbf24',
                    background: '#fbbf2420',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 500,
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}>
                    💡 {selectedIssue.type === 'idea' ? 'Idea' : 'Task'}
                  </span>
                ) : (
                  <>
                    <span style={{ 
                      fontSize: '12px', 
                      color: getProjectColor(selectedIssue.project || ''),
                      background: `${getProjectColor(selectedIssue.project || '')}20`,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      display: 'inline-block',
                      marginBottom: '8px',
                    }}>
                      {selectedIssue.project}
                    </span>
                    {selectedIssue.number && (
                      <span style={{ fontSize: '12px', color: '#52525b', marginLeft: '8px' }}>
                        #{selectedIssue.number}
                      </span>
                    )}
                  </>
                )}
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Title */}
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.4 }}>
              {selectedIssue.title}
            </h2>

            {/* Details for Ideas/Tasks */}
            {(selectedIssue.type === 'idea' || selectedIssue.type === 'task') && (
              <div style={{ marginBottom: '20px' }}>
                {selectedIssue.status && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#71717a', fontSize: '12px' }}>Status: </span>
                    <span style={{ color: '#fbbf24', fontSize: '12px' }}>{selectedIssue.status}</span>
                  </div>
                )}
                {selectedIssue.added && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#71717a', fontSize: '12px' }}>Added: </span>
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{selectedIssue.added}</span>
                  </div>
                )}
                {selectedIssue.location && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#71717a', fontSize: '12px' }}>Location: </span>
                    <span style={{ color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}>{selectedIssue.location}</span>
                  </div>
                )}
                {selectedIssue.notes && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#71717a', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Notes:</span>
                    <div style={{ color: '#e4e4e7', fontSize: '13px', lineHeight: 1.6, background: '#27272a', padding: '12px', borderRadius: '8px' }}>
                      {selectedIssue.notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Labels for GitHub Issues */}
            {selectedIssue.labels && selectedIssue.labels.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {selectedIssue.labels.map((label, i) => (
                  <span key={i} style={{ 
                    fontSize: '12px', 
                    color: '#a1a1aa',
                    background: '#27272a',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            {selectedIssue.project && selectedIssue.owner && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {selectedIssue.number ? (
                  <a 
                    href={getIssueUrl(selectedIssue.project, selectedIssue.owner, selectedIssue.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'inline-block',
                    }}
                  >
                    View on GitHub →
                  </a>
                ) : (
                  <a 
                    href={getProjectUrl(selectedIssue.project, selectedIssue.owner)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'inline-block',
                    }}
                  >
                    View Project →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
