import { LayoutDashboard, ListChecks, PlusCircle, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: (clientId: string) => string;
  icon: LucideIcon;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: (clientId) => `/client/${clientId}`,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Solicitudes",
    href: (clientId) => `/client/${clientId}/solicitudes`,
    icon: ListChecks,
  },
  {
    label: "Nueva solicitud",
    href: (clientId) => `/client/${clientId}/solicitudes/nueva`,
    icon: PlusCircle,
  },
  {
    label: "Sprints",
    href: (clientId) => `/client/${clientId}/sprints`,
    icon: Rocket,
  },
];
