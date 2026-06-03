import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { categoryApi } from '@/api/categoryApi'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

export default function TransactionFilter({ filters, onChange, onReset }) {
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesRes?.data?.data || []

  const categoryOptions = [
    { value: '', label: 'Semua Kategori' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  const typeOptions = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
  ]

  const hasActiveFilters =
    filters.search || filters.type !== 'all' || filters.category_id || filters.from_date || filters.to_date

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <Input
            placeholder="Cari deskripsi..."
            prefix={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        <Select
          options={typeOptions}
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
        />

        <Select
          options={categoryOptions}
          value={filters.category_id || ''}
          onChange={(e) => onChange('category_id', e.target.value || null)}
          placeholder="Semua Kategori"
        />

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.from_date || ''}
            onChange={(e) => onChange('from_date', e.target.value || null)}
            placeholder="Dari"
            className="text-xs"
          />
          <Input
            type="date"
            value={filters.to_date || ''}
            onChange={(e) => onChange('to_date', e.target.value || null)}
            placeholder="Sampai"
            className="text-xs"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-3 h-3" />}
            onClick={onReset}
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  )
}
