import { forwardRef } from "react";
import { cn } from "@/utils/helpers";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-pro hover:bg-focus focus-visible:ring-focus",
  secondary: "bg-card text-text hover:bg-hover border border-border shadow-pro",
  ghost: "bg-transparent text-muted hover:bg-hover hover:text-text",
  danger: "bg-card text-text hover:bg-hover border border-border shadow-pro focus-visible:ring-focus",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5 text-[16px]",
  md: "h-12 px-5 text-[16px]",
  icon: "h-11 w-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none transition duration-200 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        "soft-pressed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
