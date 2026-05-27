import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { User, Shield, ShieldCheck, Mail, Database, Cpu, Calendar, Activity } from 'lucide-react'

export const Profile = () => {
  const { user } = useAuth()

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
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto selection:bg-primary/20">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-foreground">User Workspace Settings</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your personal profile details and system parameters</p>
        </div>

        {user ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Side: Avatar Card */}
            <Card className="border border-border/40 bg-card shadow-premium rounded-2xl md:col-span-1 overflow-hidden flex flex-col justify-between">
              <div className="relative h-2 bg-gradient-to-r from-primary to-indigo-600"></div>
              <CardContent className="p-6 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center text-primary-foreground font-extrabold text-2xl shadow-premium border-4 border-background select-none">
                  {getInitials(user.name || user.email)}
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-outfit text-foreground leading-tight">{user.name || 'EduLink User'}</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium pt-2">
                  Authenticated session active. JWT token validated for secure operations.
                </p>
              </CardContent>
            </Card>

            {/* Right Side: Details and Platform Specs */}
            <div className="md:col-span-2 space-y-6">
              {/* Account Details Card */}
              <Card className="border border-border/40 bg-card shadow-premium rounded-2xl">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-primary" />
                    Profile Details
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">General information matching database registries</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground/60" />
                        Email Address
                      </span>
                      <p className="text-sm font-bold text-foreground truncate pl-4">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Shield className="h-3 w-3 text-muted-foreground/60" />
                        Privilege Role
                      </span>
                      <p className="text-sm font-bold text-foreground pl-4 capitalize">{user.role?.toLowerCase() || 'student'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System and Theme Settings Card */}
              <Card className="border border-border/40 bg-card shadow-premium rounded-2xl">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                    <Cpu className="h-4.5 w-4.5 text-primary" />
                    Workspace Options & Diagnostics
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Diagnostic stats and system configuration controls</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Theme Switcher Toggle Area */}
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground block">System Color Palette Theme</span>
                      <span className="text-[11px] text-muted-foreground leading-none">Switch between light mode and high-contrast dark theme</span>
                    </div>
                    <ThemeToggle />
                  </div>

                  {/* System properties block */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-muted/10 border border-border/30 rounded-xl flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Server Status</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase">Online</span>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 border border-border/30 rounded-xl flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Platform DB</span>
                        <span className="text-xs font-bold text-foreground">MySQL 8.x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground font-semibold">User session details unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
