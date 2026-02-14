import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const docs: { title: string; items: number; path?: string }[] = []
  const workspace = '/home/legion/.openclaw/workspace'
  const playbookDir = path.join(workspace, 'knowledge', 'playbook')
  
  try {
    // Check playbook directory
    if (fs.existsSync(playbookDir)) {
      const files = fs.readdirSync(playbookDir)
      const mdFiles = files.filter(f => f.endsWith('.md'))
      
      for (const file of mdFiles) {
        const filePath = path.join(playbookDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.startsWith('## ')).length
        
        docs.push({
          title: file.replace('.md', '').replace(/^\d+_/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          items: lines,
          path: `/knowledge/playbook/${file}`
        })
      }
    }
    
    // Also check for other knowledge docs
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
    
    // Add static docs
    docs.push(
      { title: 'Issue Management', items: 3 },
      { title: 'Cron Jobs', items: 8 },
      { title: 'Communication Channels', items: 3 },
      { title: 'API Configurations', items: 5 },
    )
    
  } catch (error) {
    console.error('Error reading knowledge:', error)
  }
  
  return NextResponse.json({ docs })
}
