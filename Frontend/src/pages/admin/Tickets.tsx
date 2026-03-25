import { useEffect, useMemo, useState } from "react";
import { LifeBuoy, Search } from "lucide-react";

type TicketStatus = "open" | "in_progress" | "replied" | "resolved" | string;

type SupportTicket = {
  id: string;
  subject: string;
  category: string | null;
  message?: string;
  admin_reply?: string | null;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

type SupportTicketsResponse = {
  items: SupportTicket[];
  count: number;
  limit: number;
  offset: number;
};

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-2026-0001",
    subject: "Unable to complete payment checkout",
    category: "payment",
    status: "open",
    created_at: "2026-03-22T10:35:00Z",
    updated_at: "2026-03-22T10:35:00Z",
  },
  {
    id: "TKT-2026-0002",
    subject: "Application status not updating",
    category: "application",
    status: "in_progress",
    created_at: "2026-03-21T14:10:00Z",
    updated_at: "2026-03-23T08:02:00Z",
  },
  {
    id: "TKT-2026-0003",
    subject: "Need support with account verification",
    category: "account",
    status: "resolved",
    created_at: "2026-03-18T09:05:00Z",
    updated_at: "2026-03-20T11:40:00Z",
  },
];

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = "http://localhost:8000";
  return (configured || fallback).replace(/\/$/, "");
}

const Tickets = () => {
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/support/tickets`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const payload = (await response.json()) as SupportTicketsResponse;
        if (!mounted) return;
        setTickets(payload.items || []);
      } catch {
        if (!mounted) return;
        setTickets(MOCK_TICKETS);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((ticket) => ticket.subject.toLowerCase().includes(q) || ticket.id.toLowerCase().includes(q));
  }, [search, tickets]);

  const displayStatus = (status: string) =>
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Tickets</h2>
        <p className="text-sm text-muted-foreground mt-1">Track and respond to support tickets</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ticket ID or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <LifeBuoy className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No matching tickets</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try another search term</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">Ticket ID</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Subject</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Category</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Open / Review</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{ticket.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.category ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{displayStatus(ticket.status)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                      >
                        Open
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Reviewing {selectedTicket.id}</h3>
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Subject</p>
              <p className="mt-1 font-medium text-foreground">{selectedTicket.subject}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 font-medium text-foreground">{selectedTicket.category ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 font-medium text-foreground">{displayStatus(selectedTicket.status)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {selectedTicket.message || "No detailed message available for this ticket."}
            </p>
          </div>
          {selectedTicket.admin_reply ? (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Admin Reply</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Tickets;
