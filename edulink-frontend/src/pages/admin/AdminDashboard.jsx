import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { adminService } from '../../services/adminService'
import { Users, GraduationCap, BookOpen, FileText, Clock, Settings, Sparkles } from 'lucide-react'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Total Subjects',
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      color: 'text-violet-500 bg-violet-500/10',
    },
    {
      title: 'Total Materials',
      value: stats?.totalMaterials || 0,
      icon: FileText,
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      title: 'Pending Teachers',
      value: stats?.pendingTeachers || 0,
      icon: Clock,
      color: 'text-yellow-500 bg-yellow-500/10',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white shadow-premium relative overflow-hidden border border-border/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="space-y-1 relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">Admin Panel</h1>
            <p className="opacity-95 text-sm font-medium">Verify pending teacher registrations, monitor platform counts, and configure global properties.</p>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4.5 w-4.5 text-yellow-400" />
              <span>Super Admin Access</span>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            System Metrics Overview
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="border border-border/40 bg-card hover:border-primary/20 shadow-premium hover:shadow-premium-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
