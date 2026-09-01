import { formatDate } from "@/lib/format";

interface ActivityItem {
  id: string;
  title: string | null;
  type: string | null;
  status: string | null;
  contact_name: string | null;
  start_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completada",
  discarded: "Descartada",
};

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-400">Sin gestiones registradas todavía.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">{activity.title || activity.type}</p>
            <p className="text-xs text-slate-500">
              {activity.contact_name || "Sin contacto"} · {activity.type || "actividad"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{formatDate(activity.start_at)}</p>
            <p className="text-xs text-slate-400">
              {STATUS_LABEL[activity.status ?? ""] ?? activity.status ?? "—"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
