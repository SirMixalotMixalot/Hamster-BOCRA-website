import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export type DocumentCategory = "application" | "profile_photo" | "evidence" | "public";

export interface DocumentUploadResponse {
  id: string;
  application_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
}

export async function uploadDocument(params: {
  file: File;
  category: DocumentCategory;
  applicationId?: string;
}): Promise<DocumentUploadResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("You must be signed in to upload documents.");
  }

  const form = new FormData();
  form.append("file", params.file);
  form.append("category", params.category);
  if (params.applicationId) {
    form.append("application_id", params.applicationId);
  }

  const response = await fetch(`${getApiBaseUrl()}/api/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    let message = "Failed to upload document";
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  return (await response.json()) as DocumentUploadResponse;
}
