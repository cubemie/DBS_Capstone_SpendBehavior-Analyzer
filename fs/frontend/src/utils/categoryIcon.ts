import {
  Banknote,
  BookOpen,
  Car,
  CreditCard,
  Film,
  HeartPulse,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Array<[string[], LucideIcon]> = [
  [["makan", "food"], UtensilsCrossed],
  [["transport", "kend"], Car],
  [["belanja", "shop"], ShoppingBag],
  [["gaji", "income", "pendapatan"], Banknote],
  [["hiburan", "entertain"], CreditCard],
  [["kesehatan"], HeartPulse],
  [["pendidikan"], BookOpen],
  [["tabungan"], Wallet],
  [["film"], Film],
];

export function getCategoryIcon(name: string, fallback: LucideIcon = Wallet): LucideIcon {
  const normalizedName = name.toLowerCase();
  const match = CATEGORY_ICONS.find(([aliases]) =>
    aliases.some((alias) => normalizedName.includes(alias)),
  );

  return match?.[1] ?? fallback;
}

export function getCategoryPickerIcon(name: string): LucideIcon {
  return getCategoryIcon(name, Plus);
}
