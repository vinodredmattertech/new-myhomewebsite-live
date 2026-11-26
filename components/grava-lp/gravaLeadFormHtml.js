import { lpLeadFormHtml } from "@/components/lp/lpLeadFormHtml";

/**
 * Native Grava LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindGravaCrmForm on submit.
 */
export function gravaLeadFormHtml(formSource = "My Home Grava LP") {
  return lpLeadFormHtml({ formSource, prefix: "grava" });
}
