import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react'
import { useState } from 'react'

export const Sidebar = () => {
  const location = useLocation()
  const { getUserRole, user } = useAuth()
  const role = getUserRole()
  const [collapsed, setCollapsed] = useState(false)

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/teachers', label: 'Pending Approvals', icon: Users },
  ]

  const teacherLinks = [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teacher/subjects', label: 'My Subjects', icon: BookOpen },
  ]

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/subjects', label: 'Browse Subjects', icon: BookOpen },
    { path: '/student/enrolled', label: 'My Enrollments', icon: GraduationCap },
  ]

  const links = role === 'ADMIN' 
    ? adminLinks 
    : role === 'TEACHER' 
    ? teacherLinks 
    : studentLinks

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 min-h-[calc(100vh-64px)] p-4 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 mt-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/')
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'group flex items-center rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-premium-hover hover-glow'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
              <span className={cn(
                "ml-3 transition-opacity duration-300 whitespace-nowrap",
                collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100"
              )}>
                {link.label}
              </span>
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-16 scale-0 rounded-lg bg-popover border border-border px-2.5 py-1.5 text-xs text-popover-foreground shadow-premium group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
                  {link.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-premium hover:text-foreground hover:bg-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* User Profile Info Card at Bottom */}
      {user && (
        <div className={cn(
          "border-t pt-4 mt-auto flex items-center gap-3 transition-all",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-premium flex-shrink-0">
            {getInitials(user.name || user.email)}
          </div>
          
          <div className={cn(
            "flex flex-col min-w-0 transition-opacity duration-300",
            collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100"
          )}>
            <span className="text-sm font-semibold truncate leading-tight font-outfit text-foreground">{user.name || 'User'}</span>
            <span className="text-[10px] uppercase font-bold text-primary/80 tracking-wider mt-0.5 flex items-center gap-1">
              {role === 'ADMIN' && <Shield className="h-3 w-3 text-red-500 inline" />}
              {role?.toLowerCase()}
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
