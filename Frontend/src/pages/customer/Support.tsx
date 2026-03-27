import { useEffect, useState } from "react";
import { LifeBuoy, Send, Loader2, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createSupportTicket, listSupportTickets, type SupportCategory, type SupportTicketItem } from "@/lib/support";
import { LoadingDots } from "@/components/ui/loading-dots";
import { useOutletContext } from "react-router-dom";

const CATEGORIES: { label: string; value: SupportCategory }[] = [
  { label: "Technical", value: "technical" },
  { label: "Billing", value: "billing" },
  { label: "Complaint", value: "complaint" },
  { label: "General Inquiry", value: "general_inquiry" },
  { label: "License Renewal", value: "license_renewal" },
  { label: "Other", value: "other" },
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-50 text-blue-600",
  replied: "bg-green-50 text-green-600",
  closed: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  replied: "Replied",
  closed: "Closed",
};

const categoryLabel = (value: string | null): string => {
  if (!value) return "Uncategorized";
  const match = CATEGORIES.find((item) => item.value === value);
  if (match) return match.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const Support = () => {
  const { isSidebarCollapsed } = useOutletContext<{ isSidebarCollapsed?: boolean }>();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [category, setCategory] = useState<SupportCategory | "">("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await listSupportTickets();
        if (!mounted) return;
        setTickets(response.items || []);
      } catch (error) {
        if (!mounted) return;
        toast.error("Failed to load support tickets", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const inputClass =
    "w-full px-5 py-2.5 rounded-full border border-[hsl(215_20%_50%/0.25)] bg-[hsl(215_25%_15%/0.06)] text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)] transition-all duration-200";

  const resetForm = () => {
    setCategory("");
    setSubject("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = await createSupportTicket({
        category: category || undefined,
        subject,
        message: description,
      });
      setTickets((prev) => [created, ...prev]);
      resetForm();
      setShowForm(false);
      toast.success("Ticket submitted", {
        description: `Reference: ${created.id}`,
      });
    } catch (error) {
      toast.error("Could not submit ticket", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center ${isSidebarCollapsed ? "justify-between" : "justify-between lg:justify-end"}`}>
        <div className={`${isSidebarCollapsed ? "block" : "block lg:hidden"}`}>
          <h2 className="text-2xl font-heading font-bold text-foreground">Support</h2>
          <p className="text-sm text-muted-foreground mt-1">Log and track your support tickets</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Log a Ticket
          </button>
        )}
      </div>

      {/* Log a Ticket Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <div className="relative">
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your issue..."
                className={`${inputClass} !rounded-xl resize-none`}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(false); }}
                className="px-4 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <LoadingDots label="Loading support tickets..." />
        </div>
      ) : tickets.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[hsl(var(--glass-border))]">
            <h3 className="text-sm font-semibold text-foreground">Your Tickets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Ticket #</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className={`border-b border-white/30 last:border-0 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-white/30" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium font-mono text-foreground">{ticket.id}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{categoryLabel(ticket.category)}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{ticket.subject}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status] || "bg-muted text-foreground"}`}>
                        {STATUS_LABELS[ticket.status] || ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !showForm && (
          <div className="glass rounded-2xl p-8 text-center">
            <LifeBuoy className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">No support tickets yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click "Log a Ticket" to get started</p>
          </div>
        )
      )}
    </div>
  );
};

export default Support;
