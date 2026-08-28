import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triario Implementation Portal",
  description: "Seguimiento de solicitudes, implementaciones, bloqueos y entregables.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
