import { listTickets } from "@/lib/tickets";
import { KanbanBoard } from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tickets = await listTickets();
  return <KanbanBoard tickets={tickets} />;
}
