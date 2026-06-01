import Card from "./Card";
import { cn } from "../utils/cn";
import type { Insight } from "../types/models";

interface InsightCardProps {
  insight: Insight;
}

function InsightCard({ insight }: InsightCardProps) {
  const Icon = insight.icon;
  const toneClass = {
    teal: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
    coral: "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]",
    yellow: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-ink)]",
    neutral: "bg-[var(--color-soft)] text-[var(--color-text-secondary)]",
  }[insight.tone];

  return (
    <Card className="flex items-start gap-4" padded={false}>
      <div className="flex w-full gap-4 p-4">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-[var(--color-text-primary)]">{insight.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {insight.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default InsightCard;
