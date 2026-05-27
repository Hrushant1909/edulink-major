import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { User, Mail, Lock, GraduationCap, Sparkles } from 'lucide-react'

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    standard: '',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.role === 'STUDENT' && !formData.standard.trim()) {
      toast.error('Please enter your standard')
      return
    }
    
    setLoading(true)

    const result = await signup(formData, formData.role)
    
    if (result.success) {
      if (formData.role === 'TEACHER') {
        toast.success(
          'Registration successful! A confirmation email has been sent. Your account is pending admin approval.',
          {
            duration: 6000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          }
        )
      } else {
        toast.success('Registration successful!')
      }
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl opacity-45 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md animate-scale-up z-10 my-8">
        <Card className="border border-border/40 bg-card/60 backdrop-blur-xl shadow-premium rounded-3xl overflow-hidden relative">
          <CardHeader className="space-y-2 pb-4 text-center pt-8">
            <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-premium mb-2">
              E
            </div>
            <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              Join EduLink today to start collaborating
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10.5 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10.5 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10.5 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-semibold text-foreground/80">Role</Label>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    disabled={loading}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </Select>
                </div>

                {formData.role === 'STUDENT' && (
                  <div className="space-y-1.5 animate-scale-up">
                    <Label htmlFor="standard" className="text-xs font-semibold text-foreground/80">Standard</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="standard"
                        name="standard"
                        type="text"
                        placeholder="e.g., 10th"
                        value={formData.standard}
                        onChange={handleChange}
                        className="pl-10.5 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                        required={formData.role === 'STUDENT'}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full rounded-xl h-11 shadow-premium hover-glow active-pulse font-semibold" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </Button>
              </div>
            </form>

            <div className="border-t border-border/40 pt-4 mt-2 text-center text-xs sm:text-sm font-medium">
              <span className="text-muted-foreground font-medium">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
