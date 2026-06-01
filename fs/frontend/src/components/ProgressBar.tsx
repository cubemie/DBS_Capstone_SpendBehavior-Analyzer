import { cn } from "../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

function ProgressBar({
  value,
  max = 100,
  color = "var(--color-teal-dark)",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-[var(--color-track)]", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default ProgressBar;
