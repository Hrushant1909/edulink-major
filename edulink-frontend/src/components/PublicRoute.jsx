import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getUserRole } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated()) {
    const role = getUserRole()
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'TEACHER') {
      return <Navigate to="/teacher/dashboard" replace />
    } else if (role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />
    }
  }

  return children
}
