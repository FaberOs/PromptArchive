import type { CategoryItem } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/Badge";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { formatRelativeDate, getCategoryDuplicateKind } from "@/lib/categoryDuplicates";

interface CategoryTableProps {
  categories: CategoryItem[];
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: number) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-hidden rounded-pa-xl border border-pa-border bg-pa-paper shadow-pa-subtle">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-pa-text">
          <thead className="bg-pa-surface text-[11px] font-semibold uppercase tracking-wide text-pa-muted">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-center">Prompts</th>
              <th className="hidden px-4 py-3 md:table-cell">Description</th>
              <th className="hidden px-4 py-3 lg:table-cell">Last used</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pa-border">
            {categories.map((category) => {
              const isEmpty = category.prompt_count === 0;
              const duplicateKind = getCategoryDuplicateKind(categories, category.name, category.id);

              return (
                <tr key={category.id} className="transition-colors hover:bg-pa-surface/60">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{category.name}</span>
                      {duplicateKind && (
                        <Badge variant="hidden" size="sm" className="w-fit">
                          {duplicateKind === "typo" ? "Typo duplicate" : "Possible duplicate"}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-pa-muted">{category.prompt_count}</td>
                  <td className="hidden max-w-[220px] truncate px-4 py-3 text-pa-muted md:table-cell">
                    {category.description || "—"}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-pa-muted lg:table-cell">
                    {formatRelativeDate(category.updated_at ?? category.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {isEmpty ? (
                      <Badge variant="hidden" size="sm">
                        Empty
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-pa-muted">
                        <span className="h-2 w-2 rounded-full bg-pa-success" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          className="rounded-pa-sm p-1 text-pa-muted hover:bg-pa-surface hover:text-pa-text"
                          aria-label={`Actions for ${category.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="z-50 w-36 rounded-pa-lg border border-pa-border bg-pa-paper p-1 shadow-pa-float"
                          align="end"
                          sideOffset={4}
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => onEdit(category)}
                              className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-2.5 py-2 text-left text-sm text-pa-muted transition-colors hover:bg-pa-surface hover:text-pa-text"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(category.id)}
                              className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-2.5 py-2 text-left text-sm text-pa-danger transition-colors hover:bg-pa-danger-soft"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
