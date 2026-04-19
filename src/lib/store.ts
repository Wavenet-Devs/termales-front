import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import type { AdminUser } from "./types";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const { user, token } = await api.auth.login(email, password);
        const normalized = { ...user, role: user.role.toLowerCase() as AdminUser["role"] };
        set({ user: normalized, token });
        return normalized;
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "tn-auth" },
  ),
);
