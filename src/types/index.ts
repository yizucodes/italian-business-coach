export enum ConversationStatus {
  ACTIVE = "active",
  ENDED = "ended",
  ERROR = "error",
}

export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: ConversationStatus;
  conversation_url: string;
  created_at: string;
};

export type CoachingEvent = {
  id: string;
  issueType: string;
  explanation: string;
  timestamp: number;
};

export type SummaryScore = {
  category: string;
  score: number;
  evidence: string;
};

export interface ScoreCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
}

export interface ScoreResult {
  category: ScoreCategory;
  score: number;
  evidence: string;
}
