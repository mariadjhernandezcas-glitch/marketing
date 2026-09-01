import { NextRequest, NextResponse } from "next/server";
import { changeStage, getTicketById } from "@/lib/tickets";
import { sendStageChangedEmail } from "@/lib/mailer";
import { STAGE_KEYS } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const existing = await getTicketById(id);
  if (!existing) {
    return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const toStage = String(body.toStage || "");
  if (!STAGE_KEYS.includes(toStage as never)) {
    return NextResponse.json({ error: "Etapa no válida" }, { status: 400 });
  }

  const changedBy = body.changedBy ? String(body.changedBy).trim() : null;
  const comment = body.comment ? String(body.comment).trim() : null;
  const fromStage = existing.stage;

  const { ticket } = await changeStage(id, { toStage: toStage as never, changedBy, comment });

  sendStageChangedEmail(ticket, fromStage, comment).catch((err) =>
    console.error("Error enviando correo:", err)
  );

  return NextResponse.json({ ticket });
}
