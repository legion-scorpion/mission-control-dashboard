import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'

export async function GET() {
  const content: any[] = []
  
  // Get GitHub releases from repos
  const repos = ['apexform', 'hamono', 'shootrebook', 'stitchai']
  
  for (const repo of repos) {
    try {
      const output = execSync(`gh repo view krobinsonca/${repo} --json name,description,defaultBranchRef,updatedAt`, { timeout: 10000 }).toString()
      const data = JSON.parse(output)
      content.push({
        title: repo,
        channel: 'GitHub',
        date: new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: 'active',
        description: data.description || ''
      })
    } catch (e) {
      // Repo might not exist or not have releases
    }
  }
  
  // Get recent memory/knowledge changes
  try {
    const memoryPath = '/home/legion/.openclaw/workspace/memory'
    if (fs.existsSync(memoryPath)) {
      const files = fs.readdirSync(memoryPath).filter(f => f.endsWith('.md'))
      const recentFiles = files.slice(-5).map(f => {
        const stat = fs.statSync(`${memoryPath}/${f}`)
        return {
          title: f,
          channel: 'Memory',
          date: new Date(stat.mtime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'updated'
        }
      })
      content.push(...recentFiles)
    }
  } catch (e) {}
  
  // Get playbook docs as content items
  try {
    const playbookPath = '/home/legion/.openclaw/workspace/knowledge/playbook'
    if (fs.existsSync(playbookPath)) {
      const files = fs.readdirSync(playbookPath).filter(f => f.endsWith('.md'))
      files.forEach(f => {
        const stat = fs.statSync(`${playbookPath}/${f}`)
        content.push({
          title: f.replace('.md', '').replace(/^\d+_/, ''),
          channel: 'Playbook',
          date: new Date(stat.mtime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'active'
        })
      })
    }
  } catch (e) {}
  
  return NextResponse.json({ content })
}
