import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { subjectService } from '../../services/subjectService'
import { StandardSelect } from '../../components/ui/StandardSelect'
import toast from 'react-hot-toast'
import { Plus, BookOpen, GraduationCap, Key, ArrowLeft } from 'lucide-react'

export const SubjectCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    standard: '',
    enrollmentKey: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter subject name')
      return
    }
    if (!formData.standard.trim()) {
      toast.error('Please enter standard')
      return
    }
    if (!formData.enrollmentKey.trim()) {
      toast.error('Please enter enrollment key')
      return
    }
    
    setLoading(true)

    try {
      const response = await subjectService.createSubject(formData)
      toast.success(response.message || 'Subject created successfully')
      navigate('/teacher/subjects')
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create subject'
      toast.error(errorMsg)
      console.error('Error creating subject:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-9 w-9 border-border/60 hover:bg-accent/80"
            onClick={() => navigate('/teacher/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">Create Subject</h1>
            <p className="text-muted-foreground text-sm font-medium">Add a new collaborative classroom subject</p>
          </div>
        </div>

        <Card className="border border-border/40 bg-card shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Subject Workspace Details
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-medium">Provide a course title, target school standard level, and enrollment security passcode</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">Subject / Course Name</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Mathematics, Science, English Literature"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="standard" className="text-xs font-semibold text-foreground/80">Target Standard / Grade</Label>
                <StandardSelect
                  value={formData.standard}
                  onChange={handleChange}
                  name="standard"
                  placeholder="Select Target Standard..."
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enrollmentKey" className="text-xs font-semibold text-foreground/80">Enrollment Security Key</Label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="enrollmentKey"
                    name="enrollmentKey"
                    type="text"
                    placeholder="e.g., MATH2026, SECUREKEY"
                    value={formData.enrollmentKey}
                    onChange={handleChange}
                    className="pl-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium pl-1 leading-normal">
                  💡 Students will need to input this exact passcode to join this classroom channel and access study materials.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/teacher/subjects')}
                  className="rounded-xl h-10 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl h-10 px-5 font-semibold text-xs shadow-premium hover-glow active-pulse">
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Subject Channel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
