import { listTickets } from "@/lib/tickets";
import { KanbanBoard } from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const tickets = listTickets();
  return <KanbanBoard tickets={tickets} />;
}
