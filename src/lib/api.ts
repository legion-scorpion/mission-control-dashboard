// Server-side API functions for SSR

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/legion/.openclaw/workspace'
const PROJECTS = ['apexform', 'hamono', 'shootrebook', 'stitchai']

async function readJsonFile(path: string): Promise<any> {
  const fs = await import('fs/promises')
  try {
    const content = await fs.readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function checkPort(port: number, host: string = '127.0.0.1'): Promise<boolean> {
  const net = await import('net')
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(1000)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function getGitStatus(repoPath: string): Promise<{ branch: string; ahead: number; behind: number; dirty: boolean } | null> {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    const gitDir = path.join(repoPath, '.git')
    await fs.access(gitDir)
    
    // Read branch from HEAD
    const headPath = path.join(gitDir, 'HEAD')
    const headContent = (await fs.readFile(headPath, 'utf-8')).trim()
    
    let branch = 'unknown'
    if (headContent.startsWith('ref: refs/heads/')) {
      branch = headContent.replace('ref: refs/heads/', '')
    } else {
      branch = headContent.substring(0, 7)
    }
    
    // Check for uncommitted changes
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    let dirty = false
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: repoPath })
      dirty = stdout.trim().length > 0
    } catch {}
    
    return { branch, ahead: 0, behind: 0, dirty }
  } catch {
    return null
  }
}

async function getGitHubIssues(owner: string, repo: string): Promise<any[]> {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const { stdout } = await execAsync(`gh issue list --repo ${owner}/${repo} --state open --json number,title,labels --limit 50`, { timeout: 10000 })
    const issues = JSON.parse(stdout)
    return issues.map((issue: any) => ({
      number: issue.number,
      title: issue.title,
      labels: issue.labels.map((l: any) => l.name),
      project: repo,
      owner
    }))
  } catch {
    return []
  }
}

export async function systemState() {
  try {
    const [gatewayUp, llmUp, dashboardUp] = await Promise.all([
      checkPort(18789),
      checkPort(1234),
      checkPort(18787)
    ])
    
    const servers = [
      { name: 'OpenClaw Gateway', status: gatewayUp ? 'up' : 'down', port: 18789, lastCheck: Date.now() },
      { name: 'Dashboard Server', status: dashboardUp ? 'up' : 'down', port: 18787, lastCheck: Date.now() },
      { name: 'Local LLM Server', status: llmUp ? 'up' : 'down', port: 1234, lastCheck: Date.now() },
    ]
    
    return { servers, branchStatus: null }
  } catch (e) {
    return { servers: [], branchStatus: null }
  }
}

export async function projects() {
  const projectStatuses = await Promise.all(
    PROJECTS.map(async (project) => {
      const projectPath = `${WORKSPACE}/${project}`
      const gitStatus = await getGitStatus(projectPath)
      
      return {
        name: project,
        path: projectPath,
        branch: gitStatus?.branch || 'N/A',
        dirty: gitStatus?.dirty || false,
      }
    })
  )
  
  return { projects: projectStatuses }
}

export async function kanban() {
  // Fetch GitHub issues for each project
  const [apexformIssues, hamonoIssues, shootrebookIssues, stitchaiIssues] = await Promise.all([
    getGitHubIssues('krobinsonca', 'apexform'),
    getGitHubIssues('krobinsonca', 'hamono'),
    getGitHubIssues('krobinsonca', 'shootrebook'),
    getGitHubIssues('krobinsonca', 'stitchai'),
  ])
  
  // Also read backlog.md for ideas/tasks
  let ideasTasks: any[] = []
  try {
    const fs = await import('fs/promises')
    const backlogPath = `${WORKSPACE}/backlog.md`
    const content = await fs.readFile(backlogPath, 'utf-8')
    
    // Parse Ideas & Tasks section
    const ideasMatch = content.match(/## Ideas & Tasks([\s\S]*?)(?:---|$)/)
    if (ideasMatch) {
      const lines = ideasMatch[1].split('\n')
      let currentTask: any = null
      
      for (const line of lines) {
        const taskMatch = line.match(/^### (.+)$/)
        if (taskMatch) {
          if (currentTask) ideasTasks.push(currentTask)
          currentTask = { title: taskMatch[1], status: 'backlog', type: 'idea' }
        }
        const statusMatch = line.match(/\*\*Status:\*\* (\w+)/)
        if (statusMatch && currentTask) {
          const statusMap: Record<string, string> = {
            '🟡 Backlog': 'backlog',
            '🔄 In Progress': 'in-progress',
            '✅ Done': 'done',
          }
          currentTask.status = statusMap[statusMatch[1]] || 'backlog'
        }
      }
      if (currentTask) ideasTasks.push(currentTask)
    }
  } catch {}
  
  return {
    columns: {
      'backlog': [
        ...apexformIssues.map(i => ({ ...i, type: 'issue' })),
        ...hamonoIssues.map(i => ({ ...i, type: 'issue' })),
        ...shootrebookIssues.map(i => ({ ...i, type: 'issue' })),
        ...stitchaiIssues.map(i => ({ ...i, type: 'issue' })),
        ...ideasTasks.filter(t => t.status === 'backlog')
      ],
      'in-progress': [
        ...ideasTasks.filter(t => t.status === 'in-progress')
      ],
      'done': [
        ...ideasTasks.filter(t => t.status === 'done')
      ]
    },
    stats: {
      apexform: apexformIssues.length,
      hamono: hamonoIssues.length,
      shootrebook: shootrebookIssues.length,
      stitchai: stitchaiIssues.length,
      total: apexformIssues.length + hamonoIssues.length + shootrebookIssues.length + stitchaiIssues.length
    }
  }
}

export async function agents() {
  try {
    const possiblePaths = [
      '/home/legion/.openclaw/agents/main/sessions/sessions.json',
      '/home/legion/.openclaw/agents/config/sessions/sessions.json',
    ]
    
    for (const path of possiblePaths) {
      const data = await readJsonFile(path)
      if (data) {
        const sessionKeys = Object.keys(data).filter(k => k.startsWith('agent:') || k.startsWith('session:'))
        return { 
          agents: [{ id: 'legion', name: 'Legion', role: 'Main Agent', model: 'minimax/minimax-m2.5', level: 'L3', status: 'active' }], 
          sessionCount: sessionKeys.length || Object.keys(data).length || 1
        }
      }
    }
  } catch (e) {}
  return { agents: [{ id: 'legion', name: 'Legion', role: 'Main Agent', model: 'minimax/minimax-m2.5', level: 'L3', status: 'active' }], sessionCount: 1 }
}

export async function cronHealth() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const { stdout } = await execAsync('openclaw cron list', { timeout: 10000 })
    const lines = stdout.trim().split('\n').slice(2) // Skip header lines
    
    const jobs = lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.trim().split(/\s+/)
        if (parts.length < 7) return null
        
        const id = parts[0]
        const name = parts.slice(1, -6).join(' ')
        const schedule = parts.slice(-6, -2).join(' ')
        const status = parts[parts.length - 4]
        
        return { name, schedule, status, id }
      })
      .filter(Boolean)
    
    return { jobs }
  } catch (e) {
    console.error('cronHealth error:', e)
    return { jobs: [] }
  }
}

export async function apiCosts() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const { stdout } = await execAsync('python3 /home/legion/.openclaw/workspace/ai-cost-tracker/cli.py stats', { timeout: 10000 })
    
    // Parse "Total Cost: $X.XX" from output
    const match = stdout.match(/Total Cost:\s+\$?([\d.]+)/)
    const total = match ? parseFloat(match[1]).toFixed(2) : '0.00'
    
    return { total, breakdown: {} }
  } catch (e) {
    console.error('apiCosts error:', e)
    return { total: '0.00', breakdown: {} }
  }
}

export async function recentActivity() {
  try {
    const fs = await import('fs/promises')
    const sessionsPath = '/home/legion/.openclaw/agents/main/sessions/sessions.json'
    const content = await fs.readFile(sessionsPath, 'utf-8')
    const data = JSON.parse(content)
    
    const sessions: any[] = []
    
    for (const [key, value] of Object.entries(data)) {
      const s = value as any
      if (key.startsWith('agent:main:') && !key.includes(':cron:') && !key.includes(':run:')) {
        sessions.push({
          id: key,
          lastMessage: s.lastInput?.substring(0, 80) || s.lastMessage?.substring(0, 80) || 'No messages',
          lastActive: s.updatedAt || Date.now(),
        })
      }
    }
    
    // Sort by last active, newest first
    sessions.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0))
    
    return { sessions: sessions.slice(0, 5) }
  } catch (e) {
    console.error('recentActivity error:', e)
  }
  
  return { sessions: [] }
}

export async function revenue() {
  return { current: 0, monthlyBurn: 0, net: 0 }
}
