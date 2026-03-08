import { create } from 'zustand';

interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartStore {
    items: CartItem[];
    restaurantId: string | null;
    addItem: (item: CartItem, restaurantId: string) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    subtotal: () => number;
    totalItems: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
    items: [],
    restaurantId: null,
    addItem: (item, restaurantId) => {
        const { items } = get();
        const existing = items.find(i => i.menuItemId === item.menuItemId);
        if (existing) {
            set({ items: items.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
            set({ items: [...items, item], restaurantId });
        }
    },
    removeItem: (menuItemId) => set(s => ({ items: s.items.filter(i => i.menuItemId !== menuItemId) })),
    updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) { get().removeItem(menuItemId); return; }
        set(s => ({ items: s.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i) }));
    },
    clearCart: () => set({ items: [], restaurantId: null }),
    subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
