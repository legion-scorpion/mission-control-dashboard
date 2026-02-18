'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Doc {
  title: string
  items: number
  path?: string
  content?: string
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [docContent, setDocContent] = useState('')

  useEffect(() => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        setDocs(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedDoc?.path) {
      fetch(`/api/knowledge?path=${encodeURIComponent(selectedDoc.path)}`)
        .then(res => res.json())
        .then(data => {
          setDocContent(data.content || '')
        })
        .catch(() => setDocContent(''))
    }
  }, [selectedDoc])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030305', padding: '16px', paddingTop: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Knowledge</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Documentation and playbook</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', height: 'calc(100vh - 140px)' }}>
        {/* Document List */}
        <div style={{ overflowY: 'auto' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docs.filter(d => d.path).map((doc, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedDoc(doc)}
                  style={{ 
                    background: selectedDoc?.path === doc.path ? '#2d2d4a' : '#1a1a2e', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '14px' }}>{doc.title}</span>
                  <span style={{ color: '#71717a', fontSize: '12px', marginLeft: '8px' }}>({doc.items} sections)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Content - Rendered Markdown */}
        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
          {selectedDoc ? (
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                {selectedDoc.title}
              </h2>
              <div style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '1.7' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ color: '#e4e4e7', fontSize: '16px', fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>{children}</h3>,
                    p: ({ children }) => <p style={{ marginBottom: '12px' }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ marginBottom: '12px', paddingLeft: '24px' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ marginBottom: '12px', paddingLeft: '24px' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                    code: ({ children }) => <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>{children}</code>,
                    pre: ({ children }) => <pre style={{ background: '#27272a', padding: '16px', borderRadius: '8px', overflow: 'auto', marginBottom: '12px' }}>{children}</pre>,
                    table: ({ children }) => (
                      <div style={{ overflowX: 'auto', marginBottom: '16px', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead style={{ background: '#27272a' }}>{children}</thead>,
                    th: ({ children }) => <th style={{ borderBottom: '1px solid #3f3f46', padding: '12px 16px', textAlign: 'left', color: '#e4e4e7', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{children}</th>,
                    td: ({ children }) => <td style={{ borderBottom: '1px solid #3f3f46', padding: '10px 16px', color: '#a1a1aa', fontSize: '14px' }}>{children}</td>,
                    tr: ({ children }) => <tr style={{ background: '#1a1a2e' }}>{children}</tr>,
                    a: ({ children, href }) => <a href={href} style={{ color: '#60a5fa', textDecoration: 'underline' }}>{children}</a>,
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid #6366f1', paddingLeft: '16px', marginLeft: 0, color: '#a1a1aa', marginBottom: '12px' }}>{children}</blockquote>,
                    hr: () => <hr style={{ border: 'none', borderTop: '1px solid #3f3f46', margin: '24px 0' }} />,
                  }}
                >
                  {docContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p style={{ color: '#71717a', textAlign: 'center', marginTop: '40%' }}>
              Select a document to view its content
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
