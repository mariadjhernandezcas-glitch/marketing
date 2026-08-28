import { priorityBadgeClass } from "@/config/status";
import { Badge } from "@/components/ui/Badge";

export function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  return <Badge className={priorityBadgeClass(priority)}>{priority ?? "Sin priorizar"}</Badge>;
}
