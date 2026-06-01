import {
  AlertTriangle,
  Banknote,
  Bell,
  CalendarClock,
  Car,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Droplets,
  Home,
  Landmark,
  Lightbulb,
  PlusCircle,
  ReceiptText,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import avatarImg from "../assets/avatar-user.png";
import type {
  Budget,
  Insight,
  NavigationItem,
  SpendingCategory,
  Transaction,
  User,
  Warning,
} from "../types/models";

export const currentUser: User = {
  id: "user-1",
  name: "Mutia Rahmawati",
  email: "mutia.spender@example.com",
  phone: "+62 812 3456 7890",
  avatarUrl: avatarImg,
  persona: "Rational Spender",
  membership: "Pro",
};

export const navigationItems: NavigationItem[] = [
  { path: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: Home },
  { path: "/riwayat", label: "Riwayat Transaksi", shortLabel: "Riwayat", icon: ReceiptText },
  { path: "/analisis", label: "Analisis", shortLabel: "Insight", icon: ChartNoAxesColumnIncreasing },
  { path: "/tambah", label: "Tambah Transaksi", shortLabel: "Tambah", icon: PlusCircle, isAction: true },
  { path: "/peringatan", label: "Peringatan", shortLabel: "Alert", icon: AlertTriangle },
  { path: "/profil", label: "Profil Saya", shortLabel: "Profil", icon: Settings },
];

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    title: "Makan Siang Kopi Kenangan",
    merchant: "Kopi Kenangan",
    method: "Kartu Debit",
    category: "Makanan",
    type: "expense",
    amount: -85000,
    date: "2026-05-24T14:30:00+07:00",
    icon: UtensilsCrossed,
    accent: "teal",
  },
  {
    id: "tx-2",
    title: "Isi Bensin Shell",
    merchant: "Shell",
    method: "E-Wallet",
    category: "Transportasi",
    type: "expense",
    amount: -300000,
    date: "2026-05-23T09:15:00+07:00",
    icon: Car,
    accent: "yellow",
  },
  {
    id: "tx-3",
    title: "Gaji Bulanan",
    merchant: "PT Nusantara Digital",
    method: "Transfer Bank",
    category: "Pendapatan",
    type: "income",
    amount: 15000000,
    date: "2026-05-22T10:00:00+07:00",
    icon: Banknote,
    accent: "teal",
  },
  {
    id: "tx-4",
    title: "Belanja Bulanan Supermarket",
    merchant: "FreshMart",
    method: "Kartu Kredit",
    category: "Belanja",
    type: "expense",
    amount: -1250000,
    date: "2026-05-20T19:45:00+07:00",
    icon: ShoppingBag,
    accent: "coral",
  },
  {
    id: "tx-5",
    title: "StreamFlix Subscription",
    merchant: "StreamFlix",
    method: "Virtual Account",
    category: "Hiburan",
    type: "expense",
    amount: -159000,
    date: "2026-05-19T08:00:00+07:00",
    icon: CreditCard,
    accent: "neutral",
  },
];

export const spendingCategories: SpendingCategory[] = [
  { id: "cat-1", name: "Makanan", amount: 3700000, percentage: 45, color: "#F28C6A", icon: UtensilsCrossed },
  { id: "cat-2", name: "Transportasi", amount: 2050000, percentage: 25, color: "#8BDFDD", icon: Car },
  { id: "cat-3", name: "Hiburan", amount: 1230000, percentage: 15, color: "#FFE394", icon: Sparkles },
  { id: "cat-4", name: "Belanja", amount: 1220000, percentage: 15, color: "#B7D6A5", icon: ShoppingBag },
];

export const budgets: Budget[] = [
  { id: "budget-1", category: "Makan & Minum", used: 2450000, limit: 3500000, color: "#8BDFDD" },
  { id: "budget-2", category: "Belanja", used: 1250000, limit: 1100000, color: "#F28C6A" },
  { id: "budget-3", category: "Transportasi", used: 720000, limit: 1500000, color: "#FFE394" },
];

export const warnings: Warning[] = [
  {
    id: "warning-1",
    title: "Pengeluaran Kopi Meningkat",
    description:
      "Kamu sudah jajan kopi 6 kali minggu ini dengan total Rp 320.000. Coba jadwalkan dua hari kopi rumahan agar budget tetap santai.",
    label: "Impulsif",
    severity: "warning",
    actionLabel: "Lihat Detail",
    icon: Coffee,
  },
  {
    id: "warning-2",
    title: "Transaksi Nominal Besar",
    description:
      "Ada pengeluaran sebesar Rp 2.500.000 di TechStore. Jika ini valid, kategorikan sekarang agar analisis bulan ini tetap akurat.",
    label: "Tak Biasa",
    severity: "info",
    actionLabel: "Kategorikan",
    icon: ShoppingBag,
  },
];

export const moneyLeaks: Warning[] = [
  {
    id: "leak-1",
    title: "Langganan Pasif",
    description: "MovieFlix masih menagih Rp 120.000/bulan, padahal belum dipakai selama 2 bulan.",
    label: "Rp 120rb/bln",
    severity: "danger",
    actionLabel: "Batalkan Langganan",
    icon: CalendarClock,
  },
  {
    id: "leak-2",
    title: "Biaya Admin Kecil",
    description: "Top-up nominal kecil membuat biaya admin menumpuk sekitar Rp 45.000 bulan ini.",
    label: "Rp 45rb",
    severity: "warning",
    actionLabel: "Lihat Tips Hemat",
    icon: Wallet,
  },
  {
    id: "leak-3",
    title: "Semua Aman",
    description: "Tidak ada kebocoran lain yang terdeteksi. Budget langganan masih terkendali.",
    label: "Aman",
    severity: "success",
    actionLabel: "Pantau Lagi",
    icon: Droplets,
  },
];

export const insights: Insight[] = [
  {
    id: "insight-1",
    title: "Kurangi Jajan Kopi",
    description: "Anda menghabiskan Rp 800rb minggu ini untuk kopi. Coba buat sendiri dua kali dalam seminggu.",
    tone: "coral",
    icon: Coffee,
  },
  {
    id: "insight-2",
    title: "Peluang Menabung",
    description: "Sisa budget transportasi Rp 300rb bisa dialihkan ke tabungan darurat.",
    tone: "teal",
    icon: Target,
  },
  {
    id: "insight-3",
    title: "Ritme Stabil",
    description: "Pengeluaran rutin sudah lebih mudah diprediksi dibanding bulan lalu.",
    tone: "yellow",
    icon: Lightbulb,
  },
];

export const weeklyTrend = [
  { label: "M1", amount: 3200000 },
  { label: "M2", amount: 5800000 },
  { label: "M3", amount: 3500000 },
  { label: "M4", amount: 8500000 },
];

export const spendingRhythm = [
  { day: "Sen", amount: 420000 },
  { day: "Sel", amount: 630000 },
  { day: "Rab", amount: 380000 },
  { day: "Kam", amount: 720000 },
  { day: "Jum", amount: 540000 },
  { day: "Sab", amount: 920000 },
  { day: "Min", amount: 780000 },
];

export const monthlySummary = {
  balance: 12500000,
  income: 25000000,
  expense: 12500000,
  savingRate: 15,
  leakEstimate: 45000,
};

export const quickActions = [
  { label: "Tambah Catatan", path: "/tambah", icon: PlusCircle },
  { label: "Transfer", path: "/riwayat", icon: Landmark },
  { label: "Cek Budget", path: "/analisis", icon: CircleDollarSign },
  { label: "Peringatan", path: "/peringatan", icon: Bell },
];
