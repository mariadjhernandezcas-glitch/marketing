"use server";

import { redirect } from "next/navigation";
import { getTicketRepository } from "@/lib/repositories";
import type { ImpactArea, RequesterArea, Urgency, Workstream } from "@/types/ticket";

export async function createTicketAction(clientId: string, formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const requester = String(formData.get("requester") ?? "").trim();
  const area = String(formData.get("area") ?? "") as RequesterArea;
  const description = String(formData.get("description") ?? "").trim();
  const workstream = String(formData.get("workstream") ?? "") as Workstream;
  const impact = String(formData.get("impact") ?? "") as ImpactArea;
  const urgency = String(formData.get("urgency") ?? "") as Urgency;
  const requestedDate = String(formData.get("requestedDate") ?? "") || undefined;
  const evidenceUrl = String(formData.get("evidenceUrl") ?? "") || undefined;

  if (!title || !requester || !area || !description || !workstream || !impact || !urgency) {
    throw new Error("Faltan campos obligatorios en la solicitud.");
  }

  const repository = getTicketRepository();
  const ticket = await repository.create(clientId, {
    title,
    requester,
    area,
    description,
    workstream,
    impact,
    urgency,
    requestedDate,
    evidenceUrl,
  });

  redirect(`/client/${clientId}/solicitudes/${ticket.id}?created=1`);
}
