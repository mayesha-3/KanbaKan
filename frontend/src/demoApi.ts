type DemoUser = {
  _id: string; uid: string; email: string; name: string; username: string; role: string
  department: string; position: string; superior: string | null; isWarned: boolean; contactEmail: string
}
type DemoTask = {
  _id: string; title: string; description: string; status: string; priority: string
  assignees: string[]; createdBy: string; dueDate?: string; sprint?: number | null
  tags: string[]; link: string; isDeleted: boolean; updatedAt: string; createdAt: string
  completedAt?: string
}
type DemoEvent = {
  _id: string; title: string; description: string; eventType: string; date: string
  deadline?: string; status: string; createdBy: string
}
type DemoReport = { id: string; ip: string; status: string; reason: string; userAgent: string; createdAt: string }
type DemoData = {
  users: DemoUser[]; tasks: DemoTask[]; events: DemoEvent[]; comments: Record<string, any[]>
  bans: string[]; reports: DemoReport[]; question: string; positions: string[]
  answers: string; dateAnchor: string
}

const KEY = 'kanbakan-demo-data-v2'
const now = () => new Date().toISOString()
const localDateKey = (date = new Date()) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
const dateIn = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const seed = (): DemoData => {
  const users: DemoUser[] = [
    { _id: 'demo-user-1', uid: 'demo-admin-uid', email: 'avery.stone@example.com', name: 'Avery Stone', username: 'avery', role: 'admin', department: 'Operations', position: 'COO', superior: null, isWarned: false, contactEmail: 'avery.stone@example.com' },
    { _id: 'demo-user-2', uid: 'demo-jordan-uid', email: 'jordan.vale@example.com', name: 'Jordan Vale', username: 'jvale', role: 'Leader', department: 'Product', position: 'Product Lead', superior: 'demo-user-1', isWarned: false, contactEmail: 'jordan.vale@example.com' },
    { _id: 'demo-user-3', uid: 'demo-casey-uid', email: 'casey.park@example.com', name: 'Casey Park', username: 'casey', role: 'employee', department: 'Product', position: 'Product Designer', superior: 'demo-user-2', isWarned: false, contactEmail: 'casey.park@example.com' },
    { _id: 'demo-user-4', uid: 'demo-morgan-uid', email: 'morgan.reed@example.com', name: 'Morgan Reed', username: 'mreed', role: 'employee', department: 'Engineering', position: 'Software Engineer', superior: 'demo-user-2', isWarned: true, contactEmail: 'morgan.reed@example.com' },
    { _id: 'demo-user-5', uid: 'demo-robin-uid', email: 'robin.chen@example.com', name: 'Robin Chen', username: 'robin', role: 'Leader', department: 'Engineering', position: 'Engineering Lead', superior: 'demo-user-1', isWarned: false, contactEmail: 'robin.chen@example.com' },
    { _id: 'demo-user-6', uid: 'demo-quinn-uid', email: 'quinn.taylor@example.com', name: 'Quinn Taylor', username: 'qtaylor', role: 'employee', department: 'Design', position: 'UX Designer', superior: 'demo-user-5', isWarned: false, contactEmail: 'quinn.taylor@example.com' },
  ]
  const tasks: DemoTask[] = [
    { _id: 'demo-task-1', title: 'Map stakeholder onboarding journey', description: 'Document the steps new customer teams take from kickoff to first value.', status: 'in_progress', priority: 'high', assignees: ['demo-user-3'], createdBy: 'demo-user-2', dueDate: dateIn(2), sprint: 4, tags: ['research', 'customer'], link: '', isDeleted: false, updatedAt: dateIn(-1), createdAt: dateIn(-8) },
    { _id: 'demo-task-2', title: 'Review Q4 delivery milestones', description: 'Confirm owners and success measures for the final quarter.', status: 'halted', priority: 'urgent', assignees: ['demo-user-1', 'demo-user-2'], createdBy: 'demo-user-1', dueDate: dateIn(0), sprint: 4, tags: ['planning'], link: '', isDeleted: false, updatedAt: dateIn(-1), createdAt: dateIn(-6) },
    { _id: 'demo-task-3', title: 'Prepare mobile dashboard concepts', description: 'Explore a responsive layout for task status and personal workload.', status: 'todo', priority: 'medium', assignees: ['demo-user-6'], createdBy: 'demo-user-5', dueDate: dateIn(5), sprint: 5, tags: ['design'], link: '', isDeleted: false, updatedAt: dateIn(-3), createdAt: dateIn(-3) },
    { _id: 'demo-task-4', title: 'Resolve notification preference bug', description: 'Users should be able to control task update notifications.', status: 'in_progress', priority: 'high', assignees: ['demo-user-4'], createdBy: 'demo-user-2', dueDate: dateIn(3), sprint: 4, tags: ['bug'], link: '', isDeleted: false, updatedAt: dateIn(-1), createdAt: dateIn(-5) },
    { _id: 'demo-task-5', title: 'Publish team operating guide', description: 'A short guide to team rituals, ownership, and escalation paths.', status: 'completed', priority: 'low', assignees: ['demo-user-1'], createdBy: 'demo-user-1', dueDate: dateIn(-1), sprint: 3, tags: ['operations'], link: '', isDeleted: false, updatedAt: dateIn(-2), createdAt: dateIn(-10), completedAt: dateIn(-2) },
    { _id: 'demo-task-6', title: 'Consolidate feedback from pilot', description: 'Group pilot feedback into opportunities and follow-up actions.', status: 'todo', priority: 'medium', assignees: ['demo-user-3', 'demo-user-2'], createdBy: 'demo-user-2', dueDate: dateIn(7), sprint: 5, tags: ['customer'], link: '', isDeleted: false, updatedAt: dateIn(-2), createdAt: dateIn(-2) },
    { _id: 'demo-task-7', title: 'Audit access review checklist', description: 'Review the access checklist before the stakeholder walkthrough.', status: 'halted', priority: 'high', assignees: ['demo-user-1', 'demo-user-5'], createdBy: 'demo-user-1', dueDate: dateIn(-2), sprint: 5, tags: ['security'], link: '', isDeleted: false, updatedAt: dateIn(-1), createdAt: dateIn(-4) },
    { _id: 'demo-task-8', title: 'Update release readiness notes', description: 'Capture the latest handoff and release criteria.', status: 'completed', priority: 'low', assignees: ['demo-user-2'], createdBy: 'demo-user-2', dueDate: dateIn(-2), sprint: 3, tags: ['release'], link: '', isDeleted: false, updatedAt: dateIn(-4), createdAt: dateIn(-12), completedAt: dateIn(-4) },
  ]
  const events: DemoEvent[] = [
    { _id: 'demo-event-0', title: 'Sprint retrospective', description: 'Review what went well and what the team wants to improve.', eventType: 'sprint_review', date: dateIn(-2), status: 'published', createdBy: 'demo-user-2' },
    { _id: 'demo-event-today', title: 'Team demo kickoff', description: 'Align on the goals and walkthrough for this demo day.', eventType: 'all_hands', date: dateIn(0), status: 'published', createdBy: 'demo-user-1' },
    { _id: 'demo-event-1', title: 'Product weekly sync', description: 'Review progress, risks, and decisions for the week.', eventType: 'meeting', date: dateIn(1), status: 'published', createdBy: 'demo-user-2' },
    { _id: 'demo-event-2', title: 'Pilot feedback review', description: 'Walk through customer feedback and prioritize follow-up.', eventType: 'meeting', date: dateIn(2), status: 'published', createdBy: 'demo-user-3' },
    { _id: 'demo-event-3', title: 'Design critique', description: 'Share mobile dashboard concepts with the team.', eventType: 'event', date: dateIn(4), status: 'published', createdBy: 'demo-user-6' },
    { _id: 'demo-event-4', title: 'Sprint planning', description: 'Set sprint goals and review team capacity.', eventType: 'deadline', date: dateIn(6), deadline: dateIn(6), status: 'published', createdBy: 'demo-user-5' },
    { _id: 'demo-event-5', title: 'Stakeholder demo', description: 'Show the pilot experience and collect next-step feedback.', eventType: 'event', date: dateIn(8), status: 'published', createdBy: 'demo-user-1' },
  ]
  return {
    users, tasks, events,
    comments: {
      'demo-task-1': [{ _id: 'demo-comment-1', type: 'comment', content: 'I have the interview outline ready for review.', author: users[2], timestamp: dateIn(-1) }],
      'demo-task-2': [{ _id: 'demo-comment-2', type: 'comment', content: 'Milestone owners are confirmed for the pilot.', author: users[0], timestamp: dateIn(-1) }],
    },
    bans: ['203.0.113.42', '198.51.100.17'],
    reports: [
      { id: 'demo-report-1', ip: '192.0.2.84', status: 'pending_review', reason: 'Repeated automated sign-in attempts', userAgent: 'Demo browser traffic · fictional record', createdAt: dateIn(-1) },
      { id: 'demo-report-2', ip: '203.0.113.42', status: 'banned', reason: 'High request volume', userAgent: 'Sample report · fictional record', createdAt: dateIn(-3) },
      { id: 'demo-report-3', ip: '198.51.100.63', status: 'cleared', reason: 'Unusual request pattern', userAgent: 'Sample report · fictional record', createdAt: dateIn(-4) },
    ],
    question: 'What software platform does KanbaKan belong to?',
    answers: 'KanbaKan, kanbakan, Kanban',
    positions: ['Intern', 'Superior Intern', 'Leader', 'Admin', 'CTO', 'COO', 'CEO', 'Product Lead', 'Software Engineer', 'UX Designer'],
    dateAnchor: localDateKey(),
  }
}

let cached: DemoData | undefined
const dayNumber = (key: string) => {
  const [year, month, date] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, date) / 86_400_000
}
const shiftDate = (value: string | undefined, days: number) => {
  if (!value) return value
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}
const rebaseDates = (data: DemoData, days: number, today: string) => {
  for (const task of data.tasks) {
    task.dueDate = shiftDate(task.dueDate, days)
    task.createdAt = shiftDate(task.createdAt, days) || task.createdAt
    task.updatedAt = shiftDate(task.updatedAt, days) || task.updatedAt
    task.completedAt = shiftDate(task.completedAt, days)
  }
  for (const event of data.events) {
    event.date = shiftDate(event.date, days) || event.date
    event.deadline = shiftDate(event.deadline, days)
  }
  for (const comments of Object.values(data.comments)) {
    for (const comment of comments) comment.timestamp = shiftDate(comment.timestamp, days) || comment.timestamp
  }
  for (const report of data.reports) report.createdAt = shiftDate(report.createdAt, days) || report.createdAt
  data.dateAnchor = today
}
const getData = (): DemoData => {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const loaded = { ...seed(), ...JSON.parse(stored) } as DemoData
      cached = loaded
      const today = localDateKey()
      const anchor = typeof loaded.dateAnchor === 'string' ? loaded.dateAnchor : today
      const elapsedDays = dayNumber(today) - dayNumber(anchor)
      if (Number.isFinite(elapsedDays) && elapsedDays !== 0) rebaseDates(loaded, elapsedDays, today)
      else loaded.dateAnchor = today
      save()
    }
  } catch { /* Recover with the built-in sample records. */ }
  cached ||= seed()
  return cached
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cached)) } catch { /* Continue in memory if storage is unavailable. */ } }
const bodyOf = async (init: RequestInit) => {
  if (typeof init.body !== 'string') return {}
  try { return JSON.parse(init.body) } catch { return {} }
}
const userById = (id: string) => getData().users.find((user) => user._id === id)
const publicUser = (user: DemoUser) => ({ ...user, superior: user.superior ? userById(user.superior) || null : null })
const fullTask = (task: DemoTask) => ({
  ...task,
  assignees: task.assignees.map((id) => userById(id)).filter(Boolean),
  createdBy: publicUser(userById(task.createdBy) || getData().users[0]),
})
const respond = (data: unknown, status = 200, headers?: HeadersInit) => new Response(typeof data === 'string' ? data : JSON.stringify(data), {
  status,
  headers: { 'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json', ...Object.fromEntries(new Headers(headers || {}).entries()) },
})
const reportRows = (scope: string, username?: string) => {
  const data = getData()
  const current = data.users[0]
  return data.tasks.filter((task) => !task.isDeleted && (scope !== 'self' || task.assignees.includes(current._id)))
    .filter((task) => !username || task.assignees.some((id) => {
      const user = userById(id)
      return `${user?.name} ${user?.username} ${user?.email}`.toLowerCase().includes(username.replace(/^@/, '').toLowerCase())
    }))
    .map((task) => ({
      'Task ID': task._id,
      Title: task.title,
      Assignee: task.assignees.map((id) => userById(id)?.username ? `@${userById(id)?.username}` : userById(id)?.name || '').join(', ') || 'Unassigned',
      Priority: task.priority,
      Status: task.status,
      Sprint: task.sprint ?? '',
      'Created Date': task.createdAt,
      'Due Date': task.dueDate || '',
      'Completion Date': task.completedAt || '',
      'Time-to-Complete (Hours)': task.completedAt ? '24.00' : '',
    }))
}

export async function handleDemoRequest(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin)
  const path = url.pathname.replace(/^\/demo-api/, '').replace(/\/$/, '') || '/'
  const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
  const data = getData()
  const body = await bodyOf(init)
  const parts = path.split('/').filter(Boolean)
  const jsonResponse = (payload: unknown, status = 200) => { save(); return respond(payload, status) }

  if (path === '/api/profile' && method === 'GET') return respond({ ...data.users[0], isWarned: data.users[0].isWarned })
  if (path === '/api/profile' && method === 'PATCH') {
    Object.assign(data.users[0], { name: body.name ?? data.users[0].name, username: body.username ?? data.users[0].username, contactEmail: body.contactEmail ?? data.users[0].contactEmail, superior: body.superior === '' ? null : body.superior ?? data.users[0].superior })
    return jsonResponse(data.users[0])
  }
  if (path === '/api/profile' && method === 'DELETE') return respond({ message: 'Demo profile retained; no account was deleted.' })

  if (path === '/api/users' && method === 'GET') return respond(data.users.map(publicUser))
  if (path === '/api/users/position-options' && method === 'GET') return respond(data.positions)
  if (path === '/api/users/position-options' && method === 'POST') {
    const position = String(body.position || '').trim()
    if (!position || data.positions.some((item) => item.toLowerCase() === position.toLowerCase())) return respond({ error: 'Enter a new position name.' }, 400)
    data.positions.push(position)
    return jsonResponse(data.positions)
  }
  if (parts[0] === 'api' && parts[1] === 'users' && parts[2]) {
    const user = userById(parts[2])
    if (!user) return respond({ error: 'Demo user not found' }, 404)
    if (parts[3] === 'warn' && method === 'PATCH') user.isWarned = Boolean(body.isWarned)
    else if (parts[3] === 'role' && method === 'PATCH') user.role = body.role
    else if (parts[3] === 'superior' && method === 'PATCH') user.superior = body.superiorId || null
    else if (parts[3] === 'email' && method === 'PATCH') user.email = String(body.email || user.email).trim().toLowerCase()
    else if (parts[3] === 'position' && method === 'PATCH') user.position = String(body.position || '')
    else if (parts.length === 3 && method === 'DELETE') data.users = data.users.filter((item) => item._id !== user._id)
    else return respond({ error: 'Unsupported demo user action' }, 404)
    return jsonResponse(parts[3] === 'superior' ? publicUser(user) : user)
  }

  if (path === '/api/tasks/personal' && method === 'GET') return respond(data.tasks.filter((task) => !task.isDeleted && task.assignees.includes(data.users[0]._id)).map(fullTask))
  if (path === '/api/tasks/org' && method === 'GET') {
    let tasks = data.tasks.filter((task) => !task.isDeleted)
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const assignee = url.searchParams.get('assignee')
    if (status) tasks = tasks.filter((task) => task.status === status)
    if (priority) tasks = tasks.filter((task) => task.priority === priority)
    if (assignee) tasks = tasks.filter((task) => task.assignees.includes(assignee))
    return respond(tasks.map(fullTask))
  }
  if (path === '/api/tasks' && method === 'POST') {
    const task: DemoTask = { _id: `demo-task-${Date.now()}`, title: String(body.title || 'New demo task'), description: String(body.description || ''), status: 'todo', priority: String(body.priority || 'medium'), assignees: Array.isArray(body.assigneeIds) && body.assigneeIds.length ? body.assigneeIds : [data.users[0]._id], createdBy: data.users[0]._id, dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : undefined, sprint: body.sprint ?? null, tags: Array.isArray(body.tags) ? body.tags : [], link: String(body.link || ''), isDeleted: false, updatedAt: now(), createdAt: now() }
    data.tasks.unshift(task)
    return jsonResponse(fullTask(task), 201)
  }
  if (parts[0] === 'api' && parts[1] === 'tasks' && parts[2]) {
    const task = data.tasks.find((item) => item._id === parts[2] && !item.isDeleted)
    if (parts[3] === 'comments') {
      const comments = data.comments[parts[2]] || []
      if (method === 'GET') return respond(comments)
      if (method === 'POST') {
        const comment = { _id: `demo-comment-${Date.now()}`, type: 'comment', content: String(body.content || ''), author: publicUser(data.users[0]), timestamp: now() }
        data.comments[parts[2]] = [...comments, comment]
        return jsonResponse(comment, 201)
      }
    }
    if (!task) return respond({ error: 'Demo task not found' }, 404)
    if (parts[3] === 'status' && method === 'PATCH') {
      task.status = String(body.status || task.status)
      task.updatedAt = now()
      if (task.status === 'completed') task.completedAt = now()
      else delete task.completedAt
    } else if (parts.length === 3 && method === 'PATCH') {
      Object.assign(task, { ...body, assignees: Array.isArray(body.assigneeIds) ? body.assigneeIds : task.assignees, dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : undefined, updatedAt: now() })
    } else if (parts.length === 3 && method === 'DELETE') {
      task.isDeleted = true
      task.updatedAt = now()
    } else return respond({ error: 'Unsupported demo task action' }, 404)
    return jsonResponse(fullTask(task))
  }

  if (path === '/api/events' && method === 'GET') return respond(data.events.map((event) => ({ ...event, createdBy: publicUser(userById(event.createdBy) || data.users[0]) })))
  if (path === '/api/events' && method === 'POST') {
    const event: DemoEvent = { _id: `demo-event-${Date.now()}`, title: String(body.title || ''), description: String(body.description || ''), eventType: String(body.eventType || 'event'), date: new Date(body.date || now()).toISOString(), deadline: body.deadline ? new Date(body.deadline).toISOString() : undefined, status: 'published', createdBy: data.users[0]._id }
    data.events.push(event)
    return jsonResponse(event, 201)
  }
  if (parts[0] === 'api' && parts[1] === 'events' && parts[2] && method === 'DELETE') {
    data.events = data.events.filter((event) => event._id !== parts[2])
    return jsonResponse({ message: 'Demo event removed' })
  }

  if (parts[0] === 'api' && parts[1] === 'reports' && method === 'GET') {
    const rows = reportRows(parts[2], url.searchParams.get('username') || '')
    if (url.searchParams.get('format') === 'csv') {
      const keys = Object.keys(rows[0] || { Title: '' })
      const csv = [keys.join(','), ...(rows as Record<string, string | number>[]).map((row) => keys.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n')
      return new Response(csv, { headers: { 'Content-Type': 'text/csv' } })
    }
    return respond(rows)
  }

  if (path === '/api/security-gate/admin' && method === 'GET') return respond({ question: data.question, banList: data.bans, reports: data.reports })
  if (path === '/api/security-gate/admin' && method === 'PATCH') {
    data.question = String(body.question || data.question)
    if (typeof body.answers === 'string' && body.answers.trim()) data.answers = body.answers.trim()
    return jsonResponse({ question: data.question, banList: data.bans, reports: data.reports })
  }
  if (path === '/api/security-gate/admin/reports' && method === 'GET') return respond({ reports: data.reports, banList: data.bans })
  if (path === '/api/security-gate/admin/reports' && method === 'DELETE') { data.reports = []; return jsonResponse({ reports: [], banList: data.bans }) }
  if (path === '/api/security-gate/admin/bans' && method === 'DELETE') { data.bans = []; return jsonResponse({ banList: [], reports: data.reports }) }
  if (parts[0] === 'api' && parts[1] === 'security-gate' && parts[2] === 'admin' && parts[3] === 'bans' && parts[4] && method === 'DELETE') {
    const ip = decodeURIComponent(parts[4])
    data.bans = data.bans.filter((item) => item !== ip)
    return jsonResponse({ banList: data.bans, reports: data.reports })
  }
  if (parts[0] === 'api' && parts[1] === 'security-gate' && parts[2] === 'admin' && parts[3] === 'reports' && parts[4] && method === 'PATCH') {
    const report = data.reports.find((item) => item.id === parts[4])
    if (!report) return respond({ error: 'Demo report not found' }, 404)
    const blocked = body.decision === 'red'
    report.status = blocked ? 'banned' : 'cleared'
    if (blocked && !data.bans.includes(report.ip)) data.bans.push(report.ip)
    if (!blocked) data.bans = data.bans.filter((ip) => ip !== report.ip)
    return jsonResponse({ report, banList: data.bans, reports: data.reports })
  }
  if (path === '/api/security-gate/question' && method === 'GET') return respond({ question: data.question })
  if (path === '/api/auth/session' && method === 'POST') return respond({ uid: data.users[0].uid, email: data.users[0].email, name: data.users[0].name, role: data.users[0].role, department: data.users[0].department, isWarned: false })

  return respond({ error: `No demo response for ${method} ${path}` }, 404)
}

export const resetDemoData = () => {
  cached = seed()
  save()
}
