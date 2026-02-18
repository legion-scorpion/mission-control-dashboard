import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Agent personas
const agentPersonas: Record<string, { emoji: string, color: string, tagline: string, role: string }> = {
  'Legion': { emoji: '🦂', color: '#7c3aed', tagline: 'Fix first, chat second', role: 'Main Agent' },
  'ApexForm': { emoji: '💪', color: '#3b82f6', tagline: 'Fitness focused', role: 'Project Agent' },
  'Hamono': { emoji: '⚔️', color: '#f59e0b', tagline: 'Forging blades', role: 'Project Agent' },
  'ShootRebook': { emoji: '📷', color: '#22c55e', tagline: 'Booking photography', role: 'Project Agent' },
  'StitchAI': { emoji: '🧵', color: '#8b5cf6', tagline: 'Stitching visions', role: 'Project Agent' },
}

function getPersona(agentName: string) {
  return agentPersonas[agentName] || { emoji: '🤖', color: '#71717a', tagline: 'Getting things done', role: 'Agent' }
}

export async function GET() {
  // Get all configured agents
  let agents: any[] = []
  
  try {
    const output = execSync('openclaw config get agents.list --json', { timeout: 10000 }).toString()
    const agentConfig = JSON.parse(output)
    
    for (const agent of agentConfig) {
      const persona = getPersona(agent.name)
      
      // Get session count for this agent
      let sessionCount = 0
      const sessionsPath = `/home/legion/.openclaw/agents/${agent.id}/sessions/sessions.json`
      try {
        if (fs.existsSync(sessionsPath)) {
          const sessionsData = fs.readFileSync(sessionsPath, 'utf-8')
          const sessions = JSON.parse(sessionsData)
          sessionCount = Object.keys(sessions).length
        }
      } catch {}
      
      // Determine status based on recent sessions
      let status = 'idle'
      try {
        const sessionsPath = `/home/legion/.openclaw/agents/${agent.id}/sessions/sessions.json`
        if (fs.existsSync(sessionsPath)) {
          const sessionsData = fs.readFileSync(sessionsPath, 'utf-8')
          const sessions = JSON.parse(sessionsData)
          const now = Date.now()
          for (const s of Object.values(sessions) as any[]) {
            if (s.updatedAt && now - s.updatedAt < 300000) { // 5 min
              status = 'active'
              break
            }
          }
        }
      } catch {}
      
      agents.push({
        id: agent.id,
        name: agent.name,
        role: persona.role,
        emoji: persona.emoji,
        color: persona.color,
        tagline: persona.tagline,
        model: 'minimax/minimax-m2.5',
        status,
        sessions: sessionCount,
      })
    }
  } catch (e) {
    console.error('Failed to get agents:', e)
    // Fallback to main agent
    agents.push({
      id: 'main',
      name: 'Legion',
      role: 'Main Agent',
      emoji: '🦂',
      color: '#7c3aed',
      tagline: 'Fix first, chat second',
      model: 'minimax/minimax-m2.5',
      status: 'active',
      sessions: 0,
    })
  }
  
  // Get cron jobs
  let crons: any[] = []
  try {
    const output = execSync('openclaw cron list', { timeout: 10000 }).toString()
    const lines = output.trim().split('\n').slice(1)
    
    crons = lines
      .filter(line => line.trim())
      .map(line => {
        const id = line.substring(0, 36).trim()
        if (!id) return null
        
        const statusMatch = line.match(/ago\s+(\S+)/)
        const status = statusMatch ? statusMatch[1] : ''
        
        const lastMatch = line.match(/(\d+\S+)\s+ago/)
        const last = lastMatch ? lastMatch[1] + ' ago' : ''
        
        const nextMatch = line.match(/\s+(in|at)\s+(\S+?)\s+(?=\d+\S+\s+ago)/)
        const next = nextMatch ? nextMatch[0].trim() : ''
        
        let name = ''
        if (nextMatch && nextMatch.index && nextMatch.index > 36) {
          name = line.substring(36, nextMatch.index).trim()
        } else {
          name = line.substring(36, 70).trim()
        }
        name = name.replace(/\s+cron\s+.*$/, '').trim()
        
        return { id, name, next, last, status }
      })
      .filter(Boolean)
  } catch (e) {
    console.error('Failed to get cron jobs:', e)
  }
  
  return NextResponse.json({
    agents,
    crons
  })
}
