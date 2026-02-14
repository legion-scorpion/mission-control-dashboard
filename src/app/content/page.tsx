'use client'

export default function ContentPage() {
  const posts = [
    { title: 'ApexForm v2.0 Release Notes', channel: 'Blog', date: 'Feb 12', status: 'posted' },
    { title: 'Hamono Game Dev Update', channel: 'Discord', date: 'Feb 11', status: 'posted' },
    { title: 'StitchAI Feature Spotlight', channel: 'Twitter', date: 'Feb 10', status: 'draft' },
    { title: 'Weekly Digest #24', channel: 'Newsletter', date: 'Feb 9', status: 'approved' },
    { title: 'Lakehill Photography Blog', channel: 'Website', date: 'Feb 8', status: 'published' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Content</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Content pipeline and publishing</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#27273a', color: 'white', border: 'none', fontSize: '14px' }}>All</button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: '#a1a1aa', border: 'none', fontSize: '14px' }}>Draft</button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: '#a1a1aa', border: 'none', fontSize: '14px' }}>Scheduled</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post, i) => (
          <div key={i} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '16px' }}>{post.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{post.channel} • {post.date}</p>
            </div>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '4px', 
              fontSize: '12px',
              background: post.status === 'published' ? '#22c55e' : '#a1a1aa',
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
