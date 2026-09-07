import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--line)] bg-[var(--panel)]/90 shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
        className,
      )}
      {...props}
    />
  );
}
