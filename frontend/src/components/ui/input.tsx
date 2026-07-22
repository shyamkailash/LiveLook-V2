import { forwardRef } from "react";
import { cn } from "@/utils/helpers";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-card px-4 text-[16px] text-text shadow-inset outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
