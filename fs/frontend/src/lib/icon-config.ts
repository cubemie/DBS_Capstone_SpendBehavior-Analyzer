// Icon configuration and utilities (non-component exports)
import {
  UtensilsCrossed,
  Landmark,
  Cake,
  Tv,
  DollarSign,
  Trophy,
  RefreshCw,
  ShoppingBag,
  Calendar,
  CreditCard,
  Car,
  Film,
  Pill,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Wallet,
  Plus,
  X,
  Check,
  MoreHorizontal,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  Home,
  Bell,
  MapPin,
  Phone,
  Mail,
  Link2,
  LogOut,
  User,
  Settings,
  Menu,
  Search,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Icon mapping by category
export const categoryIcons: Record<string, LucideIcon> = {
  makanan: UtensilsCrossed,
  makanan_minuman: UtensilsCrossed,
  food: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  
  transport: Car,
  transportation: Car,
  bensin: Car,
  ojek: Car,
  bus: Car,
  
  belanja: ShoppingBag,
  shopping: ShoppingBag,
  retail: ShoppingBag,
  supermarket: ShoppingBag,
  
  hiburan: Film,
  entertainment: Film,
  movie: Film,
  film: Film,
  streaming: Tv,
  
  kesehatan: Pill,
  health: Pill,
  medical: Pill,
  healthcare: Pill,
  
  pendidikan: BookOpen,
  education: BookOpen,
  course: BookOpen,
  
  tabungan: Wallet,
  savings: Wallet,
  deposit: Wallet,
  
  gaji: DollarSign,
  salary: DollarSign,
  income: DollarSign,
  revenue: DollarSign,
  
  bank: Landmark,
  banking: Landmark,
  
  utility: Zap,
  utilities: Zap,
};

// Icon size presets
export const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
};

// Icon color presets
export const iconColors = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  info: "text-cyan-600",
  muted: "text-gray-400",
};

// Reusable icon components
export const Icons = {
  // Navigation
  Menu,
  Home,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  
  // Actions
  Plus,
  X,
  Check,
  RefreshCw,
  Download,
  Upload,
  
  // Direction
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  
  // Utilities
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  
  // Contact
  Phone,
  Mail,
  MapPin,
  Link2,
  
  // Categories
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Health: Pill,
  Education: BookOpen,
  Savings: Wallet,
  Salary: DollarSign,
  Bank: Landmark,
  CreditCard,
  Trophy,
  Tv,
  Cake,
};

// Helper function to get icon by category
export const getIconByCategory = (
  category: string
): LucideIcon => {
  const normalized = category
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  
  return categoryIcons[normalized] || ShoppingBag;
};
