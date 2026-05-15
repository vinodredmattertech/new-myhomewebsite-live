import { create } from "zustand";

export const useProjectStore = create((set) => ({
  Projectdata: [],
  loading: false,
  error: null,
  fetchProjectData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/hello");
      const data = await res.json().catch(() => ({}));
      set({ Projectdata: Array.isArray(data?.projects) ? data.projects : [], loading: false });
    } catch (e) {
      set({ error: e?.message || "Request failed", loading: false });
    }
  },
}));

export default useProjectStore;
