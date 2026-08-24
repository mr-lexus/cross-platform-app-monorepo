const LETTER = /[A-Za-z]/;
const WHITESPACE = /\s+/;
const FALLBACK = '?';

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return FALLBACK;
  }
  const words = trimmed.split(WHITESPACE);
  const initials: string[] = [];
  for (const word of words) {
    if (initials.length >= 2) {
      break;
    }
    const letter = word.match(LETTER);
    if (letter) {
      initials.push(letter[0].toUpperCase());
    }
  }
  return initials.length > 0 ? initials.join('') : FALLBACK;
}
