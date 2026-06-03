import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { registerSchema } from '@/utils/validators'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { toast } = useNotification()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Registrasi berhasil! Silakan masuk.')
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registrasi gagal, silakan coba lagi'
      toast.error(msg)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Buat akun baru</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mulai kelola keuangan Anda dengan BUDU</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Budi Santoso"
          prefix={<User className="w-4 h-4" />}
          error={errors.name?.message}
          required
          autoComplete="name"
          {...register('name')}
        />

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
          placeholder="Min. 8 karakter"
          prefix={<Lock className="w-4 h-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          required
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          label="Konfirmasi Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Ulangi password"
          prefix={<Lock className="w-4 h-4" />}
          error={errors.password_confirmation?.message}
          required
          autoComplete="new-password"
          {...register('password_confirmation')}
        />

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
