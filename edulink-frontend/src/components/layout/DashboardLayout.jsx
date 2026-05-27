import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { 
  Menu, 
  X, 
  Activity, 
  Database, 
  ChevronRight, 
  Bell, 
  LogOut, 
  GraduationCap 
} from 'lucide-react'
import { cn } from '../../utils/cn'

export const DashboardLayout = ({ children }) => {
  const { user, logout, getUserRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const role = getUserRole()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Generate dynamic premium breadcrumbs based on active URL
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    if (paths.length === 0) return [{ label: 'Workspace', path: '/' }]
    
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`
      let label = path.charAt(0).toUpperCase() + path.slice(1)
      
      // Clean up common path names for beautiful UX
      if (path === 'enrolled') label = 'My Enrollments'
      if (path === 'subjects') label = 'Subjects Workspace'
      if (path === 'chat') label = 'Discussion Chat'
      if (path === 'materials') label = 'Study Materials'
      if (path === 'upload') label = 'Material Upload'
      if (path === 'profile') label = 'User Profile'
      if (path === 'dashboard') label = 'Dashboard'
      if (!isNaN(path)) label = `ID: ${path}` // Represent numeric IDs cleanly

      return { label, path: url }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden select-none">
      {/* Dynamic Private Top Bar Header for Workspace */}
      <header className="sticky top-0 z-40 w-full h-14 border-b border-border/40 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shadow-sm select-none">
        
        {/* Left: Mobile hamburger & breadcrumbs display */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Collapsible desktop workspace indicator logo */}
          <Link 
            to={role === 'ADMIN' ? '/admin/dashboard' : role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'}
            className="flex items-center gap-2 mr-2"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-black text-xs shadow-sm select-none">
              E
            </div>
            <span className="hidden sm:inline-block text-sm font-black font-outfit bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              EduLink
            </span>
          </Link>

          {/* Breadcrumbs trail display */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            <span className="text-muted-foreground/40">/</span>
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.path} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
                <span className={cn(
                  "font-bold truncate max-w-[150px]",
                  idx === breadcrumbs.length - 1 ? "text-foreground font-extrabold" : "text-muted-foreground/75"
                )}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Diagnostics, notifications, profile tools */}
        <div className="flex items-center gap-3">
          {/* Server / DB status pill ( diagnostics ) */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-full border border-border/50 bg-muted/20 text-[10px] font-bold text-muted-foreground select-none">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Server: <span className="text-emerald-500 font-extrabold">ONLINE</span></span>
            </span>
            <span className="h-3 w-[1px] bg-border/80"></span>
            <span className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Database: <span className="text-foreground font-extrabold">MYSQL 8.x</span></span>
            </span>
          </div>

          <ThemeToggle />

          {/* Compact alert triggers */}
          <button className="relative p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background"></span>
          </button>

          {/* Quick profile info card */}
          {user && (
            <div className="flex items-center gap-2 border-l border-border/60 pl-3">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm uppercase select-none">
                {getInitials(user.name)}
              </div>
              <span className="hidden lg:inline-block text-xs font-bold text-foreground max-w-[100px] truncate leading-none">
                {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                title="Quick Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid: Sidebar + Canvas */}
      <div className="flex flex-1 items-stretch min-h-[calc(100vh-56px)] relative">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar overlay drawer */}
        {mobileSidebarOpen && (
          <>
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-all"
            />
            <div className="lg:hidden fixed inset-y-14 left-0 z-50 animate-scale-up">
              <Sidebar />
            </div>
          </>
        )}

        {/* Dynamic central workspace canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full animate-fade-in bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  )
}
