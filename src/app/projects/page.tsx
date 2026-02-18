'use client'

import { useEffect, useState } from 'react'

interface Repo {
  name: string
  branch: string
  dirty: boolean
}

interface Project {
  name: string
  displayName: string
  description: string
  color: string
  icon: string
}

const projects: Project[] = [
  { name: 'apexform', displayName: 'ApexForm', description: 'Fitness tracking app with AI coaching', color: '#3b82f6', icon: '💪' },
  { name: 'hamono', displayName: 'Hamono', description: 'Blade forging idle game', color: '#f59e0b', icon: '⚔️' },
  { name: 'shootrebook', displayName: 'ShootRebook', description: 'Photography booking platform', color: '#22c55e', icon: '📷' },
  { name: 'stitchai', displayName: 'StitchAI', description: 'AI-powered image stitching', color: '#8b5cf6', icon: '🧵' },
]

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/code').then(r => r.json()),
      fetch('/api/kanban').then(r => r.json()),
    ]).then(([codeData, kanbanData]) => {
      setRepos(codeData.repos || [])
      setIssues(kanbanData.issues || [])
      setLoading(false)
    })
  }, [])

  const getRepoStatus = (name: string) => repos.find(r => r.name === name)
  
  const projectIssues = (projectName: string) => 
    issues.filter(i => i.project === projectName).slice(0, 5)

  const filteredProjects = selectedProject === 'all' 
    ? projects 
    : projects.filter(p => p.name === selectedProject)

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
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', margin: 0 }}>Projects</h1>
        <p style={{ color: '#71717a', marginTop: '4px', fontSize: '15px' }}>All your software projects at a glance</p>
      </div>

      {/* Project Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedProject('all')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: selectedProject === 'all' ? '#27273a' : 'transparent',
            color: selectedProject === 'all' ? 'white' : '#71717a',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          All Projects
        </button>
        {projects.map(p => (
          <button
            key={p.name}
            onClick={() => setSelectedProject(p.name)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: selectedProject === p.name ? `${p.color}20` : 'transparent',
              color: selectedProject === p.name ? p.color : '#71717a',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{p.icon}</span>
            {p.displayName}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {filteredProjects.map(project => {
          const repo = getRepoStatus(project.name)
          const projectIssuesList = projectIssues(project.name)
          
          return (
            <div key={project.name} style={{ 
              background: '#0f0f14', 
              borderRadius: '16px', 
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {/* Project Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: `${project.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {project.icon}
                  </div>
                  <div>
                    <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>{project.displayName}</h3>
                    <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>{project.description}</p>
                  </div>
                </div>
              </div>

              {/* Repo Status */}
              <div style={{ 
                background: '#1a1a2e', 
                borderRadius: '10px', 
                padding: '14px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Branch</span>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{repo?.branch || 'unknown'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Status</span>
                    <div style={{ 
                      color: repo?.dirty ? '#f59e0b' : '#22c55e', 
                      fontSize: '14px', 
                      fontWeight: 600 
                    }}>
                      {repo?.dirty ? '● Uncommitted changes' : '● Clean'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Issues */}
              <div>
                <div style={{ color: '#71717a', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>RECENT ISSUES</div>
                {projectIssuesList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {projectIssuesList.map((issue, i) => (
                      <a 
                        key={i}
                        href={`https://github.com/krobinsonca/${project.name}/issues/${issue.number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          background: '#1a1a2e', 
                          borderRadius: '8px', 
                          padding: '10px 12px',
                          textDecoration: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ color: '#e4e4e7', fontSize: '13px' }}>{issue.title}</span>
                        <span style={{ color: '#52525b', fontSize: '12px' }}>#{issue.number}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#52525b', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
                    No open issues
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
