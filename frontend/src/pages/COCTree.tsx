import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auth } from '../firebase'
import { BACKEND_URL } from '../config'
import { apiFetch } from '../api'
import { Network, ChevronDown, ChevronRight, User as UserIcon, Briefcase } from 'lucide-react'

type UserNode = {
  _id: string
  uid?: string
  name?: string
  email: string
  contactEmail?: string
  username?: string
  department?: string
  position?: string
  superior?: { _id: string; name?: string; email?: string; contactEmail?: string } | string | null
  children?: UserNode[]
}

const fetchUsers = async (): Promise<UserNode[]> => {
  const token = await auth.currentUser?.getIdToken()
  const res = await apiFetch(`${BACKEND_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch users for COC Tree')
  return res.json()
}

// Recursive TreeNode Component
const TreeNode = ({ node, level = 0 }: { node: UserNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  const getPositionBadge = (position?: string) => {
    if (!position || !position.trim()) {
      return 'bg-[var(--bg)] text-[var(--text2)] border-[var(--border)]'
    }
    const pos = position.trim().toLowerCase()
    if (pos.includes('ceo')) return 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
    if (pos.includes('coo')) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
    if (pos.includes('cto')) return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
    if (pos.includes('admin')) return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
    if (pos.includes('founder')) return 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
    if (pos.includes('leader') || pos === 'lead') return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border-yellow-500/30'
    if (pos.includes('manager') || pos.includes('director')) return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
    if (pos.includes('superior intern')) return 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
    if (pos.includes('intern')) return 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30'
    return 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30'
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group">
        <div className="px-5 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl min-w-[240px] max-w-[280px] shadow-sm hover:shadow-md hover:border-[var(--accent)]/50 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] font-bold shrink-0">
              {node.name ? node.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[var(--text1)] text-sm truncate">
                {node.name || 'Unnamed User'}
              </div>
              {(node.contactEmail || node.email) && (
                <div className="text-xs text-[var(--text2)] truncate">{node.contactEmail || node.email}</div>
              )}
              {node.username && (
                <div className="text-xs text-[var(--accent)] font-mono font-medium truncate">
                  @{node.username}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card Footer: Position Badge + Department */}
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
            <span
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider truncate max-w-[140px] ${getPositionBadge(
                node.position
              )}`}
              title={node.position || 'No Position'}
            >
              {node.position?.trim() ? node.position : 'No Position'}
            </span>
            {node.department && (
              <span className="text-[11px] text-[var(--text2)] truncate flex items-center gap-1">
                <Briefcase size={12} className="shrink-0" /> {node.department}
              </span>
            )}
          </div>

          {/* Toggle Expand/Collapse Button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] rounded-full p-1 text-[var(--text2)] hover:text-[var(--text1)] shadow-sm hover:scale-110 transition-all z-10"
              title={isExpanded ? 'Collapse team' : 'Expand team'}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Children Sub-tree */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          {/* Vertical connecting line from parent node down */}
          <div className="w-0.5 h-6 bg-[var(--border)]" />

          {/* Container for children */}
          <div className="relative flex gap-8 items-start pt-2">
            {/* Horizontal connecting line across children if more than 1 child */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-[140px] right-[140px] h-0.5 bg-[var(--border)]" />
            )}

            {node.children!.map((child) => (
              <div key={child._id} className="relative flex flex-col items-center">
                {/* Vertical line connecting top horizontal bar to child node */}
                {node.children!.length > 1 && <div className="w-0.5 h-2.5 bg-[var(--border)] -mt-2 mb-2" />}
                <TreeNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function COCTree() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  if (isLoading) {
    return (
      <div className="p-8 text-[var(--text1)] font-medium flex items-center gap-2">
        <Network className="animate-spin text-[var(--accent)]" size={20} />
        Loading COC Tree (Chain of Command)...
      </div>
    )
  }

  if (error) {
    return <div className="p-8 text-red-500 font-medium">Error loading COC Tree: {(error as Error).message}</div>
  }

  // 1. Build map of user objects with empty children arrays
  const userMap = new Map<string, UserNode>()
  users.forEach((u) => {
    userMap.set(u._id, { ...u, children: [] })
  })

  // 2. Safely connect children to parents, avoiding cycles
  const roots: UserNode[] = []

  userMap.forEach((user) => {
    // Extract superior ID safely regardless of whether backend returned populated object or ID string
    const superiorId =
      typeof user.superior === 'object' && user.superior
        ? user.superior._id
        : typeof user.superior === 'string'
        ? user.superior
        : null

    if (superiorId && userMap.has(superiorId) && superiorId !== user._id) {
      const parent = userMap.get(superiorId)!
      // Check to prevent accidental circular reference loops
      let curr: UserNode | undefined = parent
      let isCycle = false
      const visited = new Set<string>()
      while (curr) {
        if (curr._id === user._id || visited.has(curr._id)) {
          isCycle = true
          break
        }
        visited.add(curr._id)
        const parentSupId: string | null =
          typeof curr.superior === 'object' && curr.superior
            ? curr.superior._id
            : typeof curr.superior === 'string'
            ? curr.superior
            : null
        curr = parentSupId ? userMap.get(parentSupId) : undefined
      }

      if (!isCycle) {
        parent.children!.push(user)
      } else {
        roots.push(user)
      }
    } else {
      roots.push(user)
    }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text1)] flex items-center gap-2">
            <Network className="text-[var(--accent)]" size={26} /> COC Tree (Chain of Command)
          </h1>
          <p className="text-sm text-[var(--text2)] mt-1">
            Visual organizational hierarchy structure showing reporting lines and team relationships.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text1)]">
            Total Members: {users.length}
          </span>
        </div>
      </div>

      {/* Tree Visualization Canvas Container (Scoped horizontal scroll) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-10 shadow-sm overflow-x-auto max-w-full">
        {roots.length === 0 ? (
          <p className="text-center text-[var(--text2)] italic py-12">No organization members found.</p>
        ) : (
          <div className="inline-flex min-w-full justify-center pt-4 pb-12 px-4">
            <div className="flex gap-16 items-start">
              {roots.map((rootNode) => (
                <TreeNode key={rootNode._id} node={rootNode} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
