import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    responseTime: Date.now() - startTime,
    timestamp: Date.now(),
  })
}
