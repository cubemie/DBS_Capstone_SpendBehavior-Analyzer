import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Car,
  Film,
  HeartPulse,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import SectionHeader from "../components/SectionHeader";
import { cn } from "../utils/cn";
import type { LucideIcon } from "lucide-react";

type TransactionFormType = "pengeluaran" | "pemasukan";

const transactionTypes: TransactionFormType[] = ["pengeluaran", "pemasukan"];

const categories: { icon: LucideIcon; label: string }[] = [
  { icon: UtensilsCrossed, label: "Makanan" },
  { icon: Car, label: "Transportasi" },
  { icon: ShoppingBag, label: "Belanja" },
  { icon: Film, label: "Hiburan" },
  { icon: HeartPulse, label: "Kesehatan" },
  { icon: BookOpen, label: "Pendidikan" },
  { icon: Wallet, label: "Tabungan" },
  { icon: Plus, label: "Lainnya" },
];

export default function TambahTransaksi() {
  const navigate = useNavigate();
  const [type, setType] = useState<TransactionFormType>("pengeluaran");
  const [selectedCategory, setSelectedCategory] = useState("Makanan");
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Catat transaksi"
        title="Tambah Transaksi"
        description="Masukkan transaksi baru sekarang agar analisis SpendQ makin akurat."
        action={
          <Button variant="outline" iconLeft={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
            Kembali
          </Button>
        }
      />

      <Card className="mx-auto max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[1.5rem] bg-[var(--color-soft)] p-5">
            <p className="text-sm font-black text-[var(--color-text-primary)]">Jenis Transaksi</p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1">
              {transactionTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-black capitalize transition",
                    type === item
                      ? item === "pengeluaran"
                        ? "bg-[var(--color-salmon)] text-white"
                        : "bg-[var(--color-teal-dark)] text-white"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-soft)]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-[var(--color-text-muted)]">Jumlah</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-[var(--color-text-muted)]">Rp</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className={cn(
                    "min-w-0 flex-1 bg-transparent text-center text-5xl font-black outline-none placeholder:text-[var(--color-track)]",
                    type === "pengeluaran" ? "text-[var(--color-salmon-dark)]" : "text-[var(--color-teal-ink)]",
                  )}
                />
              </div>
              <div className="mx-auto mt-3 h-1 max-w-xs rounded-full bg-[var(--color-border)]" />
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-black text-[var(--color-text-primary)]">Kategori</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.label;
                  return (
                    <button
                      key={category.label}
                      type="button"
                      onClick={() => setSelectedCategory(category.label)}
                      className={cn(
                        "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-white px-3 text-center text-xs font-black transition",
                        isSelected
                          ? "border-[var(--color-salmon)] text-[var(--color-salmon-dark)] shadow-[0_10px_24px_rgba(242,140,106,0.14)]"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-teal-dark)]",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <Input name="description" label="Deskripsi" placeholder="Contoh: Makan siang bersama tim" />
            <Input name="merchant" label="Merchant" placeholder="Contoh: Kopi Kenangan" />
            <Input name="method" label="Metode Pembayaran" placeholder="Contoh: Kartu Debit / E-Wallet" />
            <Input
              name="date"
              label="Tanggal"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              iconLeft={<Calendar className="h-5 w-5" />}
            />
            <div className="rounded-3xl border border-[var(--color-teal)] bg-[var(--color-teal-bg)] p-5">
              <p className="font-black text-[var(--color-teal-ink)]">Catatan Quokka</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Detail kecil seperti merchant dan metode bayar membantu SpendQ menemukan kebocoran berulang dengan lebih tepat.
              </p>
            </div>
            <Button fullWidth buttonSize="lg">
              Simpan Transaksi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
