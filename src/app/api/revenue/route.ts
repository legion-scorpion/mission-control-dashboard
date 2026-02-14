import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/legion/.openclaw/workspace'

export async function GET() {
  try {
    const revenuePath = path.join(WORKSPACE, 'state/revenue.json')
    let revenue: any = { current: 0, monthlyBurn: 0, net: 0 }
    
    if (fs.existsSync(revenuePath)) {
      const content = fs.readFileSync(revenuePath, 'utf-8')
      revenue = JSON.parse(content)
    }

    return NextResponse.json({
      ...revenue,
      lastUpdated: Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
  }
}
