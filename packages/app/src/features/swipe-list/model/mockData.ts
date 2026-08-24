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

// Tri-state avatars by modulo (50% valid / 30% missing / 20% broken) so every
// Avatar rendering path is exercised in the stock 1000-item list.
const BROKEN_AVATAR_HOST = "https://invalid-avatars.example.com";

export function createMockItems(count: number): MessageItem[] {
  const items: MessageItem[] = [];
  for (let n = 0; n < count; n++) {
    const slot = n % 10;
    const avatarUrl =
      slot < 5
        ? `https://i.pravatar.cc/150?u=item-${n}`
        : slot < 8
          ? undefined
          : `${BROKEN_AVATAR_HOST}/item-${n}.png`;
    items.push({
      id: `item-${n}`,
      name: NAMES[n % NAMES.length],
      text: TEXTS[n % TEXTS.length],
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });
  }
  return items;
}
