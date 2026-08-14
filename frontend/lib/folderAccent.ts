export interface FolderAccent {
  accent: string;
  soft: string;
}

/** Maps folder hex colors to tab accent + soft background (design system v2). */
export const FOLDER_ACCENT_BY_HEX: Record<string, FolderAccent> = {
  "#315C9A": { accent: "#315C9A", soft: "#EAF0F8" },
  "#B97918": { accent: "#B97918", soft: "#FFF3D8" },
  "#2C7A57": { accent: "#2C7A57", soft: "#EAF7F0" },
  "#6D4BB8": { accent: "#6D4BB8", soft: "#F0EAFF" },
  "#A13B61": { accent: "#A13B61", soft: "#FBEAF0" },
  "#287B82": { accent: "#287B82", soft: "#E6F5F6" },
  "#526071": { accent: "#526071", soft: "#EEF2F6" },
  "#846246": { accent: "#846246", soft: "#F3ECE4" },
};

const PRIVATE_ACCENT: FolderAccent = {
  accent: "#8A1F3D",
  soft: "#FBEAF0",
};

const HIDDEN_ACCENT: FolderAccent = {
  accent: "#D99A2B",
  soft: "#FFF5DA",
};

export function resolveFolderAccent(
  color: string,
  options?: { isPrivate?: boolean; isHidden?: boolean },
): FolderAccent {
  if (options?.isPrivate) return PRIVATE_ACCENT;
  if (options?.isHidden) return HIDDEN_ACCENT;

  const key = color.trim().toUpperCase();
  const mapped = FOLDER_ACCENT_BY_HEX[key];
  if (mapped) return mapped;

  return { accent: color, soft: `${color}22` };
}
