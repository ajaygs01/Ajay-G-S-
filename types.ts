
export interface SkillVerification {
  skillName: string;
  confidenceScore: number; // 0 to 100
  status: 'Verified' | 'Needs Review' | 'Likely Exaggerated';
  reasoning: string;
}

export interface CertificationDetail {
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  description: string;
  score?: number;
  zkProof?: string;
  nftId?: string; // Added NFT ID for lookup
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
  skills?: SkillVerification[];
}

export interface SocialIntegrity {
  githubMatch: 'Verified' | 'Mismatch' | 'Not Provided';
  linkedinMatch: 'Verified' | 'Mismatch' | 'Not Provided';
  analysis: string;
}

export interface AnalysisResult {
  candidateName: string;
  overallAuthenticityScore: number;
  isDocumentAuthentic: boolean; // True if the document appears real
  documentForgeryAnalysis: string; // Explanation of visual inspection
  skills: SkillVerification[];
  certifications: CertificationDetail[]; // New: Detailed info about the uploaded cert
  socialIntegrity?: SocialIntegrity;
  summary: string;
}

export enum ViewState {
  HOME = 'HOME',
  CANDIDATE = 'CANDIDATE',
  EMPLOYER = 'EMPLOYER',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  name: string;
  email: string;
  role: 'candidate' | 'employer';
}

export interface PortalState {
  resumeText: string;
  githubUrl: string;
  linkedinUrl: string;
  selectedFile: { file: File, preview: string | null } | null;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  useZkPrivacy: boolean;
  isGeneratingProof: boolean;
}
