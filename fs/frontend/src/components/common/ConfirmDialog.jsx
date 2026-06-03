import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * ConfirmDialog — for destructive actions
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel
 * @param {boolean} loading
 * @param {string} variant - danger | warning
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmLabel = 'Hapus',
  loading = false,
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div
          className={`p-3 rounded-full ${
            variant === 'danger' ? 'bg-red-100 dark:bg-red-950' : 'bg-amber-100 dark:bg-amber-950'
          }`}
        >
          <AlertTriangle
            className={`w-6 h-6 ${
              variant === 'danger' ? 'text-red-500' : 'text-amber-500'
            }`}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
