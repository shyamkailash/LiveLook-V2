import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Search({ placeholder = "Search", value, onChange }: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </label>
  );
}
