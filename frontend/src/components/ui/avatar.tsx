import { cn } from "@/utils/helpers";

export function Avatar({
  alt = "Profile",
  className,
  initials,
  src,
}: {
  alt?: string;
  className?: string;
  initials: string;
  src?: string | null;
}) {
  return (
    <div
      className={cn(
        "grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent",
        className,
      )}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}
