import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'
import { Check, X, ShieldAlert, Users } from 'lucide-react'

export const PendingTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await adminService.getPendingTeachers()
      setTeachers(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch pending teachers')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    const teacher = teachers.find(t => t.id === id)
    const teacherName = teacher?.name || 'Teacher'
    
    if (!window.confirm(`Are you sure you want to approve ${teacherName}?`)) {
      return
    }
    
    try {
      const response = await adminService.approveTeacher(id)
      toast.success(
        `Approved successfully! Notification sent to ${teacherName}.`,
        {
          duration: 5000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        }
      )
      fetchTeachers()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to approve teacher'
      toast.error(errorMsg)
      console.error('Error approving teacher:', error)
    }
  }

  const handleReject = async (id) => {
    const teacher = teachers.find(t => t.id === id)
    const teacherName = teacher?.name || 'Teacher'

    if (!window.confirm(`Are you sure you want to reject ${teacherName}?`)) {
      return
    }
    
    try {
      const response = await adminService.rejectTeacher(id)
      toast.success(response.message || 'Teacher registration rejected')
      fetchTeachers()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reject teacher'
      toast.error(errorMsg)
      console.error('Error rejecting teacher:', error)
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
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-foreground">Pending Registrations</h1>
          <p className="text-muted-foreground text-sm font-medium">Review and approve new teacher credentials before granting subject control</p>
        </div>

        {teachers.length === 0 ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <Users className="h-14 w-14 text-muted-foreground/60 mx-auto animate-bounce-soft" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground font-outfit">No registrations pending</p>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">All teachers have been verified. Excellent job keeping up with approvals!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-yellow-500 animate-pulse" />
                Teacher Verification List
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Please review emails and identities carefully before performing system actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">ID</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Teacher Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Email Address</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right pr-6">Decisions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/10 transition-colors group">
                      <TableCell className="font-bold text-xs text-muted-foreground pl-6">{teacher.id}</TableCell>
                      <TableCell className="font-bold font-outfit text-foreground py-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 flex-shrink-0">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="truncate">{teacher.name}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-muted-foreground">{teacher.email}</TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-yellow-500/10 text-yellow-600">
                          {teacher.status || 'PENDING'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="rounded-lg text-xs h-8 bg-emerald-600 hover:bg-emerald-500 hover-glow active-pulse text-white font-semibold"
                            onClick={() => handleApprove(teacher.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg text-xs h-8 hover:bg-red-500 hover-glow active-pulse font-semibold"
                            onClick={() => handleReject(teacher.id)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
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
