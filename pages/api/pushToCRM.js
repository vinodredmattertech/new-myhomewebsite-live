// import axios from "axios";

/**
 * Server-side API route for the Corelto Lead Quest CRM push.
 * POST /api/pushToCRM
 *
 * CURRENTLY DISABLED — leads are captured by Strapi (`/api/leads`) directly
 * from the form's `submitLead()` call. This route is kept as a no-op so the
 * existing form code paths (which key their success state off `crmRes.ok`)
 * continue to work without changes. When you're ready to re-enable the CRM
 * integration, uncomment the block below and set the env vars:
 *   CORELTO_COMPANY_ID
 *   CORELTO_API_URL
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(200).json({
    message: "CRM push disabled — lead captured via Strapi",
    data: null,
  });

  /* ---------------------------------------------------------------------
   * Original CRM push — uncomment + restore the `import axios` at the top
   * when you're ready to forward leads to Corelto again.
   * ---------------------------------------------------------------------
   *
   * try {
   *   const {
   *     name,
   *     email,
   *     mobile,
   *     project,
   *     source = "Website",
   *     sub_source = "",
   *     comment = "",
   *   } = req.body || {};
   *
   *   // Validate mandatory fields
   *   if (!name || !email || !mobile || !project) {
   *     return res.status(400).json({
   *       message: "Missing required fields: name, email, mobile, project",
   *     });
   *   }
   *
   *   const companyId = process.env.CORELTO_COMPANY_ID;
   *   const baseUrl = process.env.CORELTO_API_URL;
   *
   *   if (!companyId || !baseUrl) {
   *     console.error("Corelto CRM environment variables not configured");
   *     return res.status(500).json({ message: "CRM configuration missing" });
   *   }
   *
   *   const crmEndpoint = `${baseUrl}/${companyId}/leads-all`;
   *
   *   const crmPayload = {
   *     name,
   *     email,
   *     mobile: String(mobile),
   *     project,
   *     source,
   *     ...(sub_source && { sub_source }),
   *     ...(comment && { comment }),
   *   };
   *
   *   const response = await axios.post(crmEndpoint, crmPayload, {
   *     headers: { "Content-Type": "application/json" },
   *     timeout: 10000,
   *   });
   *
   *   return res.status(201).json({
   *     message: "Lead pushed to CRM successfully",
   *     data: response.data,
   *   });
   * } catch (error) {
   *   console.error(
   *     "CRM Push Error:",
   *     error?.response?.data || error.message
   *   );
   *
   *   const status = error?.response?.status || 500;
   *   return res.status(status).json({
   *     message: "Failed to push lead to CRM",
   *     error: error?.response?.data || error.message,
   *   });
   * }
   */
}
