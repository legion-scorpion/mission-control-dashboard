import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface Issue {
  number?: number
  title: string
  labels?: string[]
  project?: string
  owner?: string
  type?: string
  status?: string
  added?: string
  location?: string
  notes?: string
}

function parseIdeasFromBacklog(content: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')
  
  // Map of section names to their display names
  const sections = [
    '🚀 Active Work',
    '📋 Priority Backlog', 
    '🔮 Research & Future',
    '✅ Completed / Automated'
  ]
  
  let currentSection = ''
  let currentIdea: Partial<Issue> = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Check if we're entering a new section
    if (sections.some(s => trimmed.startsWith(s))) {
      // Save previous idea if exists
      if (currentIdea.title) {
        issues.push({
          title: currentIdea.title,
          type: 'idea',
          status: currentIdea.status,
          added: currentIdea.added,
          location: currentIdea.location,
          notes: currentIdea.notes
        })
        currentIdea = {}
      }
      currentSection = trimmed
      continue
    }
    
    // Skip markdown headers and separators
    if (trimmed.startsWith('## ') || trimmed.startsWith('---') || trimmed.startsWith('# ') || !trimmed) {
      continue
    }
    
    // New idea starts with ### - but skip lines that are just project counts or non-ideas
    if (trimmed.startsWith('### ') && 
        !trimmed.match(/^### \w+ \(\d+ open\)/) &&
        !trimmed.match(/^### (Items for|Grooming|Decisions|Next)/i)) {
      // Save previous idea
      if (currentIdea.title) {
        issues.push({
          title: currentIdea.title,
          type: 'idea',
          status: currentIdea.status,
          added: currentIdea.added,
          location: currentIdea.location,
          notes: currentIdea.notes
        })
      }
      currentIdea = { title: trimmed.replace('### ', '').trim() }
    }
    // Parse metadata fields
    else if (trimmed.startsWith('**Status:**')) {
      const match = trimmed.match(/\*\*Status:\*\* (.+?)(?:\s*\|\s*\*\*Added|$)/)
      if (match) currentIdea.status = match[1].trim()
    }
    else if (trimmed.startsWith('**Added:**')) {
      const match = trimmed.match(/\*\*Added:\*\* (.+)/)
      if (match) currentIdea.added = match[1].trim()
    }
    else if (trimmed.startsWith('**Location:**')) {
      const match = trimmed.match(/\*\*Location:\*\* (.+)/)
      if (match) currentIdea.location = match[1].trim()
    }
    else if (trimmed.startsWith('**Note:**')) {
      const match = trimmed.match(/\*\*Note:\*\* (.+)/)
      if (match) currentIdea.notes = match[1].trim()
    }
    else if (trimmed.startsWith('**Notes:**')) {
      const match = trimmed.match(/\*\*Notes:\*\* (.+)/)
      if (match) currentIdea.notes = match[1].trim()
    }
    else if (trimmed.startsWith('**Purpose:**')) {
      const match = trimmed.match(/\*\*Purpose:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + 'Purpose: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Value:**')) {
      const match = trimmed.match(/\*\*Value:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Value: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Effort:**')) {
      const match = trimmed.match(/\*\*Effort:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Effort: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Scope:**')) {
      const match = trimmed.match(/\*\*Scope:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Scope: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Risk Level:**')) {
      const match = trimmed.match(/\*\*Risk Level:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Risk: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Source:**')) {
      const match = trimmed.match(/\*\*Source:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Source: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Blocked By:**')) {
      const match = trimmed.match(/\*\*Blocked By:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Blocked By: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Blocks:**')) {
      const match = trimmed.match(/\*\*Blocks:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Blocks: ' + match[1].trim()
    }
    else if (trimmed.startsWith('**Priority:**')) {
      const match = trimmed.match(/\*\*Priority:\*\* (.+)/)
      if (match) currentIdea.notes = (currentIdea.notes || '') + ' Priority: ' + match[1].trim()
    }
    // Continuation of notes (indented lines, bullets)
    else if ((trimmed.startsWith('-') || trimmed.startsWith('**')) && currentIdea.notes) {
      currentIdea.notes += ' ' + trimmed.replace(/^[-*]+ /, '')
    }
  }
  
  // Save last idea
  if (currentIdea.title) {
    issues.push({
      title: currentIdea.title,
      type: 'idea',
      status: currentIdea.status,
      added: currentIdea.added,
      location: currentIdea.location,
      notes: currentIdea.notes
    })
  }
  
  return issues
}

export async function GET() {
  const issues: Issue[] = []
  const workspaceRoot = '/home/legion/.openclaw/workspace'
  const backlogPath = path.join(workspaceRoot, 'backlog.md')
  
  try {
    const content = fs.readFileSync(backlogPath, 'utf-8')
    
    // Parse ideas from the new backlog.md format
    const ideas = parseIdeasFromBacklog(content)
    issues.push(...ideas)
    
    // Fetch GitHub issues via gh CLI
    try {
      const projects = ['apexform', 'hamono', 'shootrebook', 'stitchai']
      
      for (const proj of projects) {
        const ghResult = execSync(
          `gh issue list --repo krobinsonca/${proj} --state open --limit 50 --json number,title,labels`,
          { encoding: 'utf-8', timeout: 10000 }
        )
        
        const ghIssues = JSON.parse(ghResult)
        
        for (const ghIssue of ghIssues) {
          issues.push({
            number: ghIssue.number,
            title: ghIssue.title,
            project: proj,
            owner: 'krobinsonca',
            labels: ghIssue.labels.map((l: any) => l.name)
          })
        }
      }
    } catch (e) {
      console.error('GitHub API error:', e)
    }
    
    return NextResponse.json({ issues })
    
  } catch (error) {
    console.error('Error reading backlog:', error)
    return NextResponse.json({ issues: [], error: 'Failed to parse backlog' }, { status: 500 })
  }
}
