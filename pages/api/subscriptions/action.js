import { pgPool } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { messId, action, plan, days } = req.body;

  if (action === "activate") {
    await pgPool.query(
      `
      UPDATE messes
      SET
        subscription_status='active',
        subscription_plan=$1,
        subscription_start_date=CURRENT_DATE,
        subscription_end_date=CURRENT_DATE + INTERVAL '30 days'
      WHERE id=$2
      `,
      [plan || "monthly", messId]
    );
  }

  if (action === "extend") {
    await pgPool.query(
      `
      UPDATE messes
      SET subscription_end_date = subscription_end_date + ($1 || ' days')::INTERVAL
      WHERE id=$2
      `,
      [days || 30, messId]
    );
  }

  if (action === "expire") {
    await pgPool.query(
      `
      UPDATE messes
      SET subscription_status='expired'
      WHERE id=$1
      `,
      [messId]
    );
  }

  res.json({ message: "Subscription updated" });
}
