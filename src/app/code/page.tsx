'use client'

import { useState, useEffect } from 'react'

interface Repo {
  name: string
  branch: string
  dirty: boolean
  lastCommit?: string
}

export default function CodePage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/code')
      .then(res => res.json())
      .then(data => {
        setRepos(data.repos || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const repoColors: Record<string, string> = {
    apexform: '#3b82f6',
    hamono: '#f59e0b',
    shootrebook: '#22c55e',
    stitchai: '#8b5cf6',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Code</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Repositories and git status</p>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : repos.length === 0 ? (
        <p style={{ color: '#52525b' }}>No repositories found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {repos.map((repo) => (
            <div key={repo.name} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <span style={{ color: repoColors[repo.name] || '#a1a1aa', fontSize: '20px' }}>📝</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>{repo.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#8b5cf6', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(139,92,246,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                      {repo.branch}
                    </span>
                    {repo.dirty && (
                      <span style={{ color: '#f59e0b', fontSize: '12px' }}>● uncommitted changes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
