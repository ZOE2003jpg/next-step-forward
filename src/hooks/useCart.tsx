import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

interface CartCtx {
  cart: CartItem[];
  restaurantId: string | null;
  addItem: (item: Tables<"menu_items">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setRestaurantId: (id: string | null) => void;
  total: number;
  totalQty: number;
}

const CartContext = createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem = useCallback((item: Tables<"menu_items">) => {
    setCart((p) => {
      const ex = p.find((c) => c.id === item.id);
      if (ex) return p.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...p, { id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((p) => p.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const totalQty = cart.reduce((a, c) => a + c.qty, 0);

  return (
    <CartContext.Provider value={{ cart, restaurantId, addItem, removeItem, clearCart, setRestaurantId, total, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
