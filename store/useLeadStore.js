import { create } from "zustand";
import { submitLead } from "@/lib/strapi";
import { pushToCRM } from "@/lib/crm";

/**
 * Central submit pipeline for every website lead form that uses the store
 * (enquire modal, project inquiry, NRI flow). Pushes to the CRM and to
 * Strapi's Lead collection in parallel — UI success still keys off the CRM
 * response so behaviour matches the pre-Strapi state.
 *
 * Goes through lib/crm.js so callers here get the same UTM attribution as
 * the forms that call pushToCRM() directly. Pass `projectSlug` in the
 * payload to have the push resolve that project's Sell.Do ids.
 */
export const useLeadStore = create((set) => ({
  loading: false,
  error: null,
  success: false,
  postWebsiteLead: async (payload) => {
    set({ loading: true, error: null, success: false });
    try {
      const [crmRes] = await Promise.all([
        pushToCRM(payload),
        submitLead(payload),
      ]);
      const ok = crmRes.ok;
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
