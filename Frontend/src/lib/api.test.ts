import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApiUrl, getApiBaseUrl } from "./api";


describe("api URL helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses local API when VITE_USE_LOCAL_API is true", () => {
    vi.stubEnv("VITE_USE_LOCAL_API", "true");
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");

    expect(getApiBaseUrl()).toBe("http://localhost:8000");
  });

  it("uses configured API URL and removes trailing slash", () => {
    vi.stubEnv("VITE_USE_LOCAL_API", "false");
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/");

    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("falls back to production API URL when no env is set", () => {
    vi.stubEnv("VITE_USE_LOCAL_API", "false");
    vi.stubEnv("VITE_API_BASE_URL", "");

    expect(getApiBaseUrl()).toBe("https://hamster-bocra-website-production.up.railway.app");
  });

  it("builds full API URL from path", () => {
    vi.stubEnv("VITE_USE_LOCAL_API", "true");

    expect(buildApiUrl("/api/health")).toBe("http://localhost:8000/api/health");
  });
});
