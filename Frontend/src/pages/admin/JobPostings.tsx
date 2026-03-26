import { useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Briefcase } from "lucide-react";
import type { JobPosting } from "@/pages/Careers";
import { sampleJobs } from "@/pages/Careers";

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

const AdminJobPostings = () => {
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
      responsibilities: form.responsibilities
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      requirements: {
        education: form.educationReq,
        experience: form.experienceReq,
      },
      howToApply: form.howToApply,
      status: "published",
      applicants: 0,
    };

    if (editingId) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingId ? { ...newJob, applicants: j.applicants } : j)),
      );
    } else {
      setJobs((prev) => [...prev, newJob]);
    }

    resetForm();
  };

  const toggleStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === "published" ? "closed" : "published" }
          : j,
      ),
    );
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const statusBadge = (status: JobStatus) => {
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Job Postings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage career opportunities displayed on the public Careers page
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Posting
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editingId ? "Edit Posting" : "New Job Posting"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="e.g. Legal Officer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="e.g. Legal Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Closing Date</label>
              <input
                value={form.closingDate}
                onChange={(e) => setForm((p) => ({ ...p, closingDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="e.g. 20 March 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              placeholder="Brief description of the role..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Key Responsibilities <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              value={form.responsibilities}
              onChange={(e) => setForm((p) => ({ ...p, responsibilities: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              placeholder="Enter each responsibility on a new line..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Education Requirements</label>
              <textarea
                value={form.educationReq}
                onChange={(e) => setForm((p) => ({ ...p, educationReq: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Experience Requirements</label>
              <textarea
                value={form.experienceReq}
                onChange={(e) => setForm((p) => ({ ...p, experienceReq: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.department.trim()}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? "Update Posting" : "Publish Posting"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
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
                      <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {job.applicants}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(job.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(job)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => toggleStatus(job.id)}
                          title={job.status === "published" ? "Close" : "Publish"}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          {job.status === "published" ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => removeJob(job.id)}
                          title="Delete"
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
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
  );
};

export default AdminJobPostings;
