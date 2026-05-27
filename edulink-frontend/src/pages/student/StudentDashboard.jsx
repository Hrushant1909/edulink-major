import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { subjectService } from '../../services/subjectService'
import { BookOpen, GraduationCap, ArrowRight, BookOpenCheck, Clock, Users } from 'lucide-react'

export const StudentDashboard = () => {
  const [enrolledSubjects, setEnrolledSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrolledSubjects()
  }, [])

  const fetchEnrolledSubjects = async () => {
    try {
      const response = await subjectService.getEnrolledSubjects()
      setEnrolledSubjects(response.data || [])
    } catch (error) {
      console.error('Error fetching enrolled subjects:', error)
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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="space-y-1 relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">Student Dashboard</h1>
            <p className="opacity-90 text-sm font-medium">Welcome back! Manage your enrolled subjects and study materials beautifully.</p>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <Link to="/student/subjects">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-5 py-2 text-sm font-semibold active-pulse shadow-md">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Subjects
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-premium flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-outfit text-foreground">{enrolledSubjects.length}</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Enrolled Subjects</div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-premium flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-outfit text-foreground">24/7</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Material Access</div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-premium flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-outfit text-foreground">Live</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Discussion Chat</div>
            </div>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Active Courses
          </h2>
          
          {enrolledSubjects.length === 0 ? (
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
              <CardContent className="py-16 text-center space-y-4">
                <BookOpen className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
                <div className="space-y-1">
                  <p className="text-lg font-bold font-outfit text-foreground">No enrolled subjects yet</p>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">Browse our available subjects list and enter your subject key to join a classroom.</p>
                </div>
                <Link to="/student/subjects">
                  <Button className="rounded-xl px-6 py-2 shadow-premium hover-glow active-pulse">Browse Subjects</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledSubjects.map((subject) => (
                <Card key={subject.id} className="border border-border/40 bg-card hover:border-primary/20 shadow-premium hover:shadow-premium-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="pb-3 relative">
                    {/* Tiny accent stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-indigo-500"></div>
                    <div className="flex items-center space-x-2.5 pt-2">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-bold font-outfit text-foreground truncate">{subject.name}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Standard: {subject.standard}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Link to={`/student/subjects/${subject.id}/materials`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs h-9">
                          Materials
                        </Button>
                      </Link>
                      <Link to={`/student/subjects/${subject.id}/chat`} className="w-full">
                        <Button variant="default" size="sm" className="w-full rounded-xl text-xs h-9 hover-glow active-pulse">
                          Open Chat
                          <ArrowRight className="h-3 w-3 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
