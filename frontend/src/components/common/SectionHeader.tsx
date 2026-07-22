export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="mb-1 text-[16px] font-medium text-muted">{eyebrow}</p> : null}
        <h1 className="text-[28px] font-bold leading-tight text-text">{title}</h1>
      </div>
      {action}
    </div>
  );
}
