import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";

export async function recordClick(urlId: number): Promise<void> {
  await pool.query("INSERT INTO clicks (url_id) VALUES (?)", [urlId]);
}

// Returns click counts grouped by day, for a simple stats chart.
export async function getClickHistory(urlId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE(clicked_at) AS date, COUNT(*) AS count
     FROM clicks
     WHERE url_id = ?
     GROUP BY DATE(clicked_at)
     ORDER BY date ASC`,
    [urlId]
  );
  return rows;
}
