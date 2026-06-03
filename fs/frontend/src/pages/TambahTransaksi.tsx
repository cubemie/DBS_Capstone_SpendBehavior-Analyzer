import { useEffect, useState } from "react";
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
import PageHeader from "../components/PageHeader";
import { cn } from "../utils/cn";
import type { ApiCategory, CategoryKind } from "../types/models";
import { categoryService } from "../services/categoryService";
import { transactionService } from "../services/transactionService";
import { ApiError } from "../services/ApiError";
import type { LucideIcon } from "lucide-react";

// Fallback icon map for categories that come from the API
const ICON_MAP: Record<string, LucideIcon> = {
  makanan: UtensilsCrossed,
  transportasi: Car,
  belanja: ShoppingBag,
  hiburan: Film,
  kesehatan: HeartPulse,
  pendidikan: BookOpen,
  tabungan: Wallet,
};

function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] ?? Plus;
}

export default function TambahTransaksi() {
  const navigate = useNavigate();
  const [type, setType] = useState<CategoryKind>("expense");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories from API on mount
  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
    }).catch(() => {
      // silently ignore — UI will show empty state
    }).finally(() => {
      setIsLoadingCategories(false);
    });
  }, []);

  // Reset category selection whenever type changes
  useEffect(() => {
    setSelectedCategoryId("");
  }, [type]);

  const filteredCategories = categories.filter((c) => c.kind === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCategoryId) {
      setError("Pilih kategori terlebih dahulu.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }

    // Validate category kind matches selected type
    const selectedCat = categories.find((c) => c.id === selectedCategoryId);
    if (selectedCat && selectedCat.kind !== type) {
      setError("Kategori tidak sesuai dengan tipe transaksi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isoDate = date.includes("T")
        ? date
        : `${date}T00:00:00+07:00`;

      await transactionService.createTransaction({
        amountIdr: Number(amount),
        categoryId: selectedCategoryId,
        type,
        notes: note || undefined,
        transactionDate: isoDate,
        title: note || selectedCat?.name || (type === "income" ? "Pemasukan" : "Pengeluaran"),
      });
      navigate("/riwayat", { state: { toast: "Transaksi berhasil disimpan! ✅" } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Transaksi"
        description="Tambah transaksi baru."
        action={
          <Button className="md:hidden" variant="outline" buttonSize="icon" onClick={() => navigate(-1)} aria-label="Kembali">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <Card className="mx-auto max-w-5xl">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-[1.5rem] bg-[var(--color-soft)] p-5">
            <p className="text-sm font-black text-[var(--color-text-primary)]">Jenis Transaksi</p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1">
              {(["expense", "income"] as CategoryKind[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-black capitalize transition",
                    type === item
                      ? item === "expense"
                        ? "bg-[var(--color-salmon)] text-white"
                        : "bg-[var(--color-teal-dark)] text-white"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-soft)]",
                  )}
                >
                  {item === "expense" ? "Pengeluaran" : "Pemasukan"}
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
                  min="1"
                  className={cn(
                    "min-w-0 flex-1 bg-transparent text-center text-5xl font-black outline-none placeholder:text-[var(--color-track)]",
                    type === "expense" ? "text-[var(--color-salmon-dark)]" : "text-[var(--color-teal-ink)]",
                  )}
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-black text-[var(--color-text-primary)]">Kategori</p>
              {isLoadingCategories ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 animate-pulse">
                  <div className="h-20 rounded-2xl bg-white/50 border border-[var(--color-border)]" />
                  <div className="h-20 rounded-2xl bg-white/50 border border-[var(--color-border)]" />
                  <div className="h-20 rounded-2xl bg-white/50 border border-[var(--color-border)]" />
                  <div className="h-20 rounded-2xl bg-white/50 border border-[var(--color-border)]" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Belum ada kategori untuk tipe ini.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {filteredCategories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={cn(
                          "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border bg-white px-3 text-center text-xs font-black transition",
                          isSelected
                            ? "border-[var(--color-salmon)] text-[var(--color-salmon-dark)] shadow-[0_10px_24px_rgba(242,140,106,0.14)]"
                            : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-teal-dark)]",
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <Input
              name="note"
              label="Catatan"
              placeholder="Contoh: Makan siang"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Input
              name="date"
              label="Tanggal"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              iconLeft={<Calendar className="h-5 w-5" />}
            />

            {error && (
              <p className="rounded-xl bg-[var(--color-salmon-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-salmon-dark)]">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth buttonSize="lg" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
