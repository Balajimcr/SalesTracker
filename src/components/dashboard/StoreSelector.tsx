
import React, { useState, useEffect } from 'react';
import { Store } from "@/types/storeTypes";
import { getAllStores, getActiveStore, setActiveStore } from "@/services/storeService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaStore } from "react-icons/fa";
import { toast } from "sonner";

const StoreSelector = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const allStores = getAllStores();
    setStores(allStores);
    setActiveStoreState(getActiveStore());
  };

  const handleStoreChange = (storeId: string) => {
    setActiveStore(storeId);
    loadStores();
    const selectedStore = stores.find(s => s.id === storeId);
    toast.success(`Switched to ${selectedStore?.name}`);
  };

  if (stores.length <= 1) {
    return null; // Don't show selector if only one store
  }

  return (
    <div className="flex items-center gap-2">
      <FaStore className="text-blue-500" />
      <Select value={activeStore?.id || ''} onValueChange={handleStoreChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StoreSelector;
