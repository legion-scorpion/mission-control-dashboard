import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/legion/.openclaw/workspace'

export async function GET() {
  try {
    const cronsPath = path.join(WORKSPACE, 'state/crons.json')
    let jobs: any[] = []
    
    if (fs.existsSync(cronsPath)) {
      const content = fs.readFileSync(cronsPath, 'utf-8')
      jobs = JSON.parse(content)
    } else {
      // Default cron jobs
      jobs = [
        { name: 'apexform tests', schedule: '0 0 * * *', status: 'ok', consecutiveErrors: 0 },
        { name: 'hamono tests', schedule: '0 2 * * *', status: 'ok', consecutiveErrors: 0 },
        { name: 'shootrebook tests', schedule: '0 3 * * *', status: 'ok', consecutiveErrors: 0 },
        { name: 'stitchai tests', schedule: '0 4 * * *', status: 'ok', consecutiveErrors: 0 },
      ]
    }

    return NextResponse.json({
      jobs,
      lastUpdated: Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cron health' }, { status: 500 })
  }
}
