import { create } from "zustand";

import { deleteItem } from "./deleteItem";
import { createMockItems } from "./mockData";
import type { MessageItem } from "./types";

const ITEM_COUNT = 1000;

type SwipeListState = {
  items: MessageItem[];
  removeItem: (id: string) => void;
  reset: () => void;
};

/**
 * Durable application state for the swipe-list feature. Transient
 * gesture/animation state stays in Reanimated SharedValues (see
 * SwipeableRow) — only the message collection lives here.
 *
 * Delegation, not duplication: removal reuses the pure identity-preserving
 * `deleteItem` filter and both initial and reset state reuse the
 * deterministic `createMockItems` dataset.
 */
export const useSwipeListStore = create<SwipeListState>()((set) => ({
  items: createMockItems(ITEM_COUNT),
  removeItem: (id) => set((state) => ({ items: deleteItem(state.items, id) })),
  reset: () => set({ items: createMockItems(ITEM_COUNT) }),
}));
