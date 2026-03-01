import axios from 'axios';
import { API_BASE_URL } from './constants';
import type {
  Prompt,
  Folder,
  FolderCreatePayload,
  FolderUpdatePayload,
  OkResponse,
  BulkHidePayload,
  BulkDeletePayload,
  BulkMovePayload,
} from './types';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getPromptVariants = (id: number) =>
  api.get<Prompt[]>(`/prompts/${id}/variants`);

export const getFolders = (is_nsfw: boolean = false, show_hidden: boolean = false) =>
  api.get<Folder[]>(`/folders/?is_nsfw=${is_nsfw}&show_hidden=${show_hidden}`);

export const createFolder = (data: FolderCreatePayload) =>
  api.post<Folder>('/folders/', data);

export const updateFolder = (id: number, data: FolderUpdatePayload) =>
  api.put<Folder>(`/folders/${id}`, data);

export const deleteFolder = (id: number) =>
  api.delete<OkResponse>(`/folders/${id}`);

// --- Bulk Operations ---

export const bulkHide = (data: BulkHidePayload) =>
  api.post<OkResponse>('/bulk/hide', data);

export const bulkDelete = (data: BulkDeletePayload) =>
  api.post<OkResponse>('/bulk/delete', data);

export const bulkMove = (data: BulkMovePayload) =>
  api.post<OkResponse>('/bulk/move', data);

export default api;
