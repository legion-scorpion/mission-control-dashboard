import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    const stdout = execSync('openclaw channels status --json', { encoding: 'utf-8', timeout: 10000 })
    const data = JSON.parse(stdout)
    
    const channels: any[] = []
    
    // Parse telegram accounts
    if (data.channelAccounts?.telegram) {
      data.channelAccounts.telegram.forEach((account: any) => {
        channels.push({
          name: 'Telegram',
          account: account.name || account.accountId || 'main',
          type: 'T',
          status: account.running ? 'connected' : 'disconnected',
          lastInbound: account.lastInboundAt ? new Date(account.lastInboundAt).toLocaleTimeString() : 'N/A',
          lastOutbound: account.lastOutboundAt ? new Date(account.lastOutboundAt).toLocaleTimeString() : 'N/A',
          mode: account.mode || 'polling'
        })
      })
    }
    
    // Check for other channels in channelMeta
    if (data.channelMeta) {
      data.channelMeta.forEach((ch: any) => {
        const channelId = ch.id
        const existing = channels.find(c => c.name.toLowerCase() === channelId.toLowerCase())
        if (!existing && data.channels?.[channelId]) {
          const chData = data.channels[channelId]
          channels.push({
            name: ch.label || channelId,
            type: channelId.substring(0, 1).toUpperCase(),
            status: chData.running ? 'connected' : 'disconnected',
            lastInbound: 'N/A',
            lastOutbound: 'N/A',
            mode: chData.mode || 'N/A'
          })
        }
      })
    }
    
    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Failed to get channels:', error)
    return NextResponse.json({ channels: [] })
  }
}
