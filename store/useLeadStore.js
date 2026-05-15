import { create } from "zustand";

export const useLeadStore = create((set) => ({
  loading: false,
  error: null,
  success: false,
  postWebsiteLead: async (payload) => {
    set({ loading: true, error: null, success: false });
    try {
      const res = await fetch("/api/pushToCRM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ok = res.ok;
      set({ loading: false, success: ok, error: ok ? null : "Failed" });
      return ok;
    } catch (e) {
      set({ loading: false, error: e?.message || "Request failed", success: false });
      return false;
    }
  },
  resetStatus: () => set({ loading: false, error: null, success: false }),
}));

export default useLeadStore;
