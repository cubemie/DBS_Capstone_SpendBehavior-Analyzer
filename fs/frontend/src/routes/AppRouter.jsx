import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import AdminRoute from './AdminRoute'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import Spinner from '@/components/common/Spinner'

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

const TransactionListPage = lazy(() => import('@/pages/transactions/TransactionListPage'))
const TransactionDetailPage = lazy(() => import('@/pages/transactions/TransactionDetailPage'))

const BudgetPage = lazy(() => import('@/pages/budget/BudgetPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'))

const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/errors/UnauthorizedPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // Guest routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestRoute>
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          </GuestRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestRoute>
            <Suspense fallback={<PageLoader />}>
              <RegisterPage />
            </Suspense>
          </GuestRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <GuestRoute>
            <Suspense fallback={<PageLoader />}>
              <ForgotPasswordPage />
            </Suspense>
          </GuestRoute>
        ),
      },
    ],
  },
  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/transactions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionListPage />
          </Suspense>
        ),
      },
      {
        path: '/transactions/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/budget',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BudgetPage />
          </Suspense>
        ),
      },
      {
        path: '/reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  // Admin routes
  {
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: '/admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminUsersPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminReportsPage />
          </Suspense>
        ),
      },
    ],
  },
  // Error pages
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
