const LOCAL_API_BASE_URL = "http://localhost:8000";
const DEFAULT_PROD_API_BASE_URL = "https://hamster-bocra-website-production.up.railway.app";

export function getApiBaseUrl(): string {
  const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === "true";
  if (useLocalApi) {
    return LOCAL_API_BASE_URL;
  }

  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_PROD_API_BASE_URL).replace(/\/$/, "");
}

export function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}
