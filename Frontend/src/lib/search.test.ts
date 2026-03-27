import { describe, expect, it } from "vitest";

import { normalizeSearchResponse } from "./search";

describe("normalizeSearchResponse", () => {
  it("maps legacy news urls to /resources/news", () => {
    const response = normalizeSearchResponse({
      query: "news",
      results: [
        {
          type: "news",
          title: "Regulatory update",
          snippet: "Latest update",
          url: "/news/123",
          score: 1,
        },
      ],
    });

    expect(response.results).toHaveLength(1);
    expect(response.results[0].url).toBe("/resources/news/123");
  });

  it("does not rewrite non-news urls", () => {
    const response = normalizeSearchResponse({
      query: "decisions",
      results: [
        {
          type: "decision",
          title: "Spectrum decision",
          snippet: "Decision summary",
          url: "/decisions/abc",
          score: 1,
        },
      ],
    });

    expect(response.results).toHaveLength(1);
    expect(response.results[0].url).toBe("/decisions/abc");
  });

  it("maps service links from /news to /resources/news", () => {
    const response = normalizeSearchResponse({
      query: "view news",
      results: [
        {
          type: "service",
          title: "View News",
          snippet: "Latest notices",
          url: "/news",
          score: 1,
        },
      ],
    });

    expect(response.results).toHaveLength(1);
    expect(response.results[0].url).toBe("/resources/news");
  });
});
