import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { useNotification } from '@/hooks/useNotification'
import { forgotPasswordSchema } from '@/utils/validators'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function ForgotPasswordPage() {
  const { toast } = useNotification()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch {
      toast.error('Terjadi kesalahan, silakan coba lagi')
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-2">Email terkirim!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Jika email Anda terdaftar, link reset password telah dikirimkan. Periksa inbox atau folder spam Anda.
        </p>
        <Link to="/login">
          <Button variant="secondary" fullWidth>Kembali ke Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Lupa Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Masukkan email Anda dan kami akan mengirimkan link reset password.
        </p>
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

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          Kirim Link Reset
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Ingat password?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
          Kembali masuk
        </Link>
      </p>
    </div>
  )
}
