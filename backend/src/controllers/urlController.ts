import { Request, Response } from "express";
import {
  createUrl,
  findUrlByShortCode,
  findUrlById,
  listUrlsWithClickCounts,
} from "../models/urlModel";
import { recordClick, getClickHistory } from "../models/clickModel";
import { generateShortCode } from "../utils/shortCode";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { longUrl } = req.body;

  if (!longUrl || !isValidUrl(longUrl)) {
    res.status(400).json({ error: "A valid http(s) URL is required" });
    return;
  }

  const userId = req.user!.userId;

  // Collision check: retry a few times in the very unlikely case nanoid
  // produces a code that's already taken.
  let shortCode = generateShortCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await findUrlByShortCode(shortCode);
    if (!existing) break;
    shortCode = generateShortCode();
  }

  const id = await createUrl(userId, longUrl, shortCode);
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

  res.status(201).json({
    id,
    longUrl,
    shortCode,
    shortUrl: `${baseUrl}/${shortCode}`,
  });
}

export async function listUrls(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const urls = await listUrlsWithClickCounts(userId);
  res.json(urls);
}

export async function redirectToLongUrl(
  req: Request,
  res: Response
): Promise<void> {
  const { shortCode } = req.params;
  const url = await findUrlByShortCode(shortCode);

  if (!url) {
    res.status(404).json({ error: "Short URL not found" });
    return;
  }

  // Fire-and-forget: don't make the user wait on the click write before
  // redirecting them.
  recordClick(url.id).catch((err) =>
    console.error("Failed to record click:", err)
  );

  res.redirect(url.long_url);
}

export async function getUrlStats(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const urlId = Number(req.params.id);

  const url = await findUrlById(urlId, userId);
  if (!url) {
    res.status(404).json({ error: "URL not found" });
    return;
  }

  const history = await getClickHistory(urlId);
  res.json({ url, history });
}
