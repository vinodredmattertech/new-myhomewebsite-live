import { lpLeadFormHtml } from "@/components/lp/lpLeadFormHtml";

/**
 * Native Avali LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindAvaliCrmForm on submit.
 */
export function avaliLeadFormHtml(formSource = "My Home Avali LP") {
  return lpLeadFormHtml({ formSource, prefix: "avali" });
}
