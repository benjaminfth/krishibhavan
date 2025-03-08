import { create } from 'zustand';
import type { CartItem, Product, Office } from '../types';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Import the auth store

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, office: Office) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: async (product, quantity, office) => {
    const { user } = useAuthStore.getState(); // Get the user from the auth store
    const userId = user.id;

    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      
      return {
        items: [...state.items, { product, quantity, office }]
      };
    });

    await axios.post('http://localhost:5000/cart', {
      user_id: userId,
      product_id: product.id,
      quantity
    });
  },
  removeItem: async (productId) => {
    const { user } = useAuthStore.getState(); // Get the user from the auth store
    const userId = user.id;

    set((state) => ({
      items: state.items.filter(item => item.product.id !== productId)
    }));

    await axios.delete('http://localhost:5000/cart', {
      data: {
        user_id: userId,
        product_id: productId
      }
    });
  },
  updateQuantity: async (productId, quantity) => {
    const { user } = useAuthStore.getState(); // Get the user from the auth store
    const userId = user.id;

    set((state) => ({
      items: state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
          : item
      )
    }));

    await axios.put('http://localhost:5000/cart', {
      user_id: userId,
      product_id: productId,
      quantity
    });
  },
  clearCart: async () => {
    const { user } = useAuthStore.getState(); // Get the user from the auth store
    const userId = user.id;

    set({ items: [] });

    await axios.delete('http://localhost:5000/cart/clear', {
      data: { user_id: userId }
    });
  }
}));