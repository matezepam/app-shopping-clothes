import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { PageLoader } from "./PageLoader";
import type { UserRole } from "../../types/store";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, loadingAuth } = useStore();
  const location = useLocation();

  if (loadingAuth) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
