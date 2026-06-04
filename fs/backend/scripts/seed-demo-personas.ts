import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../src/db/index.ts'
import { categories } from '../src/db/schemas/categories.ts'
import { predictionResults } from '../src/db/schemas/prediction-results.ts'
import { transactions } from '../src/db/schemas/transactions.ts'
import { users } from '../src/db/schemas/users.ts'
import { analyticsService } from '../src/modules/analytics/analytics-service.ts'
import type { CategoryRecord } from '../src/modules/categories/category-repository.ts'
import { featureEngineeringService } from '../src/modules/feature-engineering/feature-service.ts'
import { predictionService } from '../src/modules/predictions/prediction-service.ts'
import { transactionRepository } from '../src/modules/transactions/transaction-repository.ts'
import {
  userRepository,
  type UserRecord,
} from '../src/modules/users/user-repository.ts'
import { hashPassword } from '../src/utils/password.ts'

const DEMO_PASSWORD = 'DemoPersona123!'
const TIMEZONE = 'Asia/Jakarta'
const SOURCE = 'demo-seed'
const VERIFY_ONLY = process.argv.includes('--verify-only')

type TargetPersona =
  | 'Impulsive Spender'
  | 'Rational Spender'
  | 'Emotional Spender'

type CategorySlug =
  | 'makanan-and-minuman'
  | 'transportasi'
  | 'belanja-online'
  | 'fashion-and-pakaian'
  | 'hiburan'
  | 'kesehatan'
  | 'kesehatan-and-kecantikan'
  | 'pendidikan'
  | 'pulsa-and-data'
  | 'sembako-and-kebutuhan-pokok'
  | 'pemasukan'

type DemoUserDefinition = {
  email: string
  fullName: string
  expectedPersona: TargetPersona
  monthlyIncomeIdr: number
  transactions: DemoTransactionDefinition[]
}

type DemoTransactionDefinition = {
  day: number
  hour: number
  minute: number
  categorySlug: CategorySlug
  title: string
  merchantName: string
  paymentMethod: string
  amountIdr: number
}

type DemoVerificationResult = {
  email: string
  expectedPersona: TargetPersona
  actualPersona: string
  matched: boolean
  confidence: number
  warningCount: number
  moneyLeakCount: number
  transactionCount: number
  totalExpenseIdr: number
  featureSummary: {
    weekendRatio: number
    nightRatio: number
    aboveAvgRatio: number
    impulseScore: number
    spendingCov: number
  }
}

function getCurrentLocalYearMonth(now = new Date()): {
  year: number
  month: number
  day: number
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return { year, month, day }
}

function getCurrentDemoPeriod(now = new Date()): {
  from: string
  to: string
} {
  const { year, month, day } = getCurrentLocalYearMonth(now)
  const from = new Date(Date.UTC(year, month - 1, 1, -7, 0, 0, 0))
  const to = new Date(Date.UTC(year, month - 1, day, 16, 59, 59, 999))

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

function createTransactionDate(
  day: number,
  hour: number,
  minute: number,
): Date {
  const { year, month } = getCurrentLocalYearMonth()

  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0))
}

function createRepeatedTransactions(input: {
  count: number
  startDay: number
  categorySlug: CategorySlug
  title: string
  merchantName: string
  paymentMethod: string
  amountIdr: number
  hour: number
}): DemoTransactionDefinition[] {
  return Array.from({ length: input.count }, (_, index) => ({
    day: input.startDay + (index % 18),
    hour: input.hour + (index % 2),
    minute: (index * 7) % 60,
    categorySlug: input.categorySlug,
    title: input.title,
    merchantName: input.merchantName,
    paymentMethod: input.paymentMethod,
    amountIdr: input.amountIdr + (index % 3) * 5_000,
  }))
}

function createImpulsiveTransactions(): DemoTransactionDefinition[] {
  const categoriesCycle: CategorySlug[] = [
    'belanja-online',
    'makanan-and-minuman',
    'hiburan',
    'fashion-and-pakaian',
    'transportasi',
    'kesehatan-and-kecantikan',
    'pulsa-and-data',
    'pendidikan',
    'kesehatan',
    'sembako-and-kebutuhan-pokok',
  ]
  const highTitles: Record<CategorySlug, string> = {
    'belanja-online': 'Checkout Marketplace Premium',
    'makanan-and-minuman': 'Restoran Dadakan',
    hiburan: 'Hiburan Premium',
    'fashion-and-pakaian': 'Outfit Impulsif',
    transportasi: 'Ride Hailing Premium',
    'kesehatan-and-kecantikan': 'Treatment Kilat',
    'pulsa-and-data': 'Top Up Paket Data',
    pendidikan: 'Kelas Online Dadakan',
    kesehatan: 'Apotek dan Suplemen',
    'sembako-and-kebutuhan-pokok': 'Belanja Minimarket',
    pemasukan: 'Pemasukan',
  }
  const rows: DemoTransactionDefinition[] = []

  for (let group = 0; group < 27; group += 1) {
    const day = 1 + (group % 21)
    rows.push({
      day: 1,
      hour: 21,
      minute: (group * 5) % 60,
      categorySlug: 'makanan-and-minuman',
      title: 'Jajan Kopi dan Snack Malam',
      merchantName: 'Kopi Cepat',
      paymentMethod: 'Gopay',
      amountIdr: 75_000 + (group % 3) * 5_000,
    })

    for (let index = 0; index < 5; index += 1) {
      const categorySlug =
        categoriesCycle[(group * 3 + index) % categoriesCycle.length]!
      rows.push({
        day,
        hour: 13 + (index % 4),
        minute: (group * 11 + index * 7) % 60,
        categorySlug,
        title: highTitles[categorySlug],
        merchantName:
          categorySlug === 'belanja-online'
            ? 'Marketplace Flash Sale'
            : 'Demo Merchant',
        paymentMethod: index % 2 === 0 ? 'Kartu Kredit' : 'Ovo',
        amountIdr: 4_200_000 + (index % 2) * 150_000,
      })
    }

    const spikeCategory = categoriesCycle[group % categoriesCycle.length]!
    rows.push({
      day,
      hour: group % 3 === 0 ? 22 : 15,
      minute: (group * 13) % 60,
      categorySlug: spikeCategory,
      title: `${highTitles[spikeCategory]} Besar`,
      merchantName: 'Flash Deal Premium',
      paymentMethod: 'Kartu Kredit',
      amountIdr: 8_000_000,
    })
  }

  return rows
}

const impulsiveTransactions = createImpulsiveTransactions()

const rationalTransactions: DemoTransactionDefinition[] = [
  ...createRepeatedTransactions({
    count: 9,
    startDay: 2,
    categorySlug: 'sembako-and-kebutuhan-pokok',
    title: 'Belanja Kebutuhan Pokok',
    merchantName: 'Supermarket Hemat',
    paymentMethod: 'Kartu Debit',
    amountIdr: 185_000,
    hour: 10,
  }),
  ...createRepeatedTransactions({
    count: 7,
    startDay: 3,
    categorySlug: 'transportasi',
    title: 'Transportasi Harian',
    merchantName: 'Transit Kota',
    paymentMethod: 'Kartu Debit',
    amountIdr: 45_000,
    hour: 8,
  }),
  ...createRepeatedTransactions({
    count: 5,
    startDay: 5,
    categorySlug: 'makanan-and-minuman',
    title: 'Makan Siang Kantor',
    merchantName: 'Kantin Kantor',
    paymentMethod: 'Kartu Debit',
    amountIdr: 55_000,
    hour: 12,
  }),
  {
    day: 6,
    hour: 11,
    minute: 0,
    categorySlug: 'pulsa-and-data',
    title: 'Paket Data Bulanan',
    merchantName: 'Provider Seluler',
    paymentMethod: 'Kartu Debit',
    amountIdr: 120_000,
  },
  {
    day: 9,
    hour: 14,
    minute: 15,
    categorySlug: 'kesehatan',
    title: 'Vitamin Bulanan',
    merchantName: 'Apotek Sehat',
    paymentMethod: 'Kartu Debit',
    amountIdr: 160_000,
  },
  {
    day: 12,
    hour: 10,
    minute: 20,
    categorySlug: 'pendidikan',
    title: 'Kelas Online',
    merchantName: 'Learning Hub',
    paymentMethod: 'Transfer Bank',
    amountIdr: 210_000,
  },
]

const emotionalTransactions: DemoTransactionDefinition[] = [
  ...createRepeatedTransactions({
    count: 10,
    startDay: 1,
    categorySlug: 'makanan-and-minuman',
    title: 'Comfort Food',
    merchantName: 'Resto Favorit',
    paymentMethod: 'Gopay',
    amountIdr: 115_000,
    hour: 19,
  }),
  ...createRepeatedTransactions({
    count: 8,
    startDay: 4,
    categorySlug: 'kesehatan-and-kecantikan',
    title: 'Self Care',
    merchantName: 'Beauty Studio',
    paymentMethod: 'Ovo',
    amountIdr: 185_000,
    hour: 18,
  }),
  ...createRepeatedTransactions({
    count: 7,
    startDay: 7,
    categorySlug: 'hiburan',
    title: 'Hiburan Setelah Kerja',
    merchantName: 'Cinema Lounge',
    paymentMethod: 'Kartu Debit',
    amountIdr: 145_000,
    hour: 20,
  }),
  ...createRepeatedTransactions({
    count: 5,
    startDay: 10,
    categorySlug: 'fashion-and-pakaian',
    title: 'Mood Booster Outfit',
    merchantName: 'Local Fashion',
    paymentMethod: 'Kartu Debit',
    amountIdr: 245_000,
    hour: 17,
  }),
  {
    day: 5,
    hour: 20,
    minute: 30,
    categorySlug: 'kesehatan-and-kecantikan',
    title: 'Spa dan Treatment',
    merchantName: 'Wellness Spa',
    paymentMethod: 'Kartu Kredit',
    amountIdr: 950_000,
  },
  {
    day: 13,
    hour: 21,
    minute: 10,
    categorySlug: 'belanja-online',
    title: 'Hadiah untuk Diri Sendiri',
    merchantName: 'Lifestyle Store',
    paymentMethod: 'Kartu Kredit',
    amountIdr: 1_450_000,
  },
  {
    day: 20,
    hour: 19,
    minute: 50,
    categorySlug: 'hiburan',
    title: 'Staycation Singkat',
    merchantName: 'City Hotel',
    paymentMethod: 'Kartu Kredit',
    amountIdr: 2_250_000,
  },
]

const demoUsers: DemoUserDefinition[] = [
  {
    email: 'demo.impulsive@example.com',
    fullName: 'Demo Impulsive Spender',
    expectedPersona: 'Impulsive Spender',
    monthlyIncomeIdr: 8_500_000,
    transactions: impulsiveTransactions,
  },
  {
    email: 'demo.rational@example.com',
    fullName: 'Demo Rational Spender',
    expectedPersona: 'Rational Spender',
    monthlyIncomeIdr: 7_500_000,
    transactions: rationalTransactions,
  },
  {
    email: 'demo.emotional@example.com',
    fullName: 'Demo Emotional Spender',
    expectedPersona: 'Emotional Spender',
    monthlyIncomeIdr: 8_000_000,
    transactions: emotionalTransactions,
  },
]

async function findSystemCategoriesBySlug(): Promise<
  Map<string, CategoryRecord>
> {
  const rows = await db
    .select()
    .from(categories)
    .where(and(isNull(categories.userId), eq(categories.isSystem, true)))
  const bySlug = new Map(rows.map((category) => [category.slug, category]))

  return bySlug
}

function getCategory(
  categoriesBySlug: Map<string, CategoryRecord>,
  slug: CategorySlug,
): CategoryRecord {
  const category = categoriesBySlug.get(slug)
  if (!category) {
    throw new Error(`Missing fixed system category: ${slug}`)
  }

  return category
}

async function upsertDemoUser(
  definition: DemoUserDefinition,
): Promise<UserRecord> {
  const passwordHash = await hashPassword(DEMO_PASSWORD)
  const existing = await userRepository.findByEmail(definition.email)

  if (!existing) {
    return await userRepository.create({
      fullName: definition.fullName,
      email: definition.email,
      passwordHash,
    })
  }

  const [updated] = await db
    .update(users)
    .set({
      fullName: definition.fullName,
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id))
    .returning()

  if (!updated) {
    throw new Error(`Failed to update demo user: ${definition.email}`)
  }

  return updated
}

async function deleteDemoRows(userIds: readonly string[]): Promise<void> {
  if (userIds.length === 0) {
    return
  }

  await db
    .delete(predictionResults)
    .where(inArray(predictionResults.userId, Array.from(userIds)))
  await db
    .delete(transactions)
    .where(
      and(
        inArray(transactions.userId, Array.from(userIds)),
        eq(transactions.source, SOURCE),
      ),
    )
}

async function seedIncomeTransaction(input: {
  userId: string
  categoryId: string
  amountIdr: number
}): Promise<void> {
  await transactionRepository.create({
    userId: input.userId,
    categoryId: input.categoryId,
    title: 'Gaji Bulanan',
    merchantName: 'Demo Employer',
    paymentMethod: 'Transfer Bank',
    type: 'income',
    amountIdr: input.amountIdr,
    transactionDate: createTransactionDate(1, 9, 0),
    notes: 'Seed demo persona income',
    source: SOURCE,
  })
}

async function seedExpenseTransactions(input: {
  userId: string
  categoriesBySlug: Map<string, CategoryRecord>
  definitions: readonly DemoTransactionDefinition[]
}): Promise<void> {
  for (const definition of input.definitions) {
    const category = getCategory(
      input.categoriesBySlug,
      definition.categorySlug,
    )

    await transactionRepository.create({
      userId: input.userId,
      categoryId: category.id,
      title: definition.title,
      merchantName: definition.merchantName,
      paymentMethod: definition.paymentMethod,
      type: 'expense',
      amountIdr: definition.amountIdr,
      transactionDate: createTransactionDate(
        definition.day,
        definition.hour,
        definition.minute,
      ),
      notes: 'Seed demo persona expense',
      source: SOURCE,
    })
  }
}

async function seedDemoData(): Promise<UserRecord[]> {
  const categoriesBySlug = await findSystemCategoriesBySlug()
  const incomeCategory = getCategory(categoriesBySlug, 'pemasukan')
  const seededUsers: UserRecord[] = []

  for (const definition of demoUsers) {
    seededUsers.push(await upsertDemoUser(definition))
  }

  await deleteDemoRows(seededUsers.map((user) => user.id))

  for (const [index, definition] of demoUsers.entries()) {
    const user = seededUsers[index]!
    await seedIncomeTransaction({
      userId: user.id,
      categoryId: incomeCategory.id,
      amountIdr: definition.monthlyIncomeIdr,
    })
    await seedExpenseTransactions({
      userId: user.id,
      categoriesBySlug,
      definitions: definition.transactions,
    })
  }

  return seededUsers
}

async function findDemoUsers(): Promise<UserRecord[]> {
  const rows: UserRecord[] = []

  for (const definition of demoUsers) {
    const user = await userRepository.findByEmail(definition.email)
    if (!user) {
      throw new Error(`Demo user not found: ${definition.email}`)
    }

    rows.push(user)
  }

  return rows
}

function getTransactionTotal(
  definitions: readonly DemoTransactionDefinition[],
): number {
  return definitions.reduce(
    (total, transaction) => total + transaction.amountIdr,
    0,
  )
}

async function verifyDemoUsers(
  seededUsers: readonly UserRecord[],
): Promise<DemoVerificationResult[]> {
  const period = getCurrentDemoPeriod()
  const results: DemoVerificationResult[] = []

  for (const [index, definition] of demoUsers.entries()) {
    const user = seededUsers[index]!
    const prediction = await predictionService.createPersonaPrediction(
      user.id,
      {
        from: period.from,
        to: period.to,
        timezone: TIMEZONE,
        force: true,
      },
    )
    const dashboard = await analyticsService.getDashboard(user.id, {
      from: period.from,
      to: period.to,
      timezone: TIMEZONE,
    })
    const featureResult = await featureEngineeringService.buildForUser(
      user.id,
      {
        from: period.from,
        to: period.to,
        timezone: TIMEZONE,
      },
    )

    await db
      .update(users)
      .set({
        persona: prediction.persona,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    results.push({
      email: definition.email,
      expectedPersona: definition.expectedPersona,
      actualPersona: prediction.persona,
      matched: prediction.persona === definition.expectedPersona,
      confidence: prediction.confidence,
      warningCount: prediction.warnings.length,
      moneyLeakCount: dashboard.moneyLeaks.length,
      transactionCount: featureResult.transactionCount,
      totalExpenseIdr: getTransactionTotal(definition.transactions),
      featureSummary: {
        weekendRatio: featureResult.featuresByName.weekend_ratio,
        nightRatio: featureResult.featuresByName.night_ratio,
        aboveAvgRatio: featureResult.featuresByName.above_avg_ratio,
        impulseScore: featureResult.featuresByName.impulse_score,
        spendingCov: featureResult.featuresByName.spending_cov,
      },
    })
  }

  return results
}

function printSummary(results: readonly DemoVerificationResult[]): void {
  console.log('\nDemo persona seed verification')
  console.log(`Password: ${DEMO_PASSWORD}`)
  console.log(`Timezone: ${TIMEZONE}`)
  console.log(
    `Period: ${getCurrentDemoPeriod().from} - ${getCurrentDemoPeriod().to}`,
  )
  console.log('')

  for (const result of results) {
    console.log(`${result.matched ? 'PASS' : 'FAIL'} ${result.email}`)
    console.log(
      `  expected: ${result.expectedPersona}, actual: ${result.actualPersona}`,
    )
    console.log(`  confidence: ${result.confidence.toFixed(4)}`)
    console.log(
      `  warnings: ${result.warningCount}, money leaks: ${result.moneyLeakCount}`,
    )
    console.log(
      `  txns: ${result.transactionCount}, expenses: Rp ${result.totalExpenseIdr.toLocaleString('id-ID')}`,
    )
    console.log(
      `  features: weekend=${result.featureSummary.weekendRatio.toFixed(4)}, night=${result.featureSummary.nightRatio.toFixed(4)}, above_avg=${result.featureSummary.aboveAvgRatio.toFixed(4)}, impulse=${result.featureSummary.impulseScore.toFixed(4)}, cov=${result.featureSummary.spendingCov.toFixed(4)}`,
    )
    console.log('')
  }
}

async function main(): Promise<void> {
  const seededUsers = VERIFY_ONLY ? await findDemoUsers() : await seedDemoData()
  const results = await verifyDemoUsers(seededUsers)

  printSummary(results)

  const failed = results.filter((result) => !result.matched)
  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
