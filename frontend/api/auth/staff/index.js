import { requireRole, createOrUpdateStaffUser, deactivateStaffUser } from "../../_utils.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await requireRole(req, ["admin"]);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    if (req.method === "POST") {
      const result = await createOrUpdateStaffUser(body);
      return res.status(200).json({ success: true, account: result });
    }

    if (req.method === "DELETE") {
      const result = await deactivateStaffUser(body);
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to process staff request.",
    });
  }
}
