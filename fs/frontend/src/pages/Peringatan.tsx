import { ShieldCheck, TrendingUp } from "lucide-react";
import quokkaImg from "../assets/quokka-alert.png";
import MoneyLeakCard from "../components/MoneyLeakCard";
import SectionHeader from "../components/SectionHeader";
import WarningCard from "../components/WarningCard";
import { moneyLeaks, warnings } from "../services/mockData";

export default function Peringatan() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-yellow-bg)] px-5 py-6 shadow-[0_18px_60px_rgba(77,62,38,0.08)] sm:px-8 lg:flex lg:items-center lg:gap-8 lg:px-12 lg:py-10">
        <img
          src={quokkaImg}
          alt="Quokka financial coach"
          className="mx-auto h-32 w-32 rounded-full object-cover object-top shadow-[0_16px_40px_rgba(242,140,106,0.18)] ring-8 ring-white lg:mx-0 lg:h-40 lg:w-40"
        />
        <div className="mt-6 text-center lg:mt-0 lg:text-left">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal-ink)]">
            Smart warning
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--color-brand)] sm:text-4xl">
            Halo! Ada yang perlu kita cek.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
            Saya melihat beberapa tren pengeluaran bulan ini. Yuk, cek Peringatan Pintar dan Deteksi Kebocoran agar tabunganmu tetap aman tanpa panik.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Peringatan Pintar"
          title="Sinyal yang perlu diperhatikan"
          description="Tidak semua peringatan berarti buruk. Beberapa hanya butuh konfirmasi agar catatanmu tetap rapi."
          action={<TrendingUp className="hidden h-7 w-7 text-[var(--color-salmon-dark)] sm:block" />}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {warnings.map((warning) => (
            <WarningCard key={warning.id} warning={warning} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Money Leak Detection"
          title="Deteksi Kebocoran"
          description="Fitur unggulan SpendQ untuk menemukan biaya kecil yang diam-diam menggerus budget."
          action={<ShieldCheck className="hidden h-7 w-7 text-[var(--color-teal-ink)] sm:block" />}
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {moneyLeaks.map((leak) => (
            <MoneyLeakCard key={leak.id} leak={leak} />
          ))}
        </div>
      </section>
    </div>
  );
}
