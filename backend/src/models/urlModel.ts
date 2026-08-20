import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface UrlRecord {
  id: number;
  user_id: number;
  long_url: string;
  short_code: string;
  created_at: Date;
}

export async function createUrl(
  userId: number,
  longUrl: string,
  shortCode: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO urls (user_id, long_url, short_code) VALUES (?, ?, ?)",
    [userId, longUrl, shortCode]
  );
  return result.insertId;
}

export async function findUrlByShortCode(
  shortCode: string
): Promise<UrlRecord | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM urls WHERE short_code = ?",
    [shortCode]
  );
  return (rows[0] as UrlRecord) || null;
}

export async function findUrlById(
  id: number,
  userId: number
): Promise<UrlRecord | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM urls WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return (rows[0] as UrlRecord) || null;
}

// Returns every URL for a user, along with a click count computed via a
// LEFT JOIN + GROUP BY — this avoids an N+1 query problem (one query
// instead of one-per-url).
export async function listUrlsWithClickCounts(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.long_url, u.short_code, u.created_at,
            COUNT(c.id) AS click_count
     FROM urls u
     LEFT JOIN clicks c ON c.url_id = u.id
     WHERE u.user_id = ?
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [userId]
  );
  return rows;
}
