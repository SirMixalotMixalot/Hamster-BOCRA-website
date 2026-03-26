import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { sampleJobs } from "@/pages/Careers";
import { useState, useRef } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const JobApplication = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const job = sampleJobs.find((j) => j.id === jobId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    coverLetter: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="min-w-0 flex-1 py-12 md:py-16">
          <section className="container max-w-5xl mx-auto px-4">
            <button
              onClick={() => navigate("/careers")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Careers
            </button>
            <h1 className="text-2xl font-bold text-foreground">Position Not Found</h1>
          </section>
        </main>
        <BottomBar />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setFileError("Only PDF files are accepted.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File size must be under 5MB.");
      return;
    }
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.nationalId.trim() &&
    file !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);

    // Simulate submission delay (replace with real API call later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="min-w-0 flex-1 py-12 md:py-16">
          <section className="container max-w-3xl mx-auto px-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mt-6">
              Application Submitted
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              Thank you for applying for the <strong>{job.title}</strong> position. Your application has been received and will be reviewed by our team. We will contact you if your profile matches our requirements.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/careers")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Back to Careers
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors text-sm"
              >
                Go Home
              </button>
            </div>
          </section>
        </main>
        <BottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-3xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate(`/careers/${job.id}`)}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job Details
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Apply: {job.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {job.department} &middot; {job.location}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="+267 7X XXX XXX"
              />
            </div>

            {/* National ID / Omang */}
            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-foreground mb-1.5">
                National ID (Omang) Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nationalId"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Enter your Omang number"
              />
            </div>

            {/* Cover Letter */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-foreground mb-1.5">
                Cover Letter <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                placeholder="Tell us why you are a good fit for this role..."
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Resume / CV (PDF) <span className="text-red-500">*</span>
              </label>

              {!file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors group"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Click to upload your CV
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF only, max 5MB
                  </p>
                </button>
              ) : (
                <div className="flex items-center gap-3 border border-border rounded-lg p-4 bg-white">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {fileError && (
                <p className="mt-1.5 text-xs text-red-500">{fileError}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default JobApplication;
