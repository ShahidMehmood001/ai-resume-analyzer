export interface ExtractedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  education?: { school: string; major: string; degree: string; graduationDate: string }[];
  workExperience?: { company: string; position: string; period: string; summary: string }[];
  skills?: string[];
  projects?: { name: string; techStack: string[]; role: string; highlights: string }[];
}

export interface ScoreResult {
  overallScore: number;
  skillMatch: number;
  experienceRelevance: number;
  educationFit: number;
  aiComment: string;
}

export interface AIProvider {
  extractResumeData(text: string): Promise<ExtractedResumeData>;
  scoreResumeAgainstJob(
    resumeData: ExtractedResumeData,
    jobDescription: string,
    requiredSkills: string[],
    bonusSkills: string[],
  ): Promise<ScoreResult>;
  streamExtractResumeData(
    text: string,
    onChunk: (chunk: string) => void,
  ): Promise<ExtractedResumeData>;
}
