import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/legion/.openclaw/workspace'

export async function GET() {
  try {
    // Try to read servers.json
    const serversPath = path.join(WORKSPACE, 'state/servers.json')
    let servers: any[] = []
    
    if (fs.existsSync(serversPath)) {
      const content = fs.readFileSync(serversPath, 'utf-8')
      servers = JSON.parse(content)
    } else {
      // Default mock data if file doesn't exist
      servers = [
        { name: 'OpenClaw Gateway', status: 'up', port: 18789, lastCheck: Date.now() },
        { name: 'Dashboard Server', status: 'up', port: 8080, lastCheck: Date.now() },
        { name: 'Local LLM Server', status: 'up', port: 1234, lastCheck: Date.now() },
      ]
    }

    // Try to read branch-check.json
    const branchPath = path.join(WORKSPACE, 'state/branch-check.json')
    let branchStatus: any = null
    if (fs.existsSync(branchPath)) {
      const content = fs.readFileSync(branchPath, 'utf-8')
      branchStatus = JSON.parse(content)
    }

    return NextResponse.json({
      servers,
      branchStatus,
      lastUpdated: Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch system state' }, { status: 500 })
  }
}
