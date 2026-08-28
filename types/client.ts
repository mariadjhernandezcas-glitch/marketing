/**
 * Un "cliente" es un tenant del portal (ej. COSMO Schools). La arquitectura
 * está preparada para más de uno: agregar un cliente nuevo es agregar una
 * entrada en config/clients.ts + datos mock, sin tocar componentes ni rutas.
 */
export interface ClientTheme {
  id: string;
  name: string;
  shortName: string;
  /** Iniciales o letra usadas cuando no hay logo/imagen (evita depender de assets externos). */
  logoInitials: string;
  primaryColor: string;
  secondaryColor: string;
}
