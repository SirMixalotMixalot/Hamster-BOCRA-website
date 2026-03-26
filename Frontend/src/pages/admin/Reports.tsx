import { useMemo, useState } from "react";
import { FileText, Gavel, Megaphone, Newspaper, ScrollText, TrendingUp, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mergeHomePublishPayload, type HomeResourceItem, type HomeStatItem } from "@/lib/homePublishing";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { uploadDocument } from "@/lib/documents";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MOCK_STATS = [
  { value: "4+", label: "Licensed Mobile Operators" },
  { value: "87%", label: "Mobile Penetration Rate" },
  { value: "60%+", label: "Internet Penetration" },
  { value: "200+", label: "Licensed Service Providers" },
];

const MOCK_NEWS = [
  {
    tag: "Press Release",
    tagColor: "bg-bocra-blue/10 text-bocra-blue",
    date: "24 Mar 2026",
    title: "BOCRA Expands Rural Connectivity Oversight",
    description: "New quality-of-service audit schedule introduced for underserved districts.",
  },
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "22 Mar 2026",
    title: "Consultation Open for Consumer Code Update",
    description: "Stakeholders invited to submit comments on revised customer protection rules.",
  },
];

const MOCK_TENDERS = [
  { title: "National Spectrum Monitoring Upgrade", description: "Tender closes 18 Apr 2026" },
  { title: "Regional Postal Sorting Systems", description: "Tender closes 26 Apr 2026" },
];

const MOCK_FORMS = [
  { title: "New Licence Application Form", description: "Latest revision March 2026" },
  { title: "Complaint Escalation Form", description: "Consumer Affairs template" },
];

const MOCK_PUBLICATIONS = [
  { title: "Quarterly Telecom Performance Bulletin", description: "Q1 2026 summary" },
  { title: "Broadcasting Compliance Snapshot", description: "Sector review publication" },
];

const MOCK_LEGISLATION = [
  { title: "Communications Regulatory Authority Act", description: "Current consolidated text" },
  { title: "Spectrum Regulations 2026", description: "Updated licensing obligations" },
];

type SectionKey = "stats" | "news" | "tenders" | "forms" | "publications" | "legislation";

const SECTION_UPLOAD_TITLES: Record<Exclude<SectionKey, "stats">, string> = {
  news: "news content",
  tenders: "tender documents",
  forms: "forms and templates",
  publications: "publication files",
  legislation: "legislation and regulation files",
};

const Reports = () => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<SectionKey | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Record<Exclude<SectionKey, "stats">, File[]>>({
    news: [],
    tenders: [],
    forms: [],
    publications: [],
    legislation: [],
  });
  const [statsPreview, setStatsPreview] = useState<HomeStatItem[]>(MOCK_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<Exclude<SectionKey, "stats"> | null>(null);

  const publish = (
    section: "stats" | "news" | "tenders" | "forms" | "publications" | "legislation",
  ) => {
    switch (section) {
      case "stats":
        mergeHomePublishPayload({ statsHighlights: MOCK_STATS });
        break;
      case "news":
        mergeHomePublishPayload({ newsItems: MOCK_NEWS });
        break;
      case "tenders":
        mergeHomePublishPayload({ tenders: MOCK_TENDERS });
        break;
      case "forms":
        mergeHomePublishPayload({ forms: MOCK_FORMS });
        break;
      case "publications":
        mergeHomePublishPayload({ publications: MOCK_PUBLICATIONS });
        break;
      case "legislation":
        mergeHomePublishPayload({ legislationAndRegulations: MOCK_LEGISLATION });
        break;
      default:
        break;
    }

    toast({
      title: "Published to home page",
      description: "Content is now available on the home page.",
    });
  };

  const statsPreviewRows = useMemo(() => statsPreview.slice(0, 4), [statsPreview]);

  const openStatsModal = async () => {
    setActiveModal("stats");
    setStatsLoading(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${getApiBaseUrl()}/api/applications/analytics`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          licence_type_distribution?: { licence_type: string; count: number }[];
          total_eligible_licences?: number;
        };
        const total = Math.max(1, Number(payload.total_eligible_licences || 0));
        const top = (payload.licence_type_distribution || []).slice(0, 4);
        if (top.length > 0) {
          setStatsPreview(
            top.map((item) => ({
              value: `${Math.round((item.count / total) * 100)}%`,
              label: item.licence_type,
            })),
          );
        } else {
          setStatsPreview(MOCK_STATS);
        }
      } else {
        setStatsPreview(MOCK_STATS);
      }
    } catch {
      setStatsPreview(MOCK_STATS);
    } finally {
      setStatsLoading(false);
    }
  };

  const openUploadModal = (section: Exclude<SectionKey, "stats">) => {
    setActiveModal(section);
  };

  const onFilesSelected = (section: Exclude<SectionKey, "stats">, files: FileList | null) => {
    if (!files) return;
    setUploadFiles((current) => ({
      ...current,
      [section]: [...Array.from(files)],
    }));
  };

  const renderUploadedFileNames = (section: Exclude<SectionKey, "stats">) => {
    const files = uploadFiles[section];
    if (!files.length) {
      return <p className="text-xs text-muted-foreground">No files selected yet.</p>;
    }
    return (
      <ul className="space-y-1">
        {files.map((file) => (
          <li key={`${file.name}-${file.size}`} className="text-xs text-foreground">
            {file.name}
          </li>
        ))}
      </ul>
    );
  };

  const publishFromModal = async (section: SectionKey) => {
    if (section !== "stats") {
      const files = uploadFiles[section];
      if (files.length === 0) {
        toast({
          title: "No files selected",
          description: "Please choose at least one file before publishing.",
        });
        return;
      }

      try {
        setUploadingSection(section);
        for (const file of files) {
          await uploadDocument({ file, category: "public" });
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Could not upload selected files.",
          variant: "destructive",
        });
        setUploadingSection(null);
        return;
      } finally {
        setUploadingSection(null);
      }
    }

    publish(section);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Documents Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Publish regulatory content sections to the home page</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Summarized Stats</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push highlighted market indicators to the home page.</p>
          <button onClick={() => void openStatsModal()} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            View
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bocra-rose/15 text-bocra-rose">
              <Newspaper className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">News</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push latest news cards to home page updates.</p>
          <button onClick={() => openUploadModal("news")} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Open
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bocra-gold/20 text-bocra-gold">
              <Megaphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Tenders</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push active tender notices to home page resources.</p>
          <button onClick={() => openUploadModal("tenders")} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Open
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bocra-blue/15 text-bocra-blue">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Forms</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push forms and templates to home page resources.</p>
          <button onClick={() => openUploadModal("forms")} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Open
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bocra-teal/15 text-bocra-teal">
              <ScrollText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Publications</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push published reports and bulletins to home page.</p>
          <button onClick={() => openUploadModal("publications")} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Open
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <Gavel className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Legislation & Regulations</h3>
          </div>
          <p className="text-xs text-muted-foreground">Push key legal references to home page resources.</p>
          <button onClick={() => openUploadModal("legislation")} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Open
          </button>
        </div>
      </div>

      <Dialog open={activeModal === "stats"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Summarized Stats</DialogTitle>
            <DialogDescription>Preview fetched stats before publishing to the home page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {statsLoading ? (
              <p className="text-sm text-muted-foreground">Fetching latest stats...</p>
            ) : (
              statsPreviewRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-md border border-border p-2.5">
                  <span className="text-sm text-foreground">{row.label}</span>
                  <span className="text-sm font-semibold text-foreground">{row.value}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => publishFromModal("stats")}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
            >
              Publish
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {(["news", "tenders", "forms", "publications", "legislation"] as const).map((section) => (
        <Dialog key={section} open={activeModal === section} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="capitalize">{section}</DialogTitle>
              <DialogDescription>
                Upload {SECTION_UPLOAD_TITLES[section]} you want to publish on the home page.
              </DialogDescription>
            </DialogHeader>

            <label className="block rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-muted/40 transition-colors">
              <div className="inline-flex items-center gap-2 text-sm text-foreground">
                <Upload className="h-4 w-4" />
                Choose files
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => onFilesSelected(section, event.target.files)}
              />
            </label>

            <div className="rounded-md border border-border p-3 max-h-36 overflow-y-auto">
              {renderUploadedFileNames(section)}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => void publishFromModal(section)}
                disabled={uploadingSection === section}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
              >
                {uploadingSection === section ? "Uploading..." : "Publish"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default Reports;
