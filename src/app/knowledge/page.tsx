'use client'

import { useState, useEffect } from 'react'

interface Doc {
  title: string
  items: number
  path?: string
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        setDocs(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Knowledge</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Documentation and playbook</p>
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#71717a' }}>🔍</span>
          <input
            type="text"
            placeholder="Search knowledge base..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : docs.length === 0 ? (
        <p style={{ color: '#52525b' }}>No documents found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#a1a1aa' }}>📄</span>
                <span style={{ color: 'white', fontSize: '16px' }}>{doc.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#a1a1aa', fontSize: '14px' }}>({doc.items})</span>
                <span style={{ color: '#71717a' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
