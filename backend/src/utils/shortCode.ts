import { nanoid } from "nanoid";

// 7 characters keeps short URLs actually short while giving ~3.5 trillion
// possible combinations (62^7) — collisions are checked for anyway in the
// controller, but this length makes them very rare in practice.
export function generateShortCode(): string {
  return nanoid(7);
}
