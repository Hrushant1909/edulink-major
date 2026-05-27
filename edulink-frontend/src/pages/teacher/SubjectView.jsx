import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { subjectService } from '../../services/subjectService'
import { BookOpen, FileText, MessageSquare, ArrowLeft, Upload, Key, Settings, GraduationCap } from 'lucide-react'

export const SubjectView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubject()
  }, [id])

  const fetchSubject = async () => {
    try {
      const response = await subjectService.getTeacherSubjects()
      const found = response.data?.find((s) => s.id === parseInt(id))
      setSubject(found)
    } catch (error) {
      console.error('Error fetching subject:', error)
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

  if (!subject) {
    return (
      <DashboardLayout>
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground/60 mx-auto" />
            <p className="text-muted-foreground font-semibold">Subject Workspace not found</p>
            <Button onClick={() => navigate('/teacher/subjects')} className="rounded-xl h-9.5 shadow-premium">
              Back to Subjects
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl h-9.5 w-9.5 border-border/60 hover:bg-accent/80"
              onClick={() => navigate('/teacher/subjects')}
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold font-outfit text-foreground">{subject.name}</h1>
              <p className="text-muted-foreground text-sm font-medium">Subject details and active classrooms</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl h-10 border-border/60 hover:bg-accent/80 font-semibold text-xs"
            onClick={() => navigate(`/teacher/subjects/${id}/materials`)}
          >
            <FileText className="h-4 w-4 mr-1.5 text-primary" />
            View Uploaded Materials
          </Button>
        </div>

        {/* Dashboard Panels */}
        <div className="grid gap-6 md:grid-cols-5">
          {/* Left info column */}
          <Card className="border border-border/40 bg-card shadow-premium rounded-2xl md:col-span-3">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Workspace Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/10 p-4 rounded-2xl border border-border/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Course Name</span>
                  <span className="text-base font-bold text-foreground font-outfit">{subject.name}</span>
                </div>
                <div className="bg-muted/10 p-4 rounded-2xl border border-border/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Target Standard</span>
                  <span className="text-base font-bold text-foreground font-outfit">{subject.standard}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary/5 to-indigo-500/5 border border-primary/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Student Enrollment Key</span>
                    <code className="text-sm font-extrabold text-primary font-mono">{subject.enrollmentKey}</code>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg text-[10px] font-bold h-7 border-primary/20 hover:bg-primary hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(subject.enrollmentKey);
                    toast.success('Enrollment key copied to clipboard!');
                  }}
                >
                  Copy Key
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Actions column */}
          <Card className="border border-border/40 bg-card shadow-premium rounded-2xl md:col-span-2">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-primary" />
                Subject Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                className="w-full rounded-xl h-10.5 font-semibold text-xs shadow-premium hover-glow active-pulse"
                onClick={() => navigate(`/teacher/subjects/${id}/materials/upload`)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Course Material
              </Button>
              <Button
                className="w-full rounded-xl h-10.5 font-semibold text-xs"
                variant="outline"
                onClick={() => navigate(`/teacher/subjects/${id}/chat`)}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                Open Live Discussion Chat
              </Button>
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full rounded-xl h-10 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/teacher/subjects')}
                >
                  Back to Class Subjects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
