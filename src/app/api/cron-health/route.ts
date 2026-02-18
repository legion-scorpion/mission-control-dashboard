import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    const output = execSync('openclaw cron list', { timeout: 10000 }).toString()
    const lines = output.trim().split('\n').slice(1) // Skip header
    
    const jobs = lines
      .filter(line => line.trim())
      .map(line => {
        // Extract ID (first 36 chars)
        const id = line.substring(0, 36).trim()
        if (!id) return null
        
        // Find status - it's the word after "ago"
        const statusMatch = line.match(/ago\s+(\S+)/)
        const status = statusMatch ? statusMatch[1] : ''
        
        // Find last - it's the time before "ago"
        const lastMatch = line.match(/(\d+\S+)\s+ago/)
        const last = lastMatch ? lastMatch[1] + ' ago' : ''
        
        // Find next - it's "in X" or "at X" before the last time
        const nextMatch = line.match(/\s+(in|at)\s+(\S+?)\s+(?=\d+\S+\s+ago)/)
        const next = nextMatch ? nextMatch[0].trim() : ''
        
        // Name is between ID and Next (rough extraction)
        let name = ''
        if (nextMatch && nextMatch.index && nextMatch.index > 36) {
          name = line.substring(36, nextMatch.index).trim()
        } else {
          name = line.substring(36, 70).trim()
        }
        
        // Clean up name - remove trailing schedule bits
        name = name.replace(/\s+cron\s+.*$/, '').trim()
        
        return {
          id,
          name,
          next,
          last,
          status
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      jobs,
      lastUpdated: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching cron health:', error)
    return NextResponse.json({ error: 'Failed to fetch cron health' }, { status: 500 })
  }
}
