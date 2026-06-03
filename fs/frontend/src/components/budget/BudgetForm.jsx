import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/api/categoryApi'
import { budgetSchema } from '@/utils/validators'
import { getCurrentMonthYear } from '@/utils/formatDate'
import { MONTHS } from '@/utils/constants'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

const { month: currentMonth, year: currentYear } = getCurrentMonthYear()

const monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }))
const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - 2 + i
  return { value: y, label: String(y) }
})

export default function BudgetForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ type: 'expense' }),
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesRes?.data?.data || []
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) reset({ month: currentMonth, year: currentYear, ...defaultValues })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            disabled={!!defaultValues?.id}
            {...field}
          />
        )}
      />

      <Input
        label="Nominal Budget"
        type="number"
        placeholder="0"
        prefix={<span className="text-gray-400 text-sm font-medium">Rp</span>}
        error={errors.amount?.message}
        required
        min={1}
        {...register('amount', { valueAsNumber: true })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="month"
          control={control}
          render={({ field }) => (
            <Select
              label="Bulan"
              options={monthOptions}
              error={errors.month?.message}
              required
              disabled={!!defaultValues?.id}
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <Select
              label="Tahun"
              options={yearOptions}
              error={errors.year?.message}
              required
              disabled={!!defaultValues?.id}
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {defaultValues?.id ? 'Simpan Perubahan' : 'Set Budget'}
        </Button>
      </div>
    </form>
  )
}
