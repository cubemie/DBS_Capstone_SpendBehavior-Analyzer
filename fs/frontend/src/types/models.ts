import type { LucideIcon } from "lucide-react";

export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  persona: string;
  membership: "Free" | "Pro";
}

export interface Transaction {
  id: string;
  title: string;
  merchant: string;
  method: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  icon: LucideIcon;
  accent: "teal" | "coral" | "yellow" | "neutral";
}

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: LucideIcon;
}

export interface Budget {
  id: string;
  category: string;
  used: number;
  limit: number;
  color: string;
}

export interface Warning {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "info" | "warning" | "danger" | "success";
  actionLabel: string;
  icon: LucideIcon;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  tone: "teal" | "coral" | "yellow" | "neutral";
  icon: LucideIcon;
}

export interface NavigationItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  desktopOnly?: boolean;
  isAction?: boolean;
}
