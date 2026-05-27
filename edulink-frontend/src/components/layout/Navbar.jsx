import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Button } from '../ui/Button'
import { LogOut, User, Menu, GraduationCap, Settings } from 'lucide-react'
import { useState } from 'react'

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    if (user.role === 'TEACHER') return '/teacher/dashboard'
    return '/student/dashboard'
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to={isAuthenticated() ? getDashboardLink() : "/"} className="flex items-center space-x-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-premium hover-glow">
            E
          </div>
          <span className="text-xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-primary via-indigo-600 to-violet-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            EduLink
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link 
            to="/" 
            className={`transition-colors hover:text-foreground/80 ${isActive('/') ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors hover:text-foreground/80 ${isActive('/about') ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors hover:text-foreground/80 ${isActive('/contact') ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
          >
            Contact Us
          </Link>
          {isAuthenticated() && (
            <Link 
              to={getDashboardLink()} 
              className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${location.pathname.includes('/dashboard') ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
              <GraduationCap className="h-4 w-4 text-primary" />
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {isAuthenticated() ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="rounded-lg h-9 hover:bg-accent/80 transition-all font-medium text-xs sm:text-sm">
                  <User className="h-4 w-4 mr-1.5 text-primary" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="rounded-lg h-9 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all font-medium text-xs sm:text-sm"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-lg h-9 font-medium text-sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-lg h-9 shadow-premium hover-glow active-pulse font-medium text-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Polished Drawer layout) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-4 space-y-3 animate-fade-in">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            Contact Us
          </Link>
          {isAuthenticated() && (
            <Link 
              to={getDashboardLink()} 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          {!isAuthenticated() && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="sm" className="w-full rounded-lg">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button size="sm" className="w-full rounded-lg hover-glow shadow-premium">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
