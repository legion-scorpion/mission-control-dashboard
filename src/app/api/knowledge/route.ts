import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const docPath = searchParams.get('path')
  
  const docs: { title: string; items: number; path?: string }[] = []
  const workspace = '/home/legion/.openclaw/workspace'
  const playbookDir = path.join(workspace, 'knowledge', 'playbook')
  
  // If a specific path is requested, return its content
  if (docPath) {
    const fullPath = path.join(workspace, docPath)
    if (fs.existsSync(fullPath) && fullPath.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      return NextResponse.json({ content })
    }
    return NextResponse.json({ content: '' })
  }
  
  // Otherwise return the list of documents
  try {
    if (fs.existsSync(playbookDir)) {
      const files = fs.readdirSync(playbookDir)
      const mdFiles = files.filter(f => f.endsWith('.md')).sort()
      
      for (const file of mdFiles) {
        const filePath = path.join(playbookDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.startsWith('## ')).length
        
        docs.push({
          title: file.replace('.md', '').replace(/^\d+_/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          items: lines,
          path: `knowledge/playbook/${file}`
        })
      }
    }
    
    const memoryDir = path.join(workspace, 'memory')
    if (fs.existsSync(memoryDir)) {
      const mdFiles = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'))
      if (mdFiles.length > 0) {
        docs.push({
          title: 'Memory Files',
          items: mdFiles.length
        })
      }
    }
    
  } catch (error) {
    console.error('Error reading knowledge:', error)
  }
  
  return NextResponse.json({ docs })
}
