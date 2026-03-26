import { useEffect, useMemo, useState } from "react";
import { Download, FileCheck, FileText, Newspaper, Briefcase, ScrollText } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { listPublicDocuments, type PublicDocumentListItem } from "@/lib/documents";

const SECTION_ORDER = ["forms", "publications", "legislation", "tenders", "news", "uncategorized"] as const;

const SECTION_META = {
  forms: {
    title: "Forms",
    description: "Application forms, templates, and standard downloadable forms.",
    icon: FileCheck,
  },
  publications: {
    title: "Publications",
    description: "Reports, bulletins, and other published BOCRA documents.",
    icon: FileText,
  },
  legislation: {
    title: "Legislation & Regulations",
    description: "Acts, regulations, and regulatory reference documents.",
    icon: ScrollText,
  },
  tenders: {
    title: "Tenders",
    description: "Public tender notices and procurement-related documents.",
    icon: Briefcase,
  },
  news: {
    title: "News Downloads",
    description: "News-linked downloadable documents and notices.",
    icon: Newspaper,
  },
  uncategorized: {
    title: "Other Documents",
    description: "Public documents that have not been assigned to a section yet.",
    icon: FileText,
  },
} as const;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FormsDocuments = () => {
  const [documents, setDocuments] = useState<PublicDocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      try {
        const items = await listPublicDocuments();
        if (!mounted) return;
        setDocuments(items.filter((item) => Boolean(item.download_url)));
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load public documents.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  const groupedSections = useMemo(() => {
    const grouped = documents.reduce<Record<string, PublicDocumentListItem[]>>((acc, document) => {
      const key = document.section || "uncategorized";
      acc[key] = [...(acc[key] || []), document];
      return acc;
    }, {});

    return SECTION_ORDER
      .filter((section) => grouped[section]?.length)
      .map((section) => ({
        key: section,
        meta: SECTION_META[section],
        items: grouped[section],
      }));
  }, [documents]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1">
        <div className="bg-bocra-navy text-white py-12">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold">Forms & Documents</h1>
            <p className="text-white/70 mt-2 text-sm max-w-2xl mx-auto">
              Browse BOCRA public forms, publications, legislation, tenders, and downloadable reference documents.
            </p>
          </div>
        </div>

        <section className="container max-w-6xl mx-auto px-4 py-12 space-y-8">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : groupedSections.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No public documents are available yet.</p>
            </div>
          ) : (
            groupedSections.map((section) => {
              const Icon = section.meta.icon;

              return (
                <section key={section.key} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold text-foreground">{section.meta.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{section.meta.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((document) => (
                      <a
                        key={document.id}
                        href={document.download_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground break-words">{document.file_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF • {formatFileSize(document.file_size)} • {new Date(document.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Download className="h-4 w-4" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default FormsDocuments;
