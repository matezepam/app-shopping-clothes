import type { UserRole } from "../types/store";

export const ROLE_PRIORITY: UserRole[] = ["ADMIN", "MODERATOR", "VENDOR", "USER"];

export const ROLE_CONFIG: Record<UserRole, { label: string; description: string; permissions: string[] }> = {
  ADMIN: {
    label: "Administrador",
    description: "Control total de la operación, clientes, reportes y seguridad.",
    permissions: ["Reportes reales", "Usuarios", "Productos", "Inventario", "Pedidos", "Moderación"],
  },
  MODERATOR: {
    label: "Moderador",
    description: "Revisa publicaciones y deja cada decisión registrada.",
    permissions: ["Catálogo interno", "Cola de revisión", "Aprobar", "Observar", "Rechazar", "Historial"],
  },
  VENDOR: {
    label: "Vendedor",
    description: "Gestiona el catálogo y el flujo comercial cotidiano.",
    permissions: ["Productos", "Inventario", "Proveedores", "Pedidos", "Devoluciones", "Categorías"],
  },
  USER: {
    label: "Cliente",
    description: "Compra, contacta a Sprint y consulta sus solicitudes.",
    permissions: ["Catálogo", "Carrito", "WhatsApp", "Seguimiento", "Devoluciones", "Perfil"],
  },
};

export function primaryRole(roles: UserRole[] | undefined): UserRole {
  return ROLE_PRIORITY.find((role) => roles?.includes(role)) ?? "USER";
}

export function hasAnyRole(roles: UserRole[] | undefined, allowed: UserRole[]): boolean {
  return allowed.some((role) => roles?.includes(role));
}
