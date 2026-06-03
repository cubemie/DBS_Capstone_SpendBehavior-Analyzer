import {
  AlertTriangle,
  ChartNoAxesColumnIncreasing,
  Home,
  PlusCircle,
  ReceiptText,
  Settings,
} from "lucide-react";
import type { NavigationItem } from "../types/models";

export const navigationItems: NavigationItem[] = [
  { path: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: Home },
  { path: "/riwayat", label: "Riwayat Transaksi", shortLabel: "Riwayat", icon: ReceiptText },
  { path: "/analisis", label: "Analisis", shortLabel: "Insight", icon: ChartNoAxesColumnIncreasing },
  { path: "/tambah", label: "Tambah Transaksi", shortLabel: "Tambah", icon: PlusCircle, isAction: true },
  { path: "/peringatan", label: "Peringatan", shortLabel: "Alert", icon: AlertTriangle },
  { path: "/profil", label: "Profil Saya", shortLabel: "Profil", icon: Settings },
];
