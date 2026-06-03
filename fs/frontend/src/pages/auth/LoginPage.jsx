import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { loginSchema } from '@/utils/validators'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Email atau password salah'
      toast.error(msg)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Selamat datang!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Masuk ke akun BUDU Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="budi@email.com"
          prefix={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          required
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password Anda"
          prefix={<Lock className="w-4 h-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          required
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Lupa password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Belum punya akun?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}
