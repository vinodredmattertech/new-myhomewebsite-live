import axios from "axios";

/**
 * Server-side API route to push leads to Corelto Lead Quest CRM.
 * POST /api/pushToCRM
 *
 * Expected body: { name, email, mobile, project, source, sub_source, comment }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      mobile,
      project,
      source = "Website",
      sub_source = "",
      comment = "",
    } = req.body || {};

    // Validate mandatory fields
    if (!name || !email || !mobile || !project) {
      return res.status(400).json({
        message: "Missing required fields: name, email, mobile, project",
      });
    }

    const companyId = process.env.CORELTO_COMPANY_ID;
    const baseUrl = process.env.CORELTO_API_URL;

    if (!companyId || !baseUrl) {
      console.error("Corelto CRM environment variables not configured");
      return res.status(500).json({ message: "CRM configuration missing" });
    }

    const crmEndpoint = `${baseUrl}/${companyId}/leads-all`;

    const crmPayload = {
      name,
      email,
      mobile: String(mobile),
      project,
      source,
      ...(sub_source && { sub_source }),
      ...(comment && { comment }),
    };

    const response = await axios.post(crmEndpoint, crmPayload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    return res.status(201).json({
      message: "Lead pushed to CRM successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "CRM Push Error:",
      error?.response?.data || error.message
    );

    const status = error?.response?.status || 500;
    return res.status(status).json({
      message: "Failed to push lead to CRM",
      error: error?.response?.data || error.message,
    });
  }
}
