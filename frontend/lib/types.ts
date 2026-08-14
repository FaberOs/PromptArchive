// --- Shared Types for the Frontend ---

// Mirrors backend schemas.py

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string | null;
  prompt_count: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Folder {
  id: number;
  name: string;
  color: string;
  is_nsfw: boolean;
  is_hidden: boolean;
  created_at: string;
  preview_images: string[];
  prompt_count: number;
}

export interface PromptImage {
  id: number;
  filename: string;
  note?: string;
  created_at: string;
  url: string;
}

export interface PositivePrompt {
  id: number;
  content: string;
  order_index: number;
}

export type PromptType = "structured" | "json";

export interface Prompt {
  id: number;
  title: string;
  description: string | null;
  negative_prompt: string;
  meta_json: Record<string, unknown> | null;
  is_nsfw: boolean;
  is_hidden: boolean;
  prompt_type: PromptType;
  created_at: string;
  updated_at: string | null;
  parent_id: number | null;
  folder_id: number | null;
  folder: Folder | null;
  positive_prompts: PositivePrompt[];
  categories: Category[];
  tags: Tag[];
  images: PromptImage[];
  variant_count: number;
}

// --- Request Payloads ---

export interface FolderCreatePayload {
  name: string;
  color: string;
  is_nsfw: boolean;
}

export interface FolderUpdatePayload {
  name: string;
  color: string;
  is_nsfw: boolean;
}

export interface PromptCreatePayload {
  title: string;
  description?: string;
  negative_prompt?: string;
  positive_prompts: string[];
  categories: string[];
  tags: string[];
  is_nsfw: boolean;
  is_hidden?: boolean;
  prompt_type: PromptType;
  parent_id?: number;
  folder_id?: number | null;
}

export interface PromptUpdatePayload {
  title: string;
  description?: string;
  negative_prompt?: string;
  positive_prompts: string[];
  categories: string[];
  tags: string[];
  prompt_type: PromptType;
  folder_id?: number | null;
  is_nsfw?: boolean;
  is_hidden?: boolean;
  meta_json?: Record<string, unknown> | null;
}

export interface PinRequest {
  pin: string;
}

export interface PinStatusResponse {
  is_set: boolean;
}

export interface PinVerifyResponse {
  ok: boolean;
  session_token: string;
}

export interface OkResponse {
  ok: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// --- Bulk Actions ---

export interface BulkHidePayload {
  prompt_ids: number[];
  folder_ids: number[];
  hidden: boolean;
}

export interface BulkDeletePayload {
  prompt_ids: number[];
  folder_ids: number[];
}

export interface BulkMovePayload {
  prompt_ids: number[];
  folder_id: number | null;
}
