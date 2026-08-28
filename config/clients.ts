import type { ClientTheme } from "@/types/client";

/**
 * Registro de clientes del portal. COSMO Schools es el único cliente activo
 * hoy; para incorporar un cliente nuevo de Triario, agrega una entrada aquí
 * (y su set de datos mock en data/) — no se requiere tocar rutas ni componentes,
 * porque todas las páginas viven bajo /client/[clientId].
 */
export const CLIENTS: Record<string, ClientTheme> = {
  cosmo: {
    id: "cosmo",
    name: "COSMO Schools",
    shortName: "COSMO",
    logoInitials: "CS",
    primaryColor: "#1d4ed8",
    secondaryColor: "#0f172a",
  },
};

export const DEFAULT_CLIENT_ID = "cosmo";

export function getClientTheme(clientId: string): ClientTheme | undefined {
  return CLIENTS[clientId];
}

export function listClients(): ClientTheme[] {
  return Object.values(CLIENTS);
}
