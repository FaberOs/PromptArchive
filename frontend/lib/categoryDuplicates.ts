import type { Category } from "@/lib/types";

export type DuplicateKind = "possible" | "typo";

function normalizeCompact(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function sortedWordsKey(name: string): string {
  return name.toLowerCase().split(/\s+/).filter(Boolean).sort().join("");
}

export function getCategoryDuplicateKind(
  categories: Pick<Category, "id" | "name">[],
  name: string,
  selfId?: number,
): DuplicateKind | null {
  const compact = normalizeCompact(name);
  const wordsKey = sortedWordsKey(name);

  for (const category of categories) {
    if (selfId !== undefined && category.id === selfId) continue;
    if (category.name === name) continue;

    const otherCompact = normalizeCompact(category.name);
    const otherWords = sortedWordsKey(category.name);

    if (compact === otherCompact && compact.length > 0) {
      return "typo";
    }

    if (wordsKey === otherWords && wordsKey.length > 0) {
      return "possible";
    }
  }

  return null;
}

export function countDuplicateGroups(categories: Pick<Category, "id" | "name">[]): number {
  const flagged = new Set<number>();

  for (const category of categories) {
    const kind = getCategoryDuplicateKind(categories, category.name, category.id);
    if (kind) flagged.add(category.id);
  }

  return flagged.size;
}

export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function countStaleCategories(
  categories: Array<{
    created_at?: string;
    updated_at?: string | null;
  }>,
  days = 30,
): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return categories.filter((category) => {
    const ref = category.updated_at ?? category.created_at;
    if (!ref) return false;
    return new Date(ref).getTime() < cutoff;
  }).length;
}
