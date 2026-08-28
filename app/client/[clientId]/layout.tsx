import { notFound } from "next/navigation";
import { getClientTheme } from "@/config/clients";
import { AppShell } from "@/components/layout/AppShell";

export default function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) {
    notFound();
  }

  return (
    <AppShell clientId={params.clientId} clientTheme={clientTheme}>
      {children}
    </AppShell>
  );
}
