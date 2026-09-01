import nodemailer from "nodemailer";
import { stageLabel } from "./types";
import type { Ticket } from "./types";

let cachedTransporter: nodemailer.Transporter | null | undefined;

function getTransporter(): nodemailer.Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return cachedTransporter;
}

function fromAddress(): string {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "tickets@hommik.local";
}

async function send(to: string | string[], subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      `[mailer] SMTP no configurado — se omite el envío. Para: ${
        Array.isArray(to) ? to.join(", ") : to
      } | Asunto: ${subject}`
    );
    return { sent: false as const };
  }

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject,
      html,
    });
    return { sent: true as const };
  } catch (err) {
    console.error("[mailer] Error enviando correo:", err);
    return { sent: false as const, error: String(err) };
  }
}

function ticketFooter(ticket: Ticket) {
  const base = process.env.APP_BASE_URL || "";
  const link = base ? `${base}/tickets/${ticket.id}` : `/tickets/${ticket.id}`;
  return `<p style="margin-top:24px;font-size:12px;color:#64748b">Folio ${ticket.folio} · <a href="${link}">Ver ticket</a></p>`;
}

export async function sendTicketCreatedEmail(ticket: Ticket) {
  const teamEmail = process.env.TEAM_NOTIFY_EMAIL;
  const recipients = [ticket.solicitante_email, teamEmail].filter(Boolean) as string[];
  if (recipients.length === 0) return;

  const html = `
    <div style="font-family:sans-serif;line-height:1.5">
      <h2>Nuevo ticket recibido: ${ticket.folio}</h2>
      <p><strong>${ticket.titulo}</strong></p>
      <p>${ticket.descripcion.replace(/\n/g, "<br/>")}</p>
      <p>Estado actual: <strong>${stageLabel(ticket.stage)}</strong></p>
      <p>Solicitante: ${ticket.solicitante_nombre} (${ticket.solicitante_email})</p>
      ${ticketFooter(ticket)}
    </div>
  `;

  await send(recipients, `[${ticket.folio}] Ticket recibido — ${ticket.titulo}`, html);
}

export async function sendStageChangedEmail(
  ticket: Ticket,
  fromStage: string | null,
  comment?: string | null
) {
  const recipients = [ticket.solicitante_email].filter(Boolean) as string[];
  const teamEmail = process.env.TEAM_NOTIFY_EMAIL;
  if (teamEmail) recipients.push(teamEmail);
  if (recipients.length === 0) return;

  const html = `
    <div style="font-family:sans-serif;line-height:1.5">
      <h2>Actualización de ticket ${ticket.folio}</h2>
      <p><strong>${ticket.titulo}</strong></p>
      <p>
        ${fromStage ? `De <strong>${stageLabel(fromStage)}</strong> a` : "Estado:"}
        <strong>${stageLabel(ticket.stage)}</strong>
      </p>
      ${comment ? `<p>Comentario: ${comment.replace(/\n/g, "<br/>")}</p>` : ""}
      ${ticketFooter(ticket)}
    </div>
  `;

  await send(
    recipients,
    `[${ticket.folio}] Actualización de estado — ${stageLabel(ticket.stage)}`,
    html
  );
}
