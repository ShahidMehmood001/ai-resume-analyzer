export type CandidateStatus = "pending" | "shortlisted" | "interviewing" | "hired" | "rejected";

export interface Education {
  school: string;
  major: string;
  degree: string;
  graduationDate: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  period: string;
  summary: string;
}

export interface Project {
  name: string;
  techStack: string[];
  role: string;
  highlights: string;
}

export interface ResumeScore {
  id: string;
  jobId: string;
  overallScore: number;
  skillMatch: number;
  experienceRelevance: number;
  educationFit: number;
  aiComment: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  originalName: string;
  filePath: string;
  status: "uploading" | "parsing" | "extracting" | "done" | "failed";
  errorMessage?: string;
  scores?: ResumeScore[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: CandidateStatus;
  overallScore?: number;
  skills?: string[];
  education?: Education[];
  workExperience?: WorkExperience[];
  projects?: Project[];
  resumes?: Resume[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  bonusSkills: string[];
  experienceYears?: number;
  educationLevel?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadResult {
  uploaded: number;
  files: { resumeId: string; filename: string; status: string }[];
}

// Alias used by SSE extractor component
export type ExtractedResumeData = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  education?: Education[];
  workExperience?: WorkExperience[];
  skills?: string[];
  projects?: Project[];
};
