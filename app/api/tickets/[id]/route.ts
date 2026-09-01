import { NextRequest, NextResponse } from "next/server";
import { getStageHistory, getTicketById } from "@/lib/tickets";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
  }

  const history = await getStageHistory(id);
  return NextResponse.json({ ticket, history });
}
