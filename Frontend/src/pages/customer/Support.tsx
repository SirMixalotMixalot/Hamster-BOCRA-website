import { useState } from "react";
import { LifeBuoy, Send, Loader2, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type TicketStatus = "Open" | "In Progress" | "Resolved";

type Ticket = {
  id: string;
  category: string;
  subject: string;
  description: string;
  date: string;
  status: TicketStatus;
};

const CATEGORIES = ["Payment", "Application", "Account", "Other"];

const STATUS_STYLES: Record<TicketStatus, string> = {
  "Open": "bg-blue-50 text-blue-600",
  "In Progress": "bg-yellow-50 text-yellow-600",
  "Resolved": "bg-green-50 text-green-600",
};

const Support = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const inputClass =
    "w-full px-5 py-2.5 rounded-full border border-[hsl(215_20%_50%/0.25)] bg-[hsl(215_25%_15%/0.06)] text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)] transition-all duration-200";

  const resetForm = () => {
    setCategory("");
    setSubject("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: replace with real API call
    setTimeout(() => {
      const seq = String(tickets.length + 1).padStart(4, "0");
      const newTicket: Ticket = {
        id: `BOCRA-TKT-${new Date().getFullYear()}-${seq}`,
        category,
        subject,
        description,
        date: new Date().toISOString().split("T")[0],
        status: "Open",
      };
      setTickets((prev) => [newTicket, ...prev]);
      resetForm();
      setShowForm(false);
      setSubmitting(false);
      toast.success("Ticket submitted", {
        description: `Reference: ${newTicket.id}`,
      });
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
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
                      <option key={c} value={c}>{c}</option>
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
      {tickets.length > 0 ? (
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
                    <td className="px-5 py-3.5 text-sm text-foreground">{ticket.category}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{ticket.subject}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {new Date(ticket.date).toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status}
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
