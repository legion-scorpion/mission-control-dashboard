import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const PROJECTS = ['apexform', 'hamono', 'shootrebook', 'stitchai']
const WORKSPACE = '/home/legion/.openclaw/workspace'

export async function GET() {
  const repos: any[] = []
  
  for (const project of PROJECTS) {
    const projectPath = `${WORKSPACE}/${project}`
    
    try {
      // Check if directory exists
      fs.accessSync(projectPath)
      
      // Get git branch
      let branch = 'unknown'
      try {
        const headContent = fs.readFileSync(path.join(projectPath, '.git', 'HEAD'), 'utf-8').trim()
        if (headContent.startsWith('ref: refs/heads/')) {
          branch = headContent.replace('ref: refs/heads/', '')
        } else {
          branch = headContent.substring(0, 7)
        }
      } catch {}
      
      // Check for uncommitted changes
      let dirty = false
      try {
        const stdout = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf-8' })
        dirty = stdout.trim().length > 0
      } catch {}
      
      repos.push({
        name: project,
        branch,
        dirty,
      })
    } catch {
      // Project doesn't exist or isn't a git repo
    }
  }
  
  return NextResponse.json({ repos })
}
