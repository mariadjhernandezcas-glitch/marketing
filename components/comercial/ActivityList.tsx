import { formatDate } from "@/lib/format";
import { IconCalendar, IconInbox, IconPhone, IconTask, IconUser } from "./icons";

interface ActivityItem {
  id: string;
  title: string | null;
  type: string | null;
  status: string | null;
  contact_name: string | null;
  start_at: string | null;
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-warning-50 text-warning-700" },
  completed: { label: "Completada", className: "bg-success-50 text-success-700" },
  discarded: { label: "Descartada", className: "bg-slate-100 text-slate-500" },
};

const TYPE_ICON: Record<string, typeof IconPhone> = {
  call: IconPhone,
  llamada: IconPhone,
  meeting: IconCalendar,
  reunion: IconCalendar,
  reunión: IconCalendar,
  task: IconTask,
  tarea: IconTask,
};

function activityIcon(type: string | null) {
  const key = (type ?? "").toLowerCase();
  return TYPE_ICON[key] ?? IconUser;
}

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-slate-400">
        <IconInbox className="h-8 w-8 text-slate-300" />
        Sin gestiones registradas todavía.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {activities.map((activity) => {
        const Icon = activityIcon(activity.type);
        const status = STATUS_STYLE[activity.status ?? ""] ?? {
          label: activity.status ?? "—",
          className: "bg-slate-100 text-slate-500",
        };
        return (
          <li
            key={activity.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {activity.title || activity.type || "Actividad"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {activity.contact_name || "Sin contacto"} · {activity.type || "actividad"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">{formatDate(activity.start_at)}</p>
              <span
                className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
