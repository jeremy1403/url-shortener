"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

interface UrlRecord {
  id: number;
  long_url: string;
  short_code: string;
  created_at: string;
  click_count: number;
}

interface ShortenResponse {
  id: number;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [longUrl, setLongUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUrls = useCallback(async () => {
    try {
      const data = await apiFetch<UrlRecord[]>("/api/urls");
      setUrls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadUrls();
  }, [router, loadUrls]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch<ShortenResponse>("/api/urls", {
        method: "POST",
        body: JSON.stringify({ longUrl }),
      });
      setLongUrl("");
      await loadUrls();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your links</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Log out
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <input
          type="url"
          required
          placeholder="https://example.com/a-very-long-url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : urls.length === 0 ? (
        <p className="text-sm text-gray-500">
          No links yet — shorten your first URL above.
        </p>
      ) : (
        <ul className="space-y-3">
          {urls.map((url) => (
            <li
              key={url.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <a
                    href={`${apiBaseUrl}/${url.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {apiBaseUrl.replace(/^https?:\/\//, "")}/{url.short_code}
                  </a>
                  <p className="truncate text-sm text-gray-500">
                    {url.long_url}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold">{url.click_count}</p>
                  <p className="text-xs text-gray-500">clicks</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}