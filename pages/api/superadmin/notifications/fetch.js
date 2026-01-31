import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pgPool.query(`
      SELECT
  n.*,
  CASE
    WHEN n.mess_id IS NOT NULL THEN m.name
    WHEN jsonb_array_length(n.metadata->'mess_ids') > 0 THEN
      (
        SELECT string_agg(ms.name, ', ')
        FROM messes ms
        WHERE ms.id = ANY (
          SELECT jsonb_array_elements_text(n.metadata->'mess_ids')::int
        )
      )
    ELSE 'All'
  END AS mess_name
FROM superadmin_notifications n
LEFT JOIN messes m ON m.id = n.mess_id
ORDER BY n.created_at DESC
LIMIT 50;

    `);

    res.status(200).json({ notifications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
