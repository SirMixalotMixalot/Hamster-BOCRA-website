export type SearchResultType = "news" | "decision" | "document" | "service";
export type SearchResultAction =
  | "open_signin_modal"
  | "open_services_overlay"
  | "open_contact_modal"
  | "open_ai_chatbot"
  | "open_complaint_modal"
  | "open_verify_licence_modal";

export interface SearchResultItem {
  type: SearchResultType;
  title: string;
  snippet: string;
  url: string;
  action?: SearchResultAction;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = "http://localhost:8000";
  return (configured || fallback).replace(/\/$/, "");
}

function isSearchType(value: unknown): value is SearchResultType {
  return value === "news" || value === "decision" || value === "document" || value === "service";
}

function isSearchAction(value: unknown): value is SearchResultAction {
  return (
    value === "open_signin_modal" ||
    value === "open_services_overlay" ||
    value === "open_contact_modal" ||
    value === "open_ai_chatbot" ||
    value === "open_complaint_modal" ||
    value === "open_verify_licence_modal"
  );
}

function normalizeSearchResult(item: unknown): SearchResultItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const row = item as Record<string, unknown>;
  const type = row.type;
  if (!isSearchType(type)) {
    return null;
  }

  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!title) {
    return null;
  }

  const snippet = typeof row.snippet === "string" ? row.snippet : "";
  const url = typeof row.url === "string" && row.url ? row.url : "#";
  const action = isSearchAction(row.action) ? row.action : undefined;
  const score = typeof row.score === "number" ? row.score : 0;

  return {
    type,
    title,
    snippet,
    url,
    action,
    score,
  };
}

export function normalizeSearchResponse(payload: unknown): SearchResponse {
  if (!payload || typeof payload !== "object") {
    return { query: "", results: [] };
  }

  const body = payload as Record<string, unknown>;
  const query = typeof body.query === "string" ? body.query : "";
  const rawResults = Array.isArray(body.results) ? body.results : [];
  const results = rawResults
    .map(normalizeSearchResult)
    .filter((item): item is SearchResultItem => Boolean(item));

  return { query, results };
}

export async function searchContent(query: string): Promise<SearchResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    let message = "Search request failed";
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // Keep fallback error message.
    }
    throw new Error(message);
  }

  const payload = await response.json();
  return normalizeSearchResponse(payload);
}
