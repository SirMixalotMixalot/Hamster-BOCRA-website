import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { listPublicDocuments, type PublicDocumentListItem } from "@/lib/documents";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Publications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState<PublicDocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const focusedDocId = new URLSearchParams(location.search).get("docId");

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      try {
        const items = await listPublicDocuments();
        if (!mounted) return;
        setDocuments(items.filter((item) => Boolean(item.download_url) && item.section === "publications"));
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load publications.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!focusedDocId || loading) {
      return;
    }

    const element = document.getElementById(`document-${focusedDocId}`);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedDocId, loading, documents]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-3 md:mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Publications</h1>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              Reports, bulletins, studies, and other published BOCRA documents available for download.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading publications...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No publications are available yet. Check back later.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  id={`document-${doc.id}`}
                  href={doc.download_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start justify-between gap-3 rounded-lg border bg-white p-4 transition-colors ${
                    focusedDocId === doc.id
                      ? "border-bocra-gold ring-2 ring-bocra-gold/40 bg-bocra-gold/5"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground break-words">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.file_type?.toUpperCase() || "PDF"} &bull; {formatFileSize(doc.file_size)} &bull; {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Download className="h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default Publications;
