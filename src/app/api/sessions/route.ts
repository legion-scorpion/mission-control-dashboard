import { NextResponse } from 'next/server'
import fs from 'fs'

export async function GET() {
  try {
    // Read sessions directly from the sessions.json file
    const sessionsPath = '/home/legion/.openclaw/agents/main/sessions/sessions.json'
    const content = fs.readFileSync(sessionsPath, 'utf-8')
    const data = JSON.parse(content)
    
    function formatTime(timestamp: number): string {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    
    function formatTimeAgo(timestamp: number): string {
      const seconds = Math.floor((Date.now() - timestamp) / 1000)
      if (seconds < 60) return 'just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      return `${Math.floor(seconds / 86400)}d ago`
    }
    
    // Parse sessions from the JSON file
    const sessions: any[] = []
    
    for (const [key, value] of Object.entries(data)) {
      const s = value as any
      
      // Determine session type from key
      let type = 'unknown'
      let name = key
      
      if (key.includes('telegram:group:')) {
        type = 'Telegram Group'
        name = 'Telegram Group'
      } else if (key.includes('telegram:')) {
        type = 'Telegram'
        name = 'Telegram'
      } else if (key.includes('cron:')) {
        type = 'Cron'
        name = key.includes(':run:') ? 'Cron Job Run' : 'Cron Job'
      } else if (key.includes('subagent:')) {
        type = 'Subagent'
        name = 'Subagent'
      } else if (key.startsWith('agent:main:')) {
        type = 'Main'
        name = 'Main Session'
      }
      
      sessions.push({
        id: key,
        name,
        type,
        status: s.abortedLastRun === false && Date.now() - (s.updatedAt || 0) < 300000 ? 'Active' : formatTimeAgo(s.updatedAt || Date.now()),
        message: s.lastInput?.substring(0, 60) || s.lastMessage?.substring(0, 60) || 'No recent messages',
        time: formatTime(s.updatedAt || Date.now()),
        lastActive: s.updatedAt,
      })
    }
    
    // Sort by last active, newest first
    sessions.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0))
    
    return NextResponse.json({ sessions: sessions.slice(0, 20) })
    
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ sessions: [] }, { status: 200 }) // Return empty array, not error
  }
}
