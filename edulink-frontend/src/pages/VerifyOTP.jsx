import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authService } from '../services/authService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ArrowLeft, Key } from 'lucide-react'

export const VerifyOTP = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please start over.')
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, '')
    
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      document.getElementById('otp-5')?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await authService.verifyOTP(email, otpString)

      if (response.message && response.message.includes('verified')) {
        toast.success('OTP verified successfully!')
        navigate('/reset-password', { state: { email, otp: otpString } })
      } else {
        toast.error(response.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        document.getElementById('otp-0')?.focus()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.'
      toast.error(message)
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
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
            <CardTitle className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">Verify Identity</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              We sent a 6-digit OTP code to <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-semibold text-foreground/80 block text-center">OTP Code</Label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold rounded-xl border-border bg-background/50 focus:bg-background transition-all focus:ring-2 focus:ring-primary"
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full rounded-xl h-11 shadow-premium hover-glow active-pulse font-semibold" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Verify Code'}
                </Button>
              </div>
            </form>
            <div className="text-center space-y-3 pt-2 text-xs sm:text-sm font-medium">
              <div>
                <span className="text-muted-foreground">Didn't receive code? </span>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password', { state: { email } })}
                  className="text-primary hover:underline font-bold"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
              <div className="border-t border-border/40 pt-4 mt-2">
                <Link to="/login" className="inline-flex items-center text-primary hover:underline gap-1.5 font-semibold">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
