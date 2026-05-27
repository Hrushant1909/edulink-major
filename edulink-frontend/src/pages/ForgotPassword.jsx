import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authService } from '../services/authService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Mail, ArrowLeft } from 'lucide-react'

export const ForgotPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)

      if (response.message && response.message.includes('OTP sent')) {
        toast.success('OTP sent successfully! Check your email.')
        navigate('/verify-otp', { state: { email } })
      } else {
        toast.error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/20">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl opacity-45 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md animate-scale-up z-10">
        <Card className="border border-border/40 bg-card/60 backdrop-blur-xl shadow-premium rounded-3xl overflow-hidden relative">
          <CardHeader className="space-y-2 pb-6 text-center pt-8">
            <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-premium mb-2">
              E
            </div>
            <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              We will send a 6-digit OTP code to verify your identity
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
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full rounded-xl h-11 shadow-premium hover-glow active-pulse font-semibold" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
                </Button>
              </div>
            </form>
            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary hover:underline gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
