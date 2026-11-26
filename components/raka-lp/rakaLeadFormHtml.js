import { lpLeadFormHtml } from "@/components/lp/lpLeadFormHtml";

/**
 * Native Raka LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindRakaCrmForm on submit.
 */
export function rakaLeadFormHtml(formSource = "My Home Raka LP") {
  return lpLeadFormHtml({ formSource, prefix: "raka" });
}
