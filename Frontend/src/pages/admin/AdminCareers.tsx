import { useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Briefcase, Search, FileText, Download, X, User } from "lucide-react";
import type { JobPosting } from "@/pages/Careers";
import { sampleJobs } from "@/pages/Careers";

/* ─── Job Postings types & data ─── */

type JobStatus = "published" | "draft" | "closed";

interface ManagedJob extends JobPosting {
  status: JobStatus;
  applicants: number;
}

const initialJobs: ManagedJob[] = sampleJobs.map((job) => ({
  ...job,
  status: "published" as JobStatus,
  applicants: job.id === "legal-officer" ? 3 : 1,
}));

/* ─── Job Applications types & data ─── */

interface JobApplicationEntry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  position: string;
  coverLetter: string;
  cvFileName: string;
  submittedAt: string;
  status: "new" | "reviewed" | "shortlisted" | "rejected";
}

const MOCK_APPLICATIONS: JobApplicationEntry[] = [
  {
    id: "app-001",
    fullName: "Kabo Mosweu",
    email: "kabo.mosweu@gmail.com",
    phone: "+267 71 234 567",
    nationalId: "123456789",
    position: "Legal Officer",
    coverLetter:
      "I am writing to express my interest in the Legal Officer position. With over 3 years of experience in administrative law and corporate governance, I am confident in my ability to contribute to BOCRA's mission. I have extensive experience in regulatory compliance and contract management.",
    cvFileName: "Kabo_Mosweu_CV.pdf",
    submittedAt: "2026-03-22T10:15:00Z",
    status: "new",
  },
  {
    id: "app-002",
    fullName: "Lesego Tau",
    email: "lesego.tau@outlook.com",
    phone: "+267 72 345 678",
    nationalId: "987654321",
    position: "Senior Legal Officer",
    coverLetter:
      "I am an accomplished legal professional with 5 years experience in communications law and regulatory affairs. I am excited about the opportunity to join BOCRA's Legal Services department.",
    cvFileName: "Lesego_Tau_Resume.pdf",
    submittedAt: "2026-03-21T14:30:00Z",
    status: "reviewed",
  },
  {
    id: "app-003",
    fullName: "Mpho Kgathi",
    email: "mpho.k@yahoo.com",
    phone: "+267 74 567 890",
    nationalId: "456789123",
    position: "Legal Officer",
    coverLetter: "",
    cvFileName: "MphoK_CV_2026.pdf",
    submittedAt: "2026-03-23T08:45:00Z",
    status: "new",
  },
  {
    id: "app-004",
    fullName: "Thato Molefe",
    email: "thato.molefe@gmail.com",
    phone: "+267 76 890 123",
    nationalId: "789123456",
    position: "Legal Officer",
    coverLetter:
      "Having worked in media law for the past 2 years, I bring a unique perspective to regulatory work. My experience with the Law Society and High Court practice positions me well for this role.",
    cvFileName: "T_Molefe_CV.pdf",
    submittedAt: "2026-03-20T16:20:00Z",
    status: "shortlisted",
  },
];

/* ─── Main Component ─── */

type Tab = "postings" | "applications";

const AdminCareers = () => {
  const [activeTab, setActiveTab] = useState<Tab>("postings");

  /* Postings state */
  const [jobs, setJobs] = useState<ManagedJob[]>(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "Gaborone, Botswana",
    type: "Full-time",
    closingDate: "",
    summary: "",
    responsibilities: "",
    educationReq: "",
    experienceReq: "",
    howToApply:
      "Candidates who meet the requirements for the above-mentioned position should apply and attach their Curriculum Vitae and Certified Copies of educational certificates.",
  });

  /* Applications state */
  const [applications, setApplications] = useState<JobApplicationEntry[]>(MOCK_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobApplicationEntry["status"]>("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selected, setSelected] = useState<JobApplicationEntry | null>(null);

  /* ── Postings helpers ── */

  const resetForm = () => {
    setForm({
      title: "",
      department: "",
      location: "Gaborone, Botswana",
      type: "Full-time",
      closingDate: "",
      summary: "",
      responsibilities: "",
      educationReq: "",
      experienceReq: "",
      howToApply:
        "Candidates who meet the requirements for the above-mentioned position should apply and attach their Curriculum Vitae and Certified Copies of educational certificates.",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (job: ManagedJob) => {
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      closingDate: job.closingDate,
      summary: job.summary,
      responsibilities: job.responsibilities.join("\n"),
      educationReq: job.requirements.education,
      experienceReq: job.requirements.experience,
      howToApply: job.howToApply,
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.department.trim()) return;
    const newJob: ManagedJob = {
      id: editingId || form.title.toLowerCase().replace(/\s+/g, "-"),
      title: form.title,
      department: form.department,
      location: form.location,
      type: form.type,
      closingDate: form.closingDate,
      summary: form.summary,
      responsibilities: form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
      requirements: { education: form.educationReq, experience: form.experienceReq },
      howToApply: form.howToApply,
      status: "published",
      applicants: 0,
    };
    if (editingId) {
      setJobs((prev) => prev.map((j) => (j.id === editingId ? { ...newJob, applicants: j.applicants } : j)));
    } else {
      setJobs((prev) => [...prev, newJob]);
    }
    resetForm();
  };

  const toggleStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: j.status === "published" ? "closed" : "published" } : j)),
    );
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const jobStatusBadge = (status: JobStatus) => {
    const styles: Record<JobStatus, string> = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      closed: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  /* ── Applications helpers ── */

  const positions = ["all", ...Array.from(new Set(applications.map((a) => a.position)))];

  const filtered = applications.filter((app) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || app.fullName.toLowerCase().includes(q) || app.email.toLowerCase().includes(q) || app.nationalId.includes(q);
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchPosition = positionFilter === "all" || app.position === positionFilter;
    return matchSearch && matchStatus && matchPosition;
  });

  const updateAppStatus = (id: string, status: JobApplicationEntry["status"]) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null));
  };

  const appStatusBadge = (status: JobApplicationEntry["status"]) => {
    const styles: Record<string, string> = {
      new: "bg-blue-100 text-blue-700",
      reviewed: "bg-yellow-100 text-yellow-700",
      shortlisted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" });
  };

  /* ── Render ── */

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Careers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage job postings and review submitted applications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "postings" as Tab, label: "Job Postings" },
          { key: "applications" as Tab, label: "Applications" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Job Postings Tab ═══ */}
      {activeTab === "postings" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Posting
            </button>
          </div>

          {showForm && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? "Edit Posting" : "New Job Posting"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="e.g. Legal Officer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="e.g. Legal Services" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Closing Date</label>
                  <input value={form.closingDate} onChange={(e) => setForm((p) => ({ ...p, closingDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="e.g. 20 April 2026" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
                <textarea value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" placeholder="Brief description of the role..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Key Responsibilities <span className="text-muted-foreground font-normal">(one per line)</span></label>
                <textarea value={form.responsibilities} onChange={(e) => setForm((p) => ({ ...p, responsibilities: e.target.value }))} rows={6} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" placeholder="Enter each responsibility on a new line..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Education Requirements</label>
                  <textarea value={form.educationReq} onChange={(e) => setForm((p) => ({ ...p, educationReq: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Experience Requirements</label>
                  <textarea value={form.experienceReq} onChange={(e) => setForm((p) => ({ ...p, experienceReq: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={!form.title.trim() || !form.department.trim()} className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingId ? "Update Posting" : "Publish Posting"}
                </button>
                <button onClick={resetForm} className="px-5 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">No job postings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-foreground">Position</th>
                      <th className="text-left px-4 py-3 font-medium text-foreground hidden md:table-cell">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-foreground hidden lg:table-cell">Closing Date</th>
                      <th className="text-center px-4 py-3 font-medium text-foreground">Applicants</th>
                      <th className="text-center px-4 py-3 font-medium text-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{job.title}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{job.department}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{job.closingDate}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">{job.applicants}</span>
                        </td>
                        <td className="px-4 py-3 text-center">{jobStatusBadge(job.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(job)} title="Edit" className="p-1.5 rounded hover:bg-muted transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                            <button onClick={() => toggleStatus(job.id)} title={job.status === "published" ? "Close" : "Publish"} className="p-1.5 rounded hover:bg-muted transition-colors">
                              {job.status === "published" ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                            </button>
                            <button onClick={() => removeJob(job.id)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4 text-red-400" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Applications Tab ═══ */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or ID..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {positions.map((p) => (
                  <option key={p} value={p}>{p === "all" ? "All Positions" : p}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-foreground">Applicant</th>
                      <th className="text-left px-4 py-3 font-medium text-foreground hidden md:table-cell">Position</th>
                      <th className="text-left px-4 py-3 font-medium text-foreground hidden lg:table-cell">Date</th>
                      <th className="text-center px-4 py-3 font-medium text-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app) => (
                      <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{app.fullName}</p>
                            <p className="text-xs text-muted-foreground">{app.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{app.position}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(app.submittedAt)}</td>
                        <td className="px-4 py-3 text-center">{appStatusBadge(app.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setSelected(app)} title="View" className="p-1.5 rounded hover:bg-muted transition-colors"><Eye className="h-4 w-4 text-muted-foreground" /></button>
                            <button title="Download CV" className="p-1.5 rounded hover:bg-muted transition-colors"><Download className="h-4 w-4 text-muted-foreground" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selected.fullName}</h3>
                      <p className="text-sm text-muted-foreground">Applying for: {selected.position}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-muted transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="text-sm font-medium text-foreground">{selected.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-foreground">{selected.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">National ID (Omang)</p>
                      <p className="text-sm font-medium text-foreground">{selected.nationalId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(selected.submittedAt)}</p>
                    </div>
                  </div>
                  {selected.coverLetter && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cover Letter</p>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">{selected.coverLetter}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Attached CV</p>
                    <div className="flex items-center gap-3 border border-border rounded-lg p-3">
                      <FileText className="h-6 w-6 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground flex-1">{selected.cvFileName}</span>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {(["new", "reviewed", "shortlisted", "rejected"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateAppStatus(selected.id, s)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                            selected.status === s
                              ? "bg-primary text-white border-primary"
                              : "border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCareers;
