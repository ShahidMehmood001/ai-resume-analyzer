import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  timeout: 60000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? err.message ?? "Unknown error";
    return Promise.reject(new Error(Array.isArray(msg) ? msg.join(", ") : msg));
  },
);

// ── Candidates ──────────────────────────────────────────────────────────────
export const candidatesApi = {
  list: (params?: Record<string, string>) =>
    api.get("/candidates", { params }).then((r) => r.data),
  get: (id: string) => api.get(`/candidates/${id}`).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/candidates/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/candidates/${id}`),
  compare: (ids: string[]) =>
    api.get("/candidates/compare", { params: { ids: ids.join(",") } }).then((r) => r.data),
};

// ── Jobs ────────────────────────────────────────────────────────────────────
export const jobsApi = {
  list: () => api.get("/jobs").then((r) => r.data),
  get: (id: string) => api.get(`/jobs/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post("/jobs", data).then((r) => r.data),
  remove: (id: string) => api.delete(`/jobs/${id}`),
  score: (jobId: string, candidateId: string) =>
    api.post(`/jobs/${jobId}/score/${candidateId}`).then((r) => r.data),
  scoreBatch: (jobId: string, candidateIds: string[]) =>
    api.post(`/jobs/${jobId}/score-batch`, { candidateIds }).then((r) => r.data),
};

// ── Resumes ─────────────────────────────────────────────────────────────────
export const resumesApi = {
  list: () => api.get("/resumes").then((r) => r.data),
  get: (id: string) => api.get(`/resumes/${id}`).then((r) => r.data),
  /** Absolute URL to stream PDF for embedding (same origin as API base, no /api double prefix). */
  pdfUrl: (resumeId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    return `${base.replace(/\/$/, "")}/resumes/${resumeId}/pdf`;
  },
  /** One file per request so each upload can report its own progress. */
  uploadSingle: (file: File, onProgress?: (p: number) => void) => {
    const fd = new FormData();
    fd.append("files", file);
    return api.post("/upload/resumes", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }).then((r) => r.data as UploadBatchResult);
  },
  upload: (files: File[], onProgress?: (p: number) => void) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    return api.post("/upload/resumes", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).then((r) => r.data);
  },
  streamExtract: (resumeId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    return new EventSource(`${base}/upload/resumes/${resumeId}/extract`);
  },
};

export type UploadBatchResult = {
  uploaded: number;
  files: { resumeId: string; filename: string; status: string }[];
};
