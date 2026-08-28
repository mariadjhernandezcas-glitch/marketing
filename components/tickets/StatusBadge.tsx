import { STATUS_CONFIG } from "@/config/status";
import type { TicketStatus } from "@/types/ticket";
import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={config.badgeClass} dotClassName={config.dotClass}>
      {config.label}
    </Badge>
  );
}
