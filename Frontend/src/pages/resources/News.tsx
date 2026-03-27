import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Calendar } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { listPublicDocuments, type PublicDocumentListItem } from "@/lib/documents";

interface NewsItem {
  tag: string;
  tagColor: string;
  date: string;
  title: string;
  description: string;
}

const allNewsItems: NewsItem[] = [
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "10 Jun 2025",
    title: "BOCRA Website Development Hackathon",
    description: "BOCRA invites the public to participate in the upcoming Website Development Hackathon aimed at improving digital service delivery.",
  },
  {
    tag: "Press Release",
    tagColor: "bg-bocra-blue/10 text-bocra-blue",
    date: "5 Jun 2025",
    title: "Botswana Collaborates with Five SADC Member States to Substantially Reduce and Harmonise International Roaming Tariffs",
    description: "In a landmark move, Botswana and five SADC member states have agreed to reduce and harmonise international roaming tariffs across the region.",
  },
  {
    tag: "Media Release",
    tagColor: "bg-bocra-teal/10 text-bocra-teal",
    date: "28 May 2025",
    title: "BOCRA Approves Reduced Data Prices for Botswana Telecommunications Corporation (BTC)",
    description: "BOCRA has approved a reduction in data prices for BTC, a move aimed at making internet access more affordable for Batswana.",
  },
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "20 May 2025",
    title: "Expression of Interest (EOI) for Inclusion in BOCRA's Supplier Database",
    description: "BOCRA invites qualified suppliers to express interest for inclusion in the Authority's Supplier Database for the provision of goods and services.",
  },
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "15 May 2025",
    title: "Invitation to Apply (ITA) for a Commercial Broadcasting Radio Station Licence",
    description: "BOCRA invites interested parties to apply for a Commercial Broadcasting Radio Station Licence in accordance with the Communications Regulatory Authority Act.",
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const News = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PublicDocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      try {
        const items = await listPublicDocuments();
        if (!mounted) return;
        setDocuments(items.filter((item) => Boolean(item.download_url) && item.section === "news"));
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load documents.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">News &amp; Events</h1>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              Latest announcements, press releases, and public notices from BOCRA.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {allNewsItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5 border border-gray-200 bg-white"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </span>
                </div>
                <div className="font-semibold text-foreground mb-2 leading-snug">
                  {item.title}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">{item.description}</div>
              </div>
            ))}
          </div>

          {/* Uploaded news documents from admin */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : documents.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-4">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.download_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground break-words">{doc.file_name}</p>
                      {doc.file_size != null && (
                        <p className="text-xs text-muted-foreground mt-1">{formatFileSize(doc.file_size)}</p>
                      )}
                    </div>
                    <Download className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default News;
