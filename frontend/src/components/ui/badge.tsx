import { cn } from "@/utils/helpers";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}

const tones = {
  neutral: "border-border bg-surface text-muted",
  success: "border-border bg-surface text-muted",
  warning: "border-border bg-surface text-muted",
  danger: "border-border bg-surface text-muted",
  accent: "border-border bg-surface text-muted",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-[14px] font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
