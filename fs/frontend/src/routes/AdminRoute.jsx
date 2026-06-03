import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/common/Spinner'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
