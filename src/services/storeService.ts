
import { Store } from "@/types/storeTypes";

const STORES_STORAGE_KEY = 'stores_data';
const ACTIVE_STORE_KEY = 'active_store_id';

// Get all stores
export const getAllStores = (): Store[] => {
  const storesJSON = localStorage.getItem(STORES_STORAGE_KEY);
  return storesJSON ? JSON.parse(storesJSON) : [];
};

// Save a new store
export const saveStore = (store: Store): void => {
  const stores = getAllStores();
  const existingIndex = stores.findIndex(s => s.id === store.id);
  
  if (existingIndex >= 0) {
    stores[existingIndex] = store;
  } else {
    stores.push(store);
  }
  
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
};

// Delete a store
export const deleteStore = (storeId: string): void => {
  const stores = getAllStores().filter(s => s.id !== storeId);
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  
  // If deleting active store, clear active store
  if (getActiveStoreId() === storeId) {
    clearActiveStore();
  }
};

// Get active store ID
export const getActiveStoreId = (): string | null => {
  return localStorage.getItem(ACTIVE_STORE_KEY);
};

// Set active store
export const setActiveStore = (storeId: string): void => {
  localStorage.setItem(ACTIVE_STORE_KEY, storeId);
};

// Clear active store
export const clearActiveStore = (): void => {
  localStorage.removeItem(ACTIVE_STORE_KEY);
};

// Get active store object
export const getActiveStore = (): Store | null => {
  const activeStoreId = getActiveStoreId();
  if (!activeStoreId) return null;
  
  const stores = getAllStores();
  return stores.find(s => s.id === activeStoreId) || null;
};

// Initialize default store if none exists
export const initializeDefaultStore = (): void => {
  const stores = getAllStores();
  if (stores.length === 0) {
    const defaultStore: Store = {
      id: 'default-store',
      name: 'Main Store',
      address: 'Default Address',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    saveStore(defaultStore);
    setActiveStore(defaultStore.id);
  }
};
