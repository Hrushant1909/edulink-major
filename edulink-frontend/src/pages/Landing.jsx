import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">EduLink</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive learning management system connecting teachers and students
            for seamless education delivery.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>For Students</CardTitle>
              <CardDescription>
                Browse subjects, enroll in courses, and access study materials
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>
                Create subjects, upload materials, and manage your classes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Study Materials</CardTitle>
              <CardDescription>
                Upload and download study materials in various formats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage teachers, students, and monitor system activity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}

