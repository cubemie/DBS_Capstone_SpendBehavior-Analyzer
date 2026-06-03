import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/userApi'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { profileSchema, changePasswordSchema } from '@/utils/validators'
import { formatDate } from '@/utils/formatDate'
import Avatar from '@/components/common/Avatar'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import { Eye, EyeOff, Lock, User, Mail } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useNotification()
  const qc = useQueryClient()
  const [showPassSection, setShowPassSection] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar_url: user?.avatar_url || '',
    },
  })

  // Password form
  const {
    register: regPass,
    handleSubmit: handlePass,
    reset: resetPass,
    formState: { errors: passErrors, isSubmitting: savingPass },
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  const profileMutation = useMutation({
    mutationFn: (data) => userApi.updateMe(data),
    onSuccess: (res) => {
      updateUser(res.data.data)
      qc.invalidateQueries({ queryKey: ['users/me'] })
      toast.success('Profil berhasil diperbarui')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memperbarui profil'),
  })

  const passMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password berhasil diubah')
      resetPass()
      setShowPassSection(false)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal mengubah password'),
  })

  const onProfileSubmit = (data) => {
    profileMutation.mutate({
      name: data.name,
      avatar_url: data.avatar_url || null,
    })
  }

  const onPassSubmit = (data) => passMutation.mutate(data)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Profil Saya</h1>

      {/* Profile Card */}
      <div className="card p-6 space-y-6">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size="xl" />
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white font-display">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge color={user?.role === 'admin' ? 'purple' : 'blue'} size="sm">
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
              {user?.is_active && <Badge color="green" size="sm" dot>Aktif</Badge>}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-600">
          Bergabung sejak {user?.created_at ? formatDate(user.created_at, 'dd MMMM yyyy') : '—'}
          {user?.last_login_at && ` · Login terakhir ${formatDate(user.last_login_at, 'dd MMM yyyy, HH:mm')}`}
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Edit Profile Form */}
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4" noValidate>
          <h2 className="section-title">Edit Profil</h2>

          <Input
            label="Nama Lengkap"
            type="text"
            prefix={<User className="w-4 h-4" />}
            error={profileErrors.name?.message}
            required
            {...regProfile('name')}
          />

          <Input
            label="Email"
            type="email"
            prefix={<Mail className="w-4 h-4" />}
            value={user?.email || ''}
            disabled
            helper="Email tidak dapat diubah"
          />

          <Input
            label="URL Avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            error={profileErrors.avatar_url?.message}
            helper="Opsional — URL gambar untuk foto profil"
            {...regProfile('avatar_url')}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile || profileMutation.isPending}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Keamanan</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<Lock className="w-4 h-4" />}
            onClick={() => setShowPassSection(!showPassSection)}
          >
            {showPassSection ? 'Batal' : 'Ubah Password'}
          </Button>
        </div>

        {!showPassSection ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Untuk keamanan akun, gunakan password yang kuat dan unik.
          </p>
        ) : (
          <form onSubmit={handlePass(onPassSubmit)} className="space-y-4" noValidate>
            <Input
              label="Password Lama"
              type={showCurrentPass ? 'text' : 'password'}
              prefix={<Lock className="w-4 h-4" />}
              suffix={
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} tabIndex={-1}>
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={passErrors.current_password?.message}
              required
              autoComplete="current-password"
              {...regPass('current_password')}
            />

            <Input
              label="Password Baru"
              type={showNewPass ? 'text' : 'password'}
              prefix={<Lock className="w-4 h-4" />}
              suffix={
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} tabIndex={-1}>
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={passErrors.new_password?.message}
              required
              autoComplete="new-password"
              {...regPass('new_password')}
            />

            <Input
              label="Konfirmasi Password Baru"
              type={showNewPass ? 'text' : 'password'}
              prefix={<Lock className="w-4 h-4" />}
              error={passErrors.new_password_confirmation?.message}
              required
              autoComplete="new-password"
              {...regPass('new_password_confirmation')}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => { setShowPassSection(false); resetPass() }}>
                Batal
              </Button>
              <Button type="submit" loading={savingPass || passMutation.isPending}>
                Ubah Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
