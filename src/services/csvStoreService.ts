import { Store } from "@/types/storeTypes";

const ACTIVE_STORE_KEY = 'active_store_id';

// CSV-based store management with file download/upload
export class CSVStoreService {
  private stores: Store[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load stores from localStorage (fallback)
  private loadFromLocalStorage(): void {
    const storesJSON = localStorage.getItem('stores_data');
    this.stores = storesJSON ? JSON.parse(storesJSON) : [];
  }

  // Get all stores
  getAllStores(): Store[] {
    return this.stores;
  }

  // Save store and export to CSV
  saveStore(store: Store): void {
    const existingIndex = this.stores.findIndex(s => s.id === store.id);
    
    if (existingIndex >= 0) {
      this.stores[existingIndex] = store;
    } else {
      this.stores.push(store);
    }
    
    // Save to localStorage (fallback)
    localStorage.setItem('stores_data', JSON.stringify(this.stores));
    
    // Export stores to CSV for GitHub sync
    this.exportStoresToCSV();
  }

  // Delete store
  deleteStore(storeId: string): void {
    this.stores = this.stores.filter(s => s.id !== storeId);
    localStorage.setItem('stores_data', JSON.stringify(this.stores));
    
    // If deleting active store, clear active store
    if (this.getActiveStoreId() === storeId) {
      this.clearActiveStore();
    }
    
    // Export updated stores to CSV
    this.exportStoresToCSV();
  }

  // Get active store ID
  getActiveStoreId(): string | null {
    return localStorage.getItem(ACTIVE_STORE_KEY);
  }

  // Set active store
  setActiveStore(storeId: string): void {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
  }

  // Clear active store
  clearActiveStore(): void {
    localStorage.removeItem(ACTIVE_STORE_KEY);
  }

  // Get active store object
  getActiveStore(): Store | null {
    const activeStoreId = this.getActiveStoreId();
    if (!activeStoreId) return null;
    
    return this.stores.find(s => s.id === activeStoreId) || null;
  }

  // Initialize default store if none exists
  initializeDefaultStore(): void {
    if (this.stores.length === 0) {
      const defaultStore: Store = {
        id: 'default-store',
        name: 'Main Store',
        address: 'Default Address',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      this.saveStore(defaultStore);
      this.setActiveStore(defaultStore.id);
    }
  }

  // Export stores to CSV for GitHub sync
  private exportStoresToCSV(): void {
    const headers = ['id', 'name', 'address', 'phone', 'email', 'isActive', 'createdAt'];
    const rows = this.stores.map(store => [
      store.id,
      `"${store.name}"`,
      `"${store.address}"`,
      store.phone || '',
      store.email || '',
      store.isActive,
      store.createdAt
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCSV(csvContent, 'stores.csv');
  }

  // Download CSV helper
  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import stores from CSV
  importStoresFromCSV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const dataRows = lines.slice(1);
          
          const importedStores: Store[] = dataRows
            .filter(row => row.trim() !== '')
            .map(row => {
              const [id, name, address, phone, email, isActive, createdAt] = row.split(',');
              return {
                id: id.trim(),
                name: name.replace(/"/g, '').trim(),
                address: address.replace(/"/g, '').trim(),
                phone: phone?.trim() || undefined,
                email: email?.trim() || undefined,
                isActive: isActive.toLowerCase() === 'true',
                createdAt: createdAt.trim()
              };
            });
          
          // Replace existing stores with imported ones
          this.stores = importedStores;
          localStorage.setItem('stores_data', JSON.stringify(this.stores));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}

// Export singleton instance
export const csvStoreService = new CSVStoreService();

// Compatibility exports for existing code
export const getAllStores = () => csvStoreService.getAllStores();
export const saveStore = (store: Store) => csvStoreService.saveStore(store);
export const deleteStore = (storeId: string) => csvStoreService.deleteStore(storeId);
export const getActiveStoreId = () => csvStoreService.getActiveStoreId();
export const setActiveStore = (storeId: string) => csvStoreService.setActiveStore(storeId);
export const clearActiveStore = () => csvStoreService.clearActiveStore();
export const getActiveStore = () => csvStoreService.getActiveStore();
export const initializeDefaultStore = () => csvStoreService.initializeDefaultStore();