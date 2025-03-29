'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define the menu item type
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  image_url?: string;
  food_truck_id: string;
};

// Define the cart item type (menu item with quantity)
export type CartItem = MenuItem & {
  quantity: number;
  notes?: string;
};

// Define the cart context type
type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isUpdating: boolean;
  error: string | null;
};

// Create the cart context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  updateItemNotes: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isUpdating: false,
  error: null,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize cart state from localStorage if available
  const [items, setItems] = useState<CartItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setError('Failed to load your saved cart. Starting with an empty cart.');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  const persistCart = useCallback(async (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      setError(null);
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
      setError('Failed to save your cart changes. Please try again.');
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    persistCart(items);
  }, [items, persistCart]);
  
  // Calculate total items in cart
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Add an item to the cart with optimistic update
  const addItem = (item: MenuItem) => {
    setIsUpdating(true);
    
    // Optimistic update - change the UI immediately
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const existingItemIndex = newItems.findIndex((cartItem) => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
      } else {
        newItems.push({ ...item, quantity: 1 });
      }
      
      return newItems;
    });
    
    // After state update
    setIsUpdating(false);
  };
  
  // Remove an item from the cart with optimistic update
  const removeItem = (itemId: string) => {
    setIsUpdating(true);
    
    // Optimistic update - remove item immediately
    const itemToRemove = items.find(item => item.id === itemId);
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    // Complete the update
    setIsUpdating(false);
  };
  
  // Update quantity of an item with optimistic update
  const updateQuantity = (itemId: string, quantity: number) => {
    setIsUpdating(true);
    
    if (quantity <= 0) {
      // Handle removal through removeItem for consistency
      removeItem(itemId);
      return;
    }
    
    // Optimistic update - change quantity immediately
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
    
    // Complete the update
    setIsUpdating(false);
  };
  
  // Update notes for an item with optimistic update
  const updateItemNotes = (itemId: string, notes: string) => {
    setIsUpdating(true);
    
    // Optimistic update - change notes immediately
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    );
    
    // Complete the update
    setIsUpdating(false);
  };
  
  // Clear the cart
  const clearCart = () => {
    setIsUpdating(true);
    setItems([]);
    setIsUpdating(false);
  };
  
  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateItemNotes,
      clearCart,
      totalItems,
      totalPrice,
      isUpdating,
      error,
    }}>
      {children}
    </CartContext.Provider>
  );
} 