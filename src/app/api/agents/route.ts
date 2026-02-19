import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'

// Full agent profiles
const agentProfiles: Record<string, any> = {
  'Legion': {
    id: 'main',
    name: 'Legion',
    personalName: 'The Boss',
    title: 'Chief Operations Officer',
    tagline: 'Fix first, chat second',
    emoji: '🦂',
    color: '#7c3aed',
    personality: 'Direct, efficient, always busy',
    avatar: '/avatars/legion-avatar.png',
    isMain: true,
  },
  'ApexForm': {
    id: 'apexform',
    name: 'ApexForm',
    personalName: 'Apex',
    title: 'Lead Fitness Engineer',
    tagline: 'Making gains, not excuses',
    emoji: '💪',
    color: '#3b82f6',
    personality: 'Driven, data-focused, always optimizing workouts',
    avatar: '/avatars/apexform-avatar.png',
    isMain: false,
  },
  'Hamono': {
    id: 'hamono',
    name: 'Hamono',
    personalName: 'Hiro',
    title: 'Master Smith',
    tagline: 'Every blade tells a story',
    emoji: '⚔️',
    color: '#f59e0b',
    personality: 'Patient, artistic, takes pride in craft',
    avatar: '/avatars/hamono-avatar.png',
    isMain: false,
  },
  'ShootRebook': {
    id: 'shootrebook',
    name: 'ShootRebook',
    personalName: 'Shutter',
    title: 'Studio Manager',
    tagline: 'Never miss a moment',
    emoji: '📷',
    color: '#22c55e',
    personality: 'Organized, punctual, customer-focused',
    avatar: '/avatars/shootrebook-avatar.png',
    isMain: false,
  },
  'StitchAI': {
    id: 'stitchai',
    name: 'StitchAI',
    personalName: 'Stitch',
    title: 'Visionary Artist',
    tagline: 'Sewing memories together',
    emoji: '🧵',
    color: '#8b5cf6',
    personality: 'Creative, dreamy, sees patterns everywhere',
    avatar: '/avatars/stitchai-avatar.png',
    isMain: false,
  },
}

function getProfile(agentName: string) {
  return agentProfiles[agentName] || {
    id: agentName.toLowerCase(),
    name: agentName,
    personalName: agentName,
    title: 'Developer',
    tagline: 'Getting things done',
    emoji: '🤖',
    color: '#71717a',
    personality: 'Helpful',
    avatar: null,
    isMain: false,
  }
}

export async function GET() {
  // Get all configured agents
  let agents: any[] = []
  
  try {
    const output = execSync('openclaw config get agents.list --json', { timeout: 10000 }).toString()
    const agentConfig = JSON.parse(output)
    
    for (const agent of agentConfig) {
      const profile = getProfile(agent.name)
      
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
        ...profile,
        status,
        sessions: sessionCount,
      })
    }
  } catch (e) {
    console.error('Failed to get agents:', e)
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
