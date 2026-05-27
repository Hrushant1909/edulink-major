import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { subjectService } from '../../services/subjectService'
import { FileText, BookOpen, MessageSquare, GraduationCap, ChevronRight } from 'lucide-react'

export const EnrolledSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrolledSubjects()
  }, [])

  const fetchEnrolledSubjects = async () => {
    try {
      const response = await subjectService.getEnrolledSubjects()
      setSubjects(response.data || [])
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
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">My Enrollments</h1>
            <p className="text-muted-foreground text-sm font-medium">Browse subjects and classes you have enrolled in</p>
          </div>
          <Link to="/student/subjects">
            <Button className="rounded-xl shadow-premium hover-glow active-pulse">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse More Subjects
            </Button>
          </Link>
        </div>

        {subjects.length === 0 ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <GraduationCap className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground">No enrolled subjects yet</p>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">It looks like you haven't joined any subjects. Search for standard-specific classes and enroll now!</p>
              </div>
              <Link to="/student/subjects">
                <Button className="rounded-xl px-6 py-2 shadow-premium hover-glow">Browse Subjects</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold font-outfit text-foreground">Class Subjects</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Verify your registered subjects and quickly access materials and group chat</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">Subject Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Standard</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right pr-6">Quick Actions</TableHead>
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
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/student/subjects/${subject.id}/materials`}>
                            <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Materials
                            </Button>
                          </Link>
                          <Link to={`/student/subjects/${subject.id}/chat`}>
                            <Button size="sm" variant="default" className="rounded-lg text-xs h-8 hover-glow active-pulse">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Chat
                              <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          </Link>
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
