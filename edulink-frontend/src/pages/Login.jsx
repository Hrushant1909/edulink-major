import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AlertCircle, Lock, Mail, Sparkles } from 'lucide-react'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPendingMessage, setShowPendingMessage] = useState(false)
  const { login, getUserRole } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      setShowPendingMessage(false)
      const role = getUserRole()
      if (role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (role === 'TEACHER') {
        navigate('/teacher/dashboard')
      } else if (role === 'STUDENT') {
        navigate('/student/dashboard')
      } else {
        navigate('/')
      }
    } else if (result.pendingApproval) {
      setShowPendingMessage(true)
    } else {
      setShowPendingMessage(false)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl opacity-45 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md animate-scale-up z-10">
        <Card className="border border-border/40 bg-card/60 backdrop-blur-xl shadow-premium rounded-3xl overflow-hidden relative">
          <CardHeader className="space-y-2 pb-6 text-center pt-8">
            <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-premium mb-2">
              E
            </div>
            <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10.5 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full rounded-xl h-11 shadow-premium hover-glow active-pulse font-semibold" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                </Button>
              </div>
            </form>
            
            {showPendingMessage && (
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 animate-fade-in">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1 text-left">
                    <p className="text-xs font-bold uppercase tracking-wider">Account Pending Approval</p>
                    <p className="text-xs leading-relaxed font-medium">
                      Your registration was successful. Please wait for the administrator to approve your account. 
                      You will receive an email notification once approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-center text-xs sm:text-sm font-medium pt-2">
              <div>
                <Link
                  to="/forgot-password"
                  state={{ email }}
                  className="text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="border-t border-border/40 pt-4 mt-2">
                <span className="text-muted-foreground font-medium">Don't have an account? </span>
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  Sign up free
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
