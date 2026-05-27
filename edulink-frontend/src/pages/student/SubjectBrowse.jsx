import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { subjectService } from '../../services/subjectService'
import { StandardSelect } from '../../components/ui/StandardSelect'
import toast from 'react-hot-toast'
import { BookOpen, GraduationCap, Search, Key, Sparkles, ChevronRight, X } from 'lucide-react'

export const SubjectBrowse = () => {
  const { user } = useAuth()
  const [standard, setStandard] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [enrollModal, setEnrollModal] = useState({ open: false, subject: null })
  const [enrollmentKey, setEnrollmentKey] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  const handleSearch = async () => {
    if (!standard.trim()) {
      toast.error('Please enter a standard')
      return
    }

    setLoading(true)
    try {
      const response = await subjectService.getSubjectsByStandard(standard)
      setSubjects(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch subjects')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!enrollmentKey.trim()) {
      toast.error('Please enter enrollment key')
      return
    }

    setEnrolling(true)
    try {
      const response = await subjectService.enrollStudent(
        enrollModal.subject.id,
        enrollmentKey
      )
      
      if (response.message) {
        if (response.message.includes('Invalid enrollment key')) {
          toast.error('Invalid enrollment key. Please check and try again.')
        } else if (response.message.includes('already enrolled')) {
          toast.error('You are already enrolled in this subject!')
        } else {
          toast.success(response.message)
        }
      } else {
        toast.success('Enrolled successfully')
      }
      
      setEnrollModal({ open: false, subject: null })
      setEnrollmentKey('')
      if (standard) {
        handleSearch()
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to enroll'
      toast.error(errorMsg)
      console.error('Error enrolling:', error)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-foreground">Browse Subjects</h1>
          <p className="text-muted-foreground text-sm font-medium">Search for standards/classes and join with your key</p>
        </div>

        {/* Search Panel Card */}
        <Card className="border border-border/40 bg-card shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Classrooms
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-medium">Specify your school standard level to see available course subjects</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="standard" className="text-xs font-semibold text-foreground/80">Standard / Grade</Label>
                <StandardSelect
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  name="standard"
                  placeholder="Select Standard to Browse..."
                  disabled={loading}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="rounded-xl h-10 px-6 font-semibold shadow-premium hover-glow active-pulse">
                {loading ? <LoadingSpinner size="sm" /> : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {subjects.length === 0 && !loading ? (
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-3xl">
            <CardContent className="py-16 text-center space-y-4">
              <BookOpen className="h-14 w-14 text-muted-foreground/60 mx-auto" />
              <div className="space-y-1">
                <p className="text-lg font-bold font-outfit text-foreground">No subjects found</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">Select your grade standard from the dropdown above to list subjects.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="border border-border/40 bg-card hover:border-primary/20 shadow-premium hover:shadow-premium-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="pb-3 relative">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-indigo-500"></div>
                  <div className="flex items-center space-x-2.5 pt-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold font-outfit text-foreground truncate">{subject.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-medium">Standard: {subject.standard}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    className="w-full rounded-xl h-9 text-xs font-semibold shadow-premium hover-glow active-pulse"
                    onClick={() => setEnrollModal({ open: true, subject })}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Join Subject
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Beautiful Custom Enrollment Modal */}
        <Modal
          isOpen={enrollModal.open}
          onClose={() => {
            setEnrollModal({ open: false, subject: null })
            setEnrollmentKey('')
          }}
          title={`Enroll in ${enrollModal.subject?.name}`}
        >
          <div className="space-y-6 pt-3">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Key className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground font-medium">
                Please enter the enrollment security key provided by your teacher to complete registration in this course subject.
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enrollmentKey" className="text-xs font-semibold text-foreground/80">Enrollment Key</Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="enrollmentKey"
                  type="text"
                  placeholder="Enter enrollment key"
                  value={enrollmentKey}
                  onChange={(e) => setEnrollmentKey(e.target.value)}
                  className="pl-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                  disabled={enrolling}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                className="rounded-xl h-9.5 px-4 font-semibold text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEnrollModal({ open: false, subject: null })
                  setEnrollmentKey('')
                }}
                disabled={enrolling}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="rounded-xl h-9.5 px-5 font-semibold text-xs shadow-premium hover-glow active-pulse"
              >
                {enrolling ? <LoadingSpinner size="sm" /> : 'Confirm Enrollment'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
