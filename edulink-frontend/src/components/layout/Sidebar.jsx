import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  Info,
  Mail,
  HelpCircle,
  User,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { getUserRole, user, logout } = useAuth()
  const role = getUserRole()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Links configuration structured into categories
  const getCategorizedLinks = () => {
    const mainLinks = []
    
    if (role === 'ADMIN') {
      mainLinks.push(
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/teachers', label: 'Pending Approvals', icon: Users }
      )
    } else if (role === 'TEACHER') {
      mainLinks.push(
        { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/teacher/subjects', label: 'My Subjects', icon: BookOpen },
        { path: '/teacher/subjects/create', label: 'Create Subject', icon: Plus }
      )
    } else {
      mainLinks.push(
        { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/subjects', label: 'Browse Subjects', icon: BookOpen },
        { path: '/student/enrolled', label: 'My Enrollments', icon: GraduationCap }
      )
    }

    const supportLinks = [
      { path: '/about', label: 'About Us', icon: Info },
      { path: '/contact', label: 'Contact Us', icon: Mail },
      { 
        path: '#help', 
        label: 'Platform Help', 
        icon: HelpCircle,
        onClick: (e) => {
          e.preventDefault()
          toast.success('Support ticket portal coming soon!', { icon: '💡' })
        }
      }
    ]

    const accountLinks = [
      { path: '/profile', label: 'Workspace Settings', icon: User },
      { 
        path: '#logout', 
        label: 'Sign Out', 
        icon: LogOut,
        onClick: (e) => {
          e.preventDefault()
          handleLogout()
        },
        className: 'text-destructive hover:bg-destructive/10 hover:text-destructive'
      }
    ]

    return {
      MAIN: mainLinks,
      SUPPORT: supportLinks,
      ACCOUNT: accountLinks
    }
  }

  const sections = getCategorizedLinks()

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 min-h-[calc(100vh-56px)] p-4 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Scrollable links menu panel */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
        {Object.entries(sections).map(([sectionTitle, items]) => (
          <div key={sectionTitle} className="space-y-1.5">
            {/* Section Category Header */}
            <div className={cn(
              "text-[9px] uppercase font-bold text-muted-foreground/50 tracking-wider mb-2 px-3.5 select-none transition-all duration-300",
              collapsed ? "opacity-0 h-0 w-0 pointer-events-none mb-0" : "opacity-100"
            )}>
              {sectionTitle}
            </div>
            
            {/* Collapsed Mode Dividers */}
            {collapsed && (
              <div className="border-t border-border/40 my-3 mx-2" />
            )}

            {/* List items rendering */}
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'))
                const LinkComponent = item.onClick ? 'button' : Link

                return (
                  <LinkComponent
                    key={item.label}
                    to={item.onClick ? undefined : item.path}
                    onClick={item.onClick}
                    className={cn(
                      'group flex w-full items-center rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 relative text-left',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-premium hover-glow'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      item.className
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5 flex-shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
                    <span className={cn(
                      "ml-3 transition-all duration-300 whitespace-nowrap leading-none",
                      collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100"
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Collapsed Tooltip popups */}
                    {collapsed && (
                      <div className="absolute left-16 scale-0 rounded-lg bg-popover border border-border px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-popover-foreground shadow-premium group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap select-none">
                        {item.label}
                      </div>
                    )}
                  </LinkComponent>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle trigger widget */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-premium hover:text-foreground hover:bg-accent transition-all duration-300 z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* User info status panel */}
      {user && (
        <div className={cn(
          "border-t border-border/40 pt-4 mt-6 flex items-center gap-3 transition-all",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-sm flex-shrink-0 uppercase">
            {getInitials(user.name)}
          </div>
          
          <div className={cn(
            "flex flex-col min-w-0 transition-opacity duration-300",
            collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100"
          )}>
            <span className="text-xs font-bold truncate leading-tight font-outfit text-foreground">{user.name}</span>
            <span className="text-[9px] uppercase font-extrabold text-primary/80 tracking-wider mt-0.5 flex items-center gap-1 leading-none select-none">
              {role === 'ADMIN' && <Shield className="h-2.5 w-2.5 text-red-500 inline" />}
              {role}
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
