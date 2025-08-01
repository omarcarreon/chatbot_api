// Message roles
export type MessageRole = 'user' | 'bot';

// Conversation topic and stance
export interface ConversationTopic {
  topic: string;
  stance: string;
}

// Individual conversation message
export interface ConversationMessage {
  role: MessageRole;
  message: string;
}

// Conversation history
export type ConversationHistory = ConversationMessage[];

// Cache configuration
export interface CacheConfig {
  redisUrl?: string;
  ttl?: number;
  topicKeyPrefix?: string;
  historyKeyPrefix?: string;
}

// Cache operation result
export interface CacheResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// API request/response types
export interface DebateRequest {
  conversation_id?: string;
  message: string;
}

export interface DebateResponse {
  conversation_id: string;
  message: ConversationHistory;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  example?: string;
  format?: string;
  topic?: string;
  stance?: string;
}

// Bot service types
export interface ConversationContext {
  topic: string;
  stance: string;
}

export interface AIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Environment variables
export interface Environment {
  REDIS_URL?: string;
  HF_API_TOKEN?: string;
  PORT?: string;
  NODE_ENV?: string;
}
