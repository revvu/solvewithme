// Re-export Prisma generated types
export type { ProblemNode, Attempt, GeneratedBy, ProblemStatus } from '@prisma/client';

// Content types for JSON fields
export interface ProblemContent {
  text?: string;
  image_url?: string;
}

export interface UserWork {
  image_urls: string[];
}
