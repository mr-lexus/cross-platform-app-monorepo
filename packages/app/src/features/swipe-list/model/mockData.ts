import type { MessageItem } from "./types";

// Fixed content pools — mock data is a pure function of the item index so the
// list is deterministic across reloads, resets and snapshot diffs.
const NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Davis",
  "Diana Prince",
  "Ethan Hunt",
  "Fiona Gallagher",
  "George Miller",
  "Hannah Lee",
  "Ivan Petrov",
  "Julia Chen",
  "Kwame Mensah",
  "Lena Fischer",
];

const TEXTS = [
  "Hey, are we still on for tomorrow?",
  "Attached the final design files.",
  "Can you review my PR when you have a sec?",
  "Lunch is here! Come down.",
  "Mission accomplished.",
  "Don't forget to pay the utility bill.",
  "Mad Max screening this weekend?",
  "See you at the team offsite next week.",
  "Pushed the hotfix to staging.",
  "Thanks for the help yesterday!",
  "The client approved the proposal.",
  "Call me when you are free.",
];

// Bi-state avatars by modulo (80% valid / 20% missing) so both Avatar
// rendering paths stay exercised in the stock 1000-item list; the broken-image
// fallback path is covered by Avatar unit tests rather than live unresolvable
// URLs, keeping DevTools free of deliberate DNS errors.

export function createMockItems(count: number): MessageItem[] {
  const items: MessageItem[] = [];
  for (let n = 0; n < count; n++) {
    const slot = n % 20;
    const avatarUrl =
      slot < 16 ? `https://i.pravatar.cc/150?u=item-${n}` : undefined;
    items.push({
      id: `item-${n}`,
      name: NAMES[n % NAMES.length],
      text: TEXTS[n % TEXTS.length],
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });
  }
  return items;
}
