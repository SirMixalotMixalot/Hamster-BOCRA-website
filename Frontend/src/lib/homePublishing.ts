export type HomeStatItem = {
  value: string;
  label: string;
};

export type HomeNewsItem = {
  tag: string;
  tagColor: string;
  date: string;
  title: string;
  description: string;
};

export type HomeResourceItem = {
  title: string;
  description: string;
};

export type HomePublishPayload = {
  statsHighlights: HomeStatItem[];
  newsItems: HomeNewsItem[];
  tenders: HomeResourceItem[];
  forms: HomeResourceItem[];
  publications: HomeResourceItem[];
  legislationAndRegulations: HomeResourceItem[];
  updatedAt: string;
};

const STORAGE_KEY = "bocra_home_publish_payload_v1";

export function getHomePublishPayload(): HomePublishPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HomePublishPayload;
  } catch {
    return null;
  }
}

export function setHomePublishPayload(payload: HomePublishPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function mergeHomePublishPayload(
  patch: Partial<Omit<HomePublishPayload, "updatedAt">>,
): HomePublishPayload {
  const current = getHomePublishPayload();
  const merged: HomePublishPayload = {
    statsHighlights: patch.statsHighlights ?? current?.statsHighlights ?? [],
    newsItems: patch.newsItems ?? current?.newsItems ?? [],
    tenders: patch.tenders ?? current?.tenders ?? [],
    forms: patch.forms ?? current?.forms ?? [],
    publications: patch.publications ?? current?.publications ?? [],
    legislationAndRegulations:
      patch.legislationAndRegulations ?? current?.legislationAndRegulations ?? [],
    updatedAt: new Date().toISOString(),
  };
  setHomePublishPayload(merged);
  return merged;
}
