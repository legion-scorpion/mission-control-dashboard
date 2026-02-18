'use client'

import { useState, useEffect } from 'react'

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
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  
  useEffect(() => {
    fetch('/api/kanban')
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    // Project filter
    if (filterProject !== 'all' && issue.project !== filterProject) {
      return false
    }
    // Type filter
    if (filterType === 'github' && (issue.type === 'idea' || issue.type === 'task')) {
      return false
    }
    if (filterType === 'ideas' && (!issue.type || (issue.type !== 'idea' && issue.type !== 'task'))) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchTitle = issue.title.toLowerCase().includes(query)
      const matchLabels = issue.labels?.some(l => l.toLowerCase().includes(query))
      const matchProject = issue.project?.toLowerCase().includes(query)
      if (!matchTitle && !matchLabels && !matchProject) {
        return false
      }
    }
    return true
  })

  const stats = {
    apexform: issues.filter(i => i.project === 'apexform').length,
    hamono: issues.filter(i => i.project === 'hamono').length,
    shootrebook: issues.filter(i => i.project === 'shootrebook').length,
    stitchai: issues.filter(i => i.project === 'stitchai').length,
    ideas: issues.filter(i => i.type === 'idea' || i.type === 'task').length,
    github: issues.filter(i => !i.type || i.type === 'issue').length,
    total: issues.length
  }

  // Group by type/status
  const ideas = filteredIssues.filter(i => i.type === 'idea' || i.type === 'task')
  const githubIssues = filteredIssues.filter(i => !i.type || i.type === 'issue')

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
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Kanban Board</h1>
            <p style={{ color: '#71717a', marginTop: '4px', fontSize: '14px' }}>
              {filteredIssues.length} items {searchQuery || filterProject !== 'all' || filterType !== 'all' ? '(filtered)' : ''}
            </p>
          </div>
          
          {/* Search & Filter Toggle */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '14px',
                  width: '200px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? '#3b82f6' : '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              �_filter
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ 
            background: '#18181b', 
            borderRadius: '12px', 
            padding: '16px', 
            marginTop: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            {/* Project Filter */}
            <div>
              <label style={{ color: '#71717a', fontSize: '12px', display: 'block', marginBottom: '8px' }}>PROJECT</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All', color: '#71717a' },
                  { id: 'apexform', label: 'ApexForm', color: '#3b82f6' },
                  { id: 'hamono', label: 'Hamono', color: '#f59e0b' },
                  { id: 'shootrebook', label: 'ShootRebook', color: '#22c55e' },
                  { id: 'stitchai', label: 'StitchAI', color: '#8b5cf6' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFilterProject(p.id)}
                    style={{
                      background: filterProject === p.id ? `${p.color}20` : '#27272a',
                      border: `1px solid ${filterProject === p.id ? p.color : '#3f3f46'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: filterProject === p.id ? p.color : '#a1a1aa',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ color: '#71717a', fontSize: '12px', display: 'block', marginBottom: '8px' }}>TYPE</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'github', label: 'GitHub Issues', icon: '🐙' },
                  { id: 'ideas', label: 'Ideas/Tasks', icon: '💡' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    style={{
                      background: filterType === t.id ? '#3b82f620' : '#27272a',
                      border: `1px solid ${filterType === t.id ? '#3b82f6' : '#3f3f46'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: filterType === t.id ? '#3b82f6' : '#a1a1aa',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(filterProject !== 'all' || filterType !== 'all' || searchQuery) && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    setFilterProject('all')
                    setFilterType('all')
                    setSearchQuery('')
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: '#3b82f6', fontSize: '13px' }}>ApexForm: {stats.apexform}</span>
          <span style={{ color: '#f59e0b', fontSize: '13px' }}>Hamono: {stats.hamono}</span>
          <span style={{ color: '#22c55e', fontSize: '13px' }}>ShootRebook: {stats.shootrebook}</span>
          <span style={{ color: '#8b5cf6', fontSize: '13px' }}>StitchAI: {stats.stitchai}</span>
          <span style={{ color: '#fbbf24', fontSize: '13px' }}>Ideas: {stats.ideas}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* GitHub Issues Column */}
        <div style={{ background: '#18181b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🐙</span>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>GitHub Issues</h3>
            </div>
            <span style={{ fontSize: '12px', color: '#52525b', background: '#27272a', padding: '2px 8px', borderRadius: '4px' }}>
              {githubIssues.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {githubIssues.map((item, i) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    color: getProjectColor(item.project || ''),
                    background: `${getProjectColor(item.project || '')}20`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 500,
                  }}>
                    {item.project}
                  </span>
                  {item.number && (
                    <span style={{ fontSize: '11px', color: '#52525b' }}>
                      #{item.number}
                    </span>
                  )}
                </div>
                <p style={{ color: '#e4e4e7', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                  {item.title}
                </p>
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
            {githubIssues.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#52525b', fontSize: '13px' }}>
                No issues match your filters
              </div>
            )}
          </div>
        </div>

        {/* Ideas Column */}
        <div style={{ background: '#18181b', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>Ideas & Tasks</h3>
            </div>
            <span style={{ fontSize: '12px', color: '#52525b', background: '#27272a', padding: '2px 8px', borderRadius: '4px' }}>
              {ideas.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {ideas.map((item, i) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#fbbf24',
                    background: '#fbbf2420',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 500,
                  }}>
                    {item.type === 'idea' ? '💡 Idea' : '📋 Task'}
                  </span>
                  {item.status && (
                    <span style={{ fontSize: '10px', color: '#71717a' }}>
                      {item.status}
                    </span>
                  )}
                </div>
                <p style={{ color: '#e4e4e7', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                  {item.title}
                </p>
                {(item.location || item.added) && (
                  <div style={{ fontSize: '10px', color: '#71717a', marginTop: '8px', display: 'flex', gap: '8px' }}>
                    {item.location && <span>📁 {item.location}</span>}
                    {item.added && <span>📅 {item.added}</span>}
                  </div>
                )}
              </div>
            ))}
            {ideas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#52525b', fontSize: '13px' }}>
                No ideas match your filters
              </div>
            )}
          </div>
        </div>
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

            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.4 }}>
              {selectedIssue.title}
            </h2>

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
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
