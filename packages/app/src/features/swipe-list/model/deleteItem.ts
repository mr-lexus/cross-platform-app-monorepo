import type { MessageItem } from "./types";

/**
 * Removes the item with the given id. Pure: survivors keep their object
 * identity (so memoized rows skip re-render), unknown ids are a no-op, and
 * the operation is idempotent.
 */
export function deleteItem(items: MessageItem[], id: string): MessageItem[] {
  return items.filter((item) => item.id !== id);
}
