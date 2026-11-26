import { lpLeadFormHtml } from "@/components/lp/lpLeadFormHtml";

/**
 * Native Apas LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindApasCrmForm on submit.
 */
export function apasLeadFormHtml(formSource = "My Home Apas LP") {
  return lpLeadFormHtml({ formSource, prefix: "apas" });
}