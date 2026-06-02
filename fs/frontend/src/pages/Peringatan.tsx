import { ShieldCheck, TrendingUp } from "lucide-react";
import quokkaImg from "../assets/quokka-alert.png";
import Card from "../components/Card";
import MoneyLeakCard from "../components/MoneyLeakCard";
import PageHeader from "../components/PageHeader";
import WarningCard from "../components/WarningCard";
import { moneyLeaks, warnings } from "../services/mockData";

export default function Peringatan() {
  return (
    <div className="space-y-7">
      <PageHeader title="Peringatan" description="Cek sinyal yang butuh perhatian." />

      <Card className="!bg-[var(--color-yellow-bg)]">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <img
            src={quokkaImg}
            alt="Mascot BUDU"
            className="h-24 w-24 rounded-full object-cover object-top shadow-[0_16px_40px_rgba(242,140,106,0.18)] ring-4 ring-white"
          />
          <div>
            <h2 className="text-2xl font-black text-[var(--color-brand)]">Tenang, ini cuma sinyal.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              BUDU bantu kamu cek pengeluaran yang mulai naik atau bocor kecil.
            </p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]">
            <TrendingUp className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Peringatan Pintar</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {warnings.map((warning) => (
            <WarningCard key={warning.id} warning={warning} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Deteksi Kebocoran</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {moneyLeaks.map((leak) => (
            <MoneyLeakCard key={leak.id} leak={leak} />
          ))}
        </div>
      </section>
    </div>
  );
}
