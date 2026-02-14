import { NextResponse } from 'next/server'

export async function GET() {
  // Get channel info from openclaw config
  try {
    const { execSync } = await import('child_process')
    const stdout = execSync('openclaw channels status --json 2>/dev/null', { encoding: 'utf-8', timeout: 5000 })
    const channelsData = JSON.parse(stdout)
    
    const channels = Array.isArray(channelsData) 
      ? channelsData.map((ch: any) => ({
          name: ch.name || ch.channel || 'Unknown',
          type: ch.channel?.substring(0, 1).toUpperCase() || '?',
          status: ch.connected || ch.status === 'connected' ? 'connected' : 'disconnected',
          count: ch.conversations || ch.sessions || 0,
          label: ch.conversations ? 'conversations' : ch.sessions ? 'sessions' : undefined,
        }))
      : []
    
    return NextResponse.json({ channels })
  } catch {
    // Return default channels if CLI fails
    return NextResponse.json({
      channels: [
        { name: 'Telegram', type: 'T', status: 'connected', count: 2, label: 'conversations' },
      ]
    })
  }
}
