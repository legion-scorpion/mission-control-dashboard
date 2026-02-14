import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  // Static list of known cron jobs - parsed from known CLI output format
  // In a real implementation, you'd parse the CLI output more carefully
  const crons = [
    { name: 'Check Legion email inbox', schedule: 'every 30m', status: 'ok' },
    { name: 'Check for Kyle GitHub mentions', schedule: 'every 2h', status: 'ok' },
    { name: 'GitHub Backlog Updater', schedule: 'every 1h', status: 'ok' },
    { name: 'Nightly Backlog Grooming', schedule: 'cron 0 21 * * *', status: 'ok' },
    { name: 'Nightly Maintenance (0h)', schedule: 'cron 0 0 * * *', status: 'ok' },
    { name: 'Nightly Maintenance (2h)', schedule: 'cron 0 2 * * *', status: 'ok' },
    { name: 'Nightly Maintenance (3h)', schedule: 'cron 0 3 * * *', status: 'ok' },
    { name: 'Nightly Maintenance (4h)', schedule: 'cron 0 4 * * *', status: 'ok' },
    { name: 'Weekly Workspace Reset', schedule: 'cron 0 3 * * 0', status: 'idle' },
  ]
  
  return NextResponse.json({
    agents: [
      { id: 'main', name: 'Legion', role: 'Main Agent', model: 'minimax/minimax-m2.5', status: 'active', level: 'L3' },
    ],
    crons
  })
}
