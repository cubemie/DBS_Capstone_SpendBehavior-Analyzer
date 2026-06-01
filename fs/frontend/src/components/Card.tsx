import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

function Card({
  className,
  padded = true,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[1.35rem] border border-(--color-border) bg-white shadow-[0_14px_40px_rgba(77,62,38,0.06)]",
        padded && "p-5 sm:p-6",
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(77,62,38,0.1)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
