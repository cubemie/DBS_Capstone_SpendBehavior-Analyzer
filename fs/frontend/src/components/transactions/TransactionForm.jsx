import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/api/categoryApi'
import { transactionSchema } from '@/utils/validators'
import { formatDate } from '@/utils/formatDate'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

/**
 * TransactionForm
 * @param {object} defaultValues - pre-filled for edit mode
 * @param {function} onSubmit
 * @param {boolean} isSubmitting
 * @param {function} onCancel
 */
export default function TransactionForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesRes?.data?.data || []

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      transaction_date: formatDate(new Date(), 'yyyy-MM-dd'),
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) reset({ ...defaultValues })
  }, [defaultValues, reset])

  const selectedType = watch('type')

  const categoryOptions = categories
    .filter((c) => c.type === selectedType || c.type === 'both')
    .map((c) => ({ value: c.id, label: c.name }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Type */}
      <div>
        <p className="label-base">Tipe Transaksi <span className="text-red-500">*</span></p>
        <div className="flex gap-3 mt-1.5">
          {['expense', 'income'].map((t) => (
            <label
              key={t}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                selectedType === t
                  ? t === 'expense'
                    ? 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'border-green-400 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              <input type="radio" value={t} className="sr-only" {...register('type')} />
              {t === 'expense' ? '📤 Pengeluaran' : '📥 Pemasukan'}
            </label>
          ))}
        </div>
        {errors.type && <p className="mt-1.5 text-xs text-red-500">{errors.type.message}</p>}
      </div>

      {/* Amount */}
      <Input
        label="Nominal"
        type="number"
        placeholder="0"
        prefix={<span className="text-gray-400 text-sm font-medium">Rp</span>}
        error={errors.amount?.message}
        required
        min={1}
        {...register('amount', { valueAsNumber: true })}
      />

      {/* Category */}
      <Controller
        name="category_id"
        control={control}
        render={({ field }) => (
          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            options={categoryOptions}
            error={errors.category_id?.message}
            required
            {...field}
          />
        )}
      />

      {/* Description */}
      <Input
        label="Deskripsi"
        type="text"
        placeholder="Makan siang, gaji, dll."
        error={errors.description?.message}
        required
        {...register('description')}
      />

      {/* Date */}
      <Input
        label="Tanggal"
        type="date"
        error={errors.transaction_date?.message}
        required
        {...register('transaction_date')}
      />

      {/* Notes */}
      <div>
        <label className="label-base">Catatan</label>
        <textarea
          rows={2}
          placeholder="Opsional..."
          className="input-base resize-none"
          {...register('notes')}
        />
        {errors.notes && <p className="mt-1.5 text-xs text-red-500">{errors.notes.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {defaultValues?.id ? 'Simpan Perubahan' : 'Tambah Transaksi'}
        </Button>
      </div>
    </form>
  )
}
