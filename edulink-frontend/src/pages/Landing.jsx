import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  FileText 
} from 'lucide-react'
import landingImage from '../assets/landing-feature.png'

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/20">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse-soft"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-16 lg:pt-24 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Next-Gen Learning Collaboration</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-outfit text-foreground animate-scale-up">
              Bridge the Gap <br />
              Between <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-500 bg-clip-text text-transparent">Teaching</span> and <span className="bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">Learning</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              EduLink is the ultimate platform for real-time discussions, secure document sharing, and collaborative learning, tailored for modern educators and students.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-2xl px-8 text-base h-12 shadow-premium hover-glow active-pulse">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full rounded-2xl px-8 text-base h-12 hover:bg-accent/80 transition-all font-medium">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 text-xs sm:text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Supercharged WebSockets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>JWT Secure Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Interactive Hub</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative flex justify-center">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-500/20 rounded-full blur-3xl opacity-70"></div>
            
            {/* High-End Feature Presentation Frame */}
            <div className="relative p-2 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-border/50 to-violet-500/20 shadow-2xl max-w-lg w-full transform hover:scale-[1.01] transition-transform duration-500">
              <div className="bg-card rounded-[2.2rem] overflow-hidden border border-border/40">
                <img
                  src={landingImage}
                  alt="EduLink Collaboration Panel"
                  className="w-full object-cover transition-all hover:scale-105 duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-border/40 bg-card/40 backdrop-blur-sm py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-primary">10K+</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-1">Active Students</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-primary">500+</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-1">Expert Teachers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-primary">99.9%</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-1">Socket Uptime</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-primary">1M+</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase mt-1">Files Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-outfit text-foreground">
              Powerful Collaboration Features
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">
              Tailored workspaces for schools and professional academies to exchange knowledge in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6 text-primary-foreground font-bold" />}
              title="Browse & Enroll"
              description="Students can easily browse available subjects by standard, enter an enrollment key, and instantly join subjects."
              gradient="from-blue-500 to-indigo-600"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary-foreground" />}
              title="Class Hubs"
              description="Teachers create subject channels, manage unique enrollment keys, and maintain control of their classrooms."
              gradient="from-violet-500 to-purple-600"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-primary-foreground" />}
              title="Real-Time Chat"
              description="Ultra-responsive group discussion chat powered by secure WebSockets with online presence tracking."
              gradient="from-fuchsia-500 to-pink-600"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-primary-foreground" />}
              title="Study Materials"
              description="Central secure hub for material distribution. Upload, organize, and download lecture notes, PDFs, or slides."
              gradient="from-emerald-500 to-teal-600"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/30 transition-all duration-300 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
      
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center mb-6 shadow-md shadow-primary/10 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold font-outfit mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}
