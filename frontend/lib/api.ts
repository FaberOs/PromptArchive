import axios, { type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";
import { clearPrivateSessionToken, getPrivateSessionToken } from "./security-session";
import type {
  Prompt,
  Folder,
  Category,
  FolderCreatePayload,
  FolderUpdatePayload,
  OkResponse,
  BulkHidePayload,
  BulkDeletePayload,
  BulkMovePayload,
} from "./types";

export type PromptArchiveSessionPolicy = "private" | "public";

declare module "axios" {
  interface AxiosRequestConfig {
    promptArchiveSessionPolicy?: PromptArchiveSessionPolicy;
  }
}

export const publicSessionRequest = {
  promptArchiveSessionPolicy: "public",
} as const satisfies Pick<AxiosRequestConfig, "promptArchiveSessionPolicy">;

export const privateSessionRequest = {
  promptArchiveSessionPolicy: "private",
} as const satisfies Pick<AxiosRequestConfig, "promptArchiveSessionPolicy">;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getPrivateSessionToken();
  if (token && config.promptArchiveSessionPolicy !== "public") {
    config.headers.set("X-Prompt-Archive-Session", token);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.promptArchiveSessionPolicy === "private"
    ) {
      clearPrivateSessionToken();
    }
    return Promise.reject(error);
  },
);

export const getPromptVariants = (id: number, showHidden: boolean = false) =>
  api.get<Prompt[]>(`/prompts/${id}/variants`, {
    params: { show_hidden: showHidden },
    ...(showHidden ? privateSessionRequest : publicSessionRequest),
  });

export const getFolders = (is_nsfw: boolean = false, show_hidden: boolean = false) =>
  api.get<Folder[]>("/folders/", {
    params: { is_nsfw, show_hidden },
    ...(is_nsfw || show_hidden ? privateSessionRequest : publicSessionRequest),
  });

export const getCategories = (is_nsfw: boolean = false, show_hidden: boolean = false) =>
  api.get<Category[]>("/categories/", {
    params: { nsfw: is_nsfw, show_hidden },
    ...(is_nsfw || show_hidden ? privateSessionRequest : publicSessionRequest),
  });

export const createFolder = (data: FolderCreatePayload) =>
  api.post<Folder>("/folders/", data, {
    ...(data.is_nsfw ? privateSessionRequest : publicSessionRequest),
  });

export const updateFolder = (id: number, data: FolderUpdatePayload) =>
  api.put<Folder>(`/folders/${id}`, data, privateSessionRequest);

export const deleteFolder = (id: number) => api.delete<OkResponse>(`/folders/${id}`, privateSessionRequest);

export async function revokePrivateSession(): Promise<void> {
  const token = getPrivateSessionToken();
  clearPrivateSessionToken();
  if (!token) return;

  await api.delete<OkResponse>("/settings/session", {
    ...publicSessionRequest,
    headers: { "X-Prompt-Archive-Session": token },
  });
}

// --- Bulk Operations ---

export const bulkHide = (data: BulkHidePayload) => api.post<OkResponse>("/bulk/hide", data, privateSessionRequest);

export const bulkDelete = (data: BulkDeletePayload) =>
  api.post<OkResponse>("/bulk/delete", data, privateSessionRequest);

export const bulkMove = (data: BulkMovePayload) => api.post<OkResponse>("/bulk/move", data, privateSessionRequest);

export default api;
