import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dotClassName?: string;
}

export function Badge({ children, className, dotClassName }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium leading-none",
        className
      )}
    >
      {dotClassName ? <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} /> : null}
      {children}
    </span>
  );
}
