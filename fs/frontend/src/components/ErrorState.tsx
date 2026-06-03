import Button from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)] text-2xl">
        ⚠
      </span>
      <p className="font-bold text-[var(--color-text-primary)]">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
