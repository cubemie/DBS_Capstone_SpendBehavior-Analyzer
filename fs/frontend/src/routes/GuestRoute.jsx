import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/common/Spinner'

export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
