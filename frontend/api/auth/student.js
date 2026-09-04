import { requireRole, createOrUpdateStudentUser } from "../_utils.js";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await requireRole(req, ["admin", "admission"]);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const result = await createOrUpdateStudentUser(body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to create student auth user.",
    });
  }
}
