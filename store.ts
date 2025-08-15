import { create } from "zustand";
import { createCart, addItemToCart, getCart, updateLine, removeLine, type Cart } from "@/api";

type State = {
  cartId?: string;
  cart?: Cart;
  loading: boolean;
  error?: string;
};
type Actions = {
  ensureCart: () => Promise<void>;
  addItem: (itemId: string, options?: { id: string; name: string; price?: number }[]) => Promise<void>;
  changeQty: (lineId: string, qty: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
};

export const useCart = create<State & Actions>((set, get) => ({
  cartId: undefined,
  cart: undefined,
  loading: false,
  error: undefined,

  ensureCart: async () => {
    if (get().cartId) return;
    set({ loading: true, error: undefined });
    try {
      const c = await createCart();
      set({ cartId: c.id, cart: c });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (itemId, options) => {
    await get().ensureCart();
    const id = get().cartId!;
    set({ loading: true, error: undefined });
    try {
      const cart = await addItemToCart(id, { itemId, qty: 1, options });
      set({ cart });
    } finally {
      set({ loading: false });
    }
  },

  changeQty: async (lineId, qty) => {
    const id = get().cartId!;
    set({ loading: true, error: undefined });
    const cart = await updateLine(id, lineId, { qty });
    set({ cart, loading: false });
  },

  removeLine: async (lineId) => {
    const id = get().cartId!;
    set({ loading: true, error: undefined });
    await removeLine(id, lineId);
    const cart = await getCart(id);
    set({ cart, loading: false });
  },

  refresh: async () => {
    if (!get().cartId) return;
    set({ loading: true });
    const cart = await getCart(get().cartId!);
    set({ cart, loading: false });
  },

  clearLocal: () => set({ cartId: undefined, cart: undefined })
}));
