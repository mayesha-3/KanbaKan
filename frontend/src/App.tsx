import { useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, PieChart, Calendar, CalendarClock, Sparkles, Settings as SettingsIcon, Network, Menu, X, Shield, AlertTriangle } from 'lucide-react'
import { resetDemoData } from './demoApi'

import ThemeToggle from './components/ThemeToggle'
import UserDashboard from './pages/UserDashboard'
import OrgDashboard from './pages/OrgDashboard'
import ReportingHub from './pages/ReportingHub'
import PlanningHub from './pages/PlanningHub'
import DeadlinesCalendar from './pages/DeadlinesCalendar'
import Settings from './pages/Settings'
import COCTree from './pages/COCTree'
import AdminDashboard from './pages/AdminDashboard'
import AdminSecurity from './pages/AdminSecurity'
import InstallPWA from './components/InstallPWA'

function BoardsHub() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <UserDashboard />
      <div className="flex justify-end border-t border-[var(--border)] pt-6">
        <button
          type="button"
          onClick={() => navigate('/org')}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Users size={18} /> Organization Board
        </button>
      </div>
    </div>
  )
}

function CalendarHub() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <DeadlinesCalendar />
      <div className="flex justify-end border-t border-[var(--border)] pt-6">
        <button
          type="button"
          onClick={() => navigate('/planning')}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          <CalendarClock size={18} /> Events Calendar
        </button>
      </div>
    </div>
  )
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const profile = {
    uid: 'demo-admin-uid',
    email: 'avery.stone@example.com',
    name: 'Avery Stone',
    role: 'admin',
    department: 'Operations',
    position: 'Operations Admin',
    isWarned: false,
  }
  const navItems = [
    { path: '/boards', label: 'Boards', icon: <LayoutDashboard size={18} /> },
    { path: '/tree', label: 'COC Tree', icon: <Network size={18} /> },
    { path: '/reports', label: 'Reporting & Analytics', icon: <PieChart size={18} /> },
    { path: '/calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    ...(profile.role === 'admin' ? [{ path: '/admin', label: 'Admin Dashboard', icon: <Shield size={18} /> }] : []),
  ]

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[var(--bg)]">
      {/* ── Sticky Top Navigation & Banner Bar (Pinned to top of screen) ── */}
      <div className="sticky top-0 z-50 w-full max-w-full flex flex-col shadow-sm">
        <InstallPWA />
        {/* ── Top Header ── */}
        <header className="flex items-center justify-between px-3 sm:px-8 h-[56px] sm:h-[72px] bg-[var(--surface)] border-b border-[var(--border)] max-w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-1.5 text-[var(--text1)] hover:bg-[var(--border)]/50 md:hidden">
              <Menu size={20} />
            </button>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--text1)]">
              KanbaKan
            </div>
          </div>
          <nav className="hidden gap-1 items-center md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    location.pathname === item.path ||
                    (item.path === "/boards" &&
                      ["/org", "/"].includes(location.pathname)) ||
                    (item.path === "/calendar" &&
                      location.pathname === "/planning")
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "text-[var(--text2)] hover:bg-[var(--border)]/50 hover:text-[var(--text1)]"
                  }`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-semibold text-[var(--text1)] flex items-center gap-1.5">
                {profile.name || profile.email}
                {profile.position && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-bold border border-[var(--accent)]/25">
                    {profile.position}
                  </span>
                )}
              </span>
              <span className="text-xs text-[var(--text2)] capitalize">
                {profile.role}
              </span>
            </div>
            <button type="button" onClick={() => { resetDemoData(); window.location.reload() }} className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--border)]/50 text-xs sm:text-sm" title="Restore the seeded demo data">
              <Sparkles size={15} />{" "}
              <span className="hidden sm:inline">Reset demo</span>
            </button>
          </div>
        </header>

        {/* ── Red Warning Banner (Right Below Header) ── */}
        {profile.isWarned && (
          <div className="w-full bg-red-600 text-white font-bold text-xs sm:text-base py-2 px-3 sm:py-2.5 sm:px-4 text-center flex items-center justify-center gap-2 shadow-md animate-pulse">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>Warning: You're Under Watch</span>
          </div>
        )}
      </div>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--surface)] p-5 shadow-2xl transition-transform duration-200 md:hidden ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xl font-bold text-[var(--text1)]">
            Navigation
          </span>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-lg p-2 text-[var(--text2)] hover:bg-[var(--border)]/50">
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${location.pathname === item.path || (item.path === "/boards" && ["/org", "/"].includes(location.pathname)) || (item.path === "/calendar" && location.pathname === "/planning") ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text2)] hover:bg-[var(--border)]/50"}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/boards" element={<BoardsHub />} />
          <Route path="/org" element={<OrgDashboard />} />
          <Route path="/tree" element={<COCTree />} />
          <Route path="/reports" element={<ReportingHub />} />
          <Route path="/planning" element={<PlanningHub />} />
          <Route path="/calendar" element={<CalendarHub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
        </Routes>
      </main>

      {/* ── Footer ── */}
      <footer className="flex flex-col items-center justify-center py-10 px-8 bg-[var(--surface)] border-t border-[var(--border)] gap-5">
        <div className="flex gap-8">
          <a
            href="#"
            className="text-[var(--text2)] font-medium text-sm hover:text-[var(--accent)] transition-colors duration-200">
            WhatsApp Group
          </a>
          <a
            href="#"
            className="text-[var(--text2)] font-medium text-sm hover:text-[var(--accent)] transition-colors duration-200">
            Twitter / X
          </a>
          <a
            href="#"
            className="text-[var(--text2)] font-medium text-sm hover:text-[var(--accent)] transition-colors duration-200">
            LinkedIn
          </a>
        </div>
        <p className="text-[var(--text2)] text-sm">
          &copy; {new Date().getFullYear()} KanbaKan. All rights reserved.
        </p>
      </footer>

      {/* ── Theme Toggle ── */}
      <ThemeToggle />
    </div>
  );
}

export default App
