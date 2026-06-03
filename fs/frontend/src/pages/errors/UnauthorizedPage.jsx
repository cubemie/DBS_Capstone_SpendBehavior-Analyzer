import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import Button from '@/components/common/Button'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-red-50 dark:bg-red-950 rounded-3xl">
            <ShieldOff className="w-16 h-16 text-red-400" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-gray-200 dark:text-gray-800 font-display mb-2">403</h1>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-2">Akses Ditolak</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
      </div>
    </div>
  )
}
