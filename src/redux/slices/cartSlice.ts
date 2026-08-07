import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size?: string;
  imageUrl?: string;
  stock: number;
  deliveryCharge?: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('urban_style_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

const calculateTotal = (items: CartItem[]): number => {
  return parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
};

const initialState: CartState = {
  items: getInitialCart(),
  totalAmount: calculateTotal(getInitialCart()),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { productId, color, size, quantity } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.productId === productId && item.color === color && (item.size || '') === (size || '')
      );

      if (existingIndex > -1) {
        // If items exist, check stock limits
        const newQty = state.items[existingIndex].quantity + quantity;
        state.items[existingIndex].quantity = Math.min(newQty, action.payload.stock);
        if (action.payload.deliveryCharge !== undefined) {
          state.items[existingIndex].deliveryCharge = Number(action.payload.deliveryCharge);
        }
      } else {
        state.items.push({
          ...action.payload,
          price: Number(action.payload.price),
          deliveryCharge: Number(action.payload.deliveryCharge || 0),
        });
      }

      state.totalAmount = calculateTotal(state.items);
      if (typeof window !== 'undefined') {
        localStorage.setItem('urban_style_cart', JSON.stringify(state.items));
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; color: string; size?: string; quantity: number }>
    ) => {
      const { productId, color, size, quantity } = action.payload;
      const index = state.items.findIndex(
        (item) => item.productId === productId && item.color === color && (item.size || '') === (size || '')
      );

      if (index > -1) {
        const item = state.items[index];
        state.items[index].quantity = Math.max(1, Math.min(quantity, item.stock));
      }

      state.totalAmount = calculateTotal(state.items);
      if (typeof window !== 'undefined') {
        localStorage.setItem('urban_style_cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; color: string; size?: string }>
    ) => {
      const { productId, color, size } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === productId && item.color === color && (item.size || '') === (size || ''))
      );

      state.totalAmount = calculateTotal(state.items);
      if (typeof window !== 'undefined') {
        localStorage.setItem('urban_style_cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('urban_style_cart');
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
