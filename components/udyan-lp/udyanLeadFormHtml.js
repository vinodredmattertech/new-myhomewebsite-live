import { lpLeadFormHtml } from "@/components/lp/lpLeadFormHtml";

/**
 * Native Udyan LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindUdyanCrmForm on submit.
 */
export function udyanLeadFormHtml(formSource = "My Home Udyan LP") {
  return lpLeadFormHtml({ formSource, prefix: "udyan" });
}
