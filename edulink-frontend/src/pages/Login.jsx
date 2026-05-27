import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AlertCircle, Lock, Mail, Sparkles, Eye, EyeOff, MessageSquare, ArrowRight, BookOpen, ThumbsUp } from 'lucide-react'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary/20 relative overflow-hidden select-none">
      
      {/* LEFT SIDE: Branding, taglines & premium visual features showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 relative overflow-hidden border-r border-border/20">
        {/* Animated Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-40 animate-pulse-soft"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl opacity-35 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

        {/* Top: Logo branding */}
        <div className="flex items-center space-x-2.5 z-10 select-none">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-black text-base shadow-lg">
            E
          </div>
          <span className="text-lg font-black font-outfit text-white tracking-tight">
            EduLink
          </span>
        </div>

        {/* Center: Dialogue Summarization Dialogue Box Presentation */}
        <div className="space-y-8 z-10 max-w-md my-auto">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="h-3 w-3" />
              Unified Learning Environment
            </span>
            <h1 className="text-4xl font-extrabold font-outfit text-white leading-tight tracking-tight">
              The topic-guided workspace for collaborative classrooms.
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Simplify student-teacher discourse with structured dialogue segmenting, collective upvoting, and premium workspace coordination.
            </p>
          </div>

          {/* Metric Cards showcasing custom features */}
          <div className="space-y-4 pt-4 select-none">
            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div className="leading-snug">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Discussion Channels</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-normal">
                  Real-time segment-wise dialogue feeds equipped with instant STOMP WebSocket synchronization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 flex-shrink-0">
                <ThumbsUp className="h-4.5 w-4.5" />
              </div>
              <div className="leading-snug">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Collective Doubt Upvoting</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-normal">
                  Crowdsource student queries to easily highlight, trace, and resolve major points of confusion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div className="leading-snug">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Course Resource Vault</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-normal">
                  Upload lecture handouts, pdf slides, or worksheets directly inside target classroom standard categories.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Research inspiration citation info */}
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider z-10 leading-snug select-none">
          💡 Inspired by: "Let Topic Flow: A Unified Topic-Guided Dialogue Framework"
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Card Form */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Responsive Background Glows */}
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-primary/5 rounded-full blur-3xl opacity-50 lg:hidden"></div>
        
        <div className="w-full max-w-md animate-scale-up z-10">
          <Card className="border border-border/40 bg-card/65 backdrop-blur-xl shadow-premium rounded-3xl overflow-hidden relative">
            <CardHeader className="space-y-1.5 pb-6 text-center pt-8">
              {/* Mobile Only Logo branding */}
              <div className="lg:hidden mx-auto h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-black text-base shadow-lg mb-4">
                E
              </div>
              
              <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground text-xs font-semibold">
                Sign in to your EduLink workspace
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                {/* Password input + eye toggle view */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">Password</Label>
                    <Link
                      to="/forgot-password"
                      state={{ email }}
                      className="text-[11px] text-primary hover:underline font-bold uppercase tracking-wider"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Form submit button */}
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-xl h-10.5 shadow-premium hover-glow active-pulse font-bold text-xs uppercase tracking-wider" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : <span className="flex items-center justify-center gap-1.5">Enter Workspace <ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </div>
              </form>
              
              {/* Account approval state widget alert */}
              {showPendingMessage && (
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 animate-fade-in">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider">Account Pending Approval</p>
                      <p className="text-[11px] leading-relaxed font-semibold">
                        Your registration was successful. Please wait for the administrator to approve your account. 
                        You will receive an email notification once approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Marketing redirect page */}
              <div className="border-t border-border/40 pt-4 mt-4 text-center text-xs font-semibold select-none">
                <span className="text-muted-foreground">Don't have an account yet? </span>
                <Link to="/signup" className="text-primary hover:underline font-extrabold">
                  Create Account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
