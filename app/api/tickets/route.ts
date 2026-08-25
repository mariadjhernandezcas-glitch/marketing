import { NextRequest, NextResponse } from "next/server";
import { createTicket, listTickets } from "@/lib/tickets";
import { sendTicketCreatedEmail } from "@/lib/mailer";
import { PRIORIDADES, TIPOS } from "@/lib/types";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json({ tickets });
}

const TIPO_KEYS = TIPOS.map((t) => t.key);
const PRIORIDAD_KEYS = PRIORIDADES.map((p) => p.key);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const titulo = String(body.titulo || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  const tipo = String(body.tipo || "");
  const prioridad = String(body.prioridad || "media");
  const solicitante_nombre = String(body.solicitante_nombre || "").trim();
  const solicitante_email = String(body.solicitante_email || "").trim();
  const area = body.area ? String(body.area).trim() : null;

  const errors: string[] = [];
  if (!titulo) errors.push("El título es obligatorio.");
  if (!descripcion) errors.push("La descripción es obligatoria.");
  if (!TIPO_KEYS.includes(tipo as never)) errors.push("El tipo de solicitud no es válido.");
  if (!PRIORIDAD_KEYS.includes(prioridad as never)) errors.push("La prioridad no es válida.");
  if (!solicitante_nombre) errors.push("El nombre del solicitante es obligatorio.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(solicitante_email)) {
    errors.push("El correo del solicitante no es válido.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const ticket = await createTicket({
    titulo,
    descripcion,
    tipo: tipo as never,
    prioridad: prioridad as never,
    solicitante_nombre,
    solicitante_email,
    area,
  });

  sendTicketCreatedEmail(ticket).catch((err) => console.error("Error enviando correo:", err));

  return NextResponse.json({ ticket }, { status: 201 });
}
