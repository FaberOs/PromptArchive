export type PromptTypeFilter = "all" | "standard" | "json" | "hidden" | "favorites";

export type PromptSort = "newest" | "oldest" | "title_asc" | "title_desc";

interface LibraryQueryOptions {
  isNsfw: boolean;
  showHidden: boolean;
  promptFilter: PromptTypeFilter;
  promptSort: PromptSort;
  normalizedSearch: string;
  folderId: number | null;
}

export function buildLibraryQueryParams({
  isNsfw,
  showHidden,
  promptFilter,
  promptSort,
  normalizedSearch,
  folderId,
}: LibraryQueryOptions): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    nsfw: isNsfw,
    limit: 20,
    show_hidden: showHidden,
    sort: promptSort,
  };
  if (promptFilter === "standard") params.prompt_type = "structured";
  if (promptFilter === "json") params.prompt_type = "json";
  if (promptFilter === "favorites") params.tag = "favorite";
  if (promptFilter === "hidden") {
    params.only_hidden = true;
    params.show_hidden = true;
  }
  if (normalizedSearch) params.search = normalizedSearch;
  else params.folder_id = folderId ?? 0;
  return params;
}
