'use client'

import { useEffect, useState } from 'react'

interface ContentItem {
  title: string
  channel: string
  date: string
  status: string
  description?: string
}

export default function ContentPage() {
  const [posts, setPosts] = useState<ContentItem[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setPosts(data.content)
        }
      })
      .catch(console.error)
  }, [])

  const filtered = filter === 'all' 
    ? posts 
    : posts.filter(p => p.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e'
      case 'published': return '#22c55e'
      case 'updated': return '#3b82f6'
      case 'approved': return '#a855f7'
      case 'draft': return '#f59e0b'
      default: return '#a1a1aa'
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Content</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Content pipeline and publishing</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'active', 'draft', 'updated'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              background: filter === f ? '#27273a' : 'transparent', 
              color: filter === f ? 'white' : '#a1a1aa', 
              border: 'none', 
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#71717a' }}>No content found</p>
        ) : filtered.map((post, i) => (
          <div key={i} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '16px' }}>{post.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{post.channel} • {post.date}</p>
              {post.description && <p style={{ color: '#71717a', fontSize: '13px', marginTop: '4px' }}>{post.description}</p>}
            </div>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '4px', 
              fontSize: '12px',
              background: getStatusColor(post.status),
              color: 'white'
            }}>
              {post.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
