import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (typeof window === 'undefined') return;
    const { user } = useAuth.getState();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
