export const AVATAR_PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#06b6d4',
] as const;

export type AvatarColor = (typeof AVATAR_PALETTE)[number];

const DEFAULT_COLOR: AvatarColor = AVATAR_PALETTE[0];

function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

export function getAvatarColor(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return DEFAULT_COLOR;
  }
  return AVATAR_PALETTE[djb2(trimmed) % AVATAR_PALETTE.length];
}
