import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Header from "./Header";
import { LanguageProvider } from "@/i18n";

const clickSearchToggle = () => {
  const [searchToggle] = screen.getAllByRole("button", { name: "Toggle search" });
  fireEvent.click(searchToggle);
};

describe("Header search", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits query to backend and renders grouped results", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "licence",
        results: [
          {
            type: "news",
            title: "New licensing framework",
            snippet: "BOCRA announces updates.",
            url: "/news/123",
            score: 0.9,
          },
          {
            type: "decision",
            title: "Decision on spectrum renewal",
            snippet: "Public decision summary.",
            url: "/decisions/abc",
            score: 0.8,
          },
        ],
      }),
    } as Response);

    render(
      <LanguageProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </LanguageProvider>
    );

    clickSearchToggle();

    const input = screen.getByPlaceholderText("Search BOCRA services, documents, regulations...");
    fireEvent.change(input, { target: { value: "licence" } });

    const form = input.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/search?q=licence"));
    });

    expect(await screen.findByText("News")).toBeInTheDocument();
    expect(await screen.findByText("Decisions")).toBeInTheDocument();
    expect(await screen.findByText("New licensing framework")).toBeInTheDocument();
    expect(await screen.findByText("Decision on spectrum renewal")).toBeInTheDocument();
  });

  it("dispatches modal action for service result", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "contact",
        results: [
          {
            type: "service",
            title: "Contact BOCRA",
            snippet: "Get help from BOCRA support channels.",
            url: "/",
            action: "open_contact_modal",
            score: 9.0,
          },
        ],
      }),
    } as Response);

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(
      <LanguageProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </LanguageProvider>
    );

    clickSearchToggle();
    const input = screen.getByPlaceholderText("Search BOCRA services, documents, regulations...");
    fireEvent.change(input, { target: { value: "contact" } });
    fireEvent.submit(input.closest("form")!);

    const result = await screen.findByText("Contact BOCRA");
    fireEvent.click(result);

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "toggle-contact-modal" }));
  });

  it("uses service title fallback to open complaint modal", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "complaint",
        results: [
          {
            type: "service",
            title: "File a Complaint",
            snippet: "Submit a consumer complaint.",
            url: "/",
            action: "open_services_overlay",
            score: 9.0,
          },
        ],
      }),
    } as Response);

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(
      <LanguageProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </LanguageProvider>
    );

    clickSearchToggle();
    const input = screen.getByPlaceholderText("Search BOCRA services, documents, regulations...");
    fireEvent.change(input, { target: { value: "complaint" } });
    fireEvent.submit(input.closest("form")!);

    const result = await screen.findByText("File a Complaint");
    fireEvent.click(result);

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "toggle-complaint-modal" }));
  });
});
