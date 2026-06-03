import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import Button from '@/components/common/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl">
            <FileQuestion className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-gray-200 dark:text-gray-800 font-display mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
      </div>
    </div>
  )
}
