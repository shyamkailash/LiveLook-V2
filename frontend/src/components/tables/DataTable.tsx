import { cn } from "@/utils/helpers";

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-divider bg-card", className)}>
      <table className="w-full border-collapse text-left text-[15px]">
        <thead className="sticky top-0 bg-secondary text-[14px] text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">{children}</tbody>
      </table>
    </div>
  );
}
