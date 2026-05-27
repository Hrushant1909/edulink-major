import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authService } from '../services/authService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react'

export const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const otp = location.state?.otp || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!email || !otp) {
      toast.error('Session expired. Please start over.')
      navigate('/forgot-password')
    }
  }, [email, otp, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authService.resetPassword(email, otp, newPassword)

      if (response.message && response.message.includes('successfully')) {
        toast.success('Password reset successfully! You can now login.')
        navigate('/login', { state: { email } })
      } else {
        toast.error(response.message || 'Failed to reset password')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.'
      toast.error(message)
      
      if (message.includes('Invalid') || message.includes('expired')) {
        navigate('/forgot-password', { state: { email } })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!email || !otp) {
    return null
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
            <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">New Password</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              Create a secure new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground/80">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground/80">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 rounded-xl border-border/60 bg-background/50 focus:bg-background transition-all"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full rounded-xl h-11 shadow-premium hover-glow active-pulse font-semibold" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
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
