import { redirect } from "next/navigation";
import { DEFAULT_CLIENT_ID } from "@/config/clients";

export default function RootPage() {
  redirect(`/client/${DEFAULT_CLIENT_ID}`);
}
