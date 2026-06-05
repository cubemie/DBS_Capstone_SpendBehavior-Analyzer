import * as z from 'zod'

export const dateRangeSchema = z
  .object({
    from: z.iso.datetime({ offset: true }).optional(),
    to: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    (value) => {
      if (!value.from || !value.to) {
        return true
      }

      return new Date(value.from).getTime() <= new Date(value.to).getTime()
    },
    {
      message: 'Tanggal awal tidak boleh setelah tanggal akhir',
      path: ['from'],
    },
  )

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
