import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { subjectService } from '../../services/subjectService'
import { Plus, Eye, FileText, BookOpen, Key, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export const SubjectList = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getTeacherSubjects()
      setSubjects(response.data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
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
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">My Subjects</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage and monitor your classrooms and subjects</p>
          </div>
          <Link to="/teacher/subjects/create">
            <Button className="rounded-xl shadow-premium hover-glow active-pulse">
              <Plus className="h-4 w-4 mr-2" />
              Create New Subject
            </Button>
          </Link>
        </div>

        {subjects.length === 0 ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <BookOpen className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground">No subjects created yet</p>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Create a subject and share its key with your student group to begin uploading lecture materials.</p>
              </div>
              <Link to="/teacher/subjects/create">
                <Button className="rounded-xl px-6 py-2 shadow-premium hover-glow">Create Subject</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold font-outfit text-foreground">Class Subjects</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Monitor active subjects, target grades, and student enrollment keys</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">Subject Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Standard</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Enrollment Key</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-muted/10 transition-colors group">
                      <TableCell className="font-bold font-outfit text-foreground pl-6 py-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="truncate">{subject.name}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-muted-foreground">{subject.standard}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1.5">
                          <code className="px-2.5 py-1 bg-muted rounded-lg text-xs font-mono font-bold text-primary border border-border/40">
                            {subject.enrollmentKey}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(subject.enrollmentKey);
                              toast.success('Enrollment key copied!');
                            }}
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-accent/80 rounded transition-all"
                            title="Copy Key"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-8"
                            onClick={() => navigate(`/teacher/subjects/${subject.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-8"
                            onClick={() => navigate(`/teacher/subjects/${subject.id}/materials`)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1 text-primary" />
                            Materials
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
