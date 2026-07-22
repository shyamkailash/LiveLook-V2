import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
  headerAction,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-8 backdrop-blur">
      <div className={cn("w-full max-w-5xl rounded-lg border border-border bg-card shadow-pro", className)}>
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <h2 className="truncate text-[30px] font-semibold leading-tight">{title}</h2>
          <div className="flex shrink-0 items-center gap-4">
            {headerAction}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
