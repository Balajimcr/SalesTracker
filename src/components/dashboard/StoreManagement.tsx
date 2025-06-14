
import React, { useState, useEffect } from 'react';
import { Store, emptyStore } from "@/types/storeTypes";
import { getAllStores, saveStore, deleteStore, getActiveStore, setActiveStore } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FaStore, FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const StoreManagement = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);
  const [editingStore, setEditingStore] = useState<Store>(emptyStore);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const allStores = getAllStores();
    setStores(allStores);
    setActiveStoreState(getActiveStore());
  };

  const handleSaveStore = () => {
    if (!editingStore.name.trim() || !editingStore.address.trim()) {
      toast.error("Store name and address are required");
      return;
    }

    const storeToSave = {
      ...editingStore,
      id: editingStore.id || `store-${Date.now()}`,
      createdAt: editingStore.createdAt || new Date().toISOString()
    };

    saveStore(storeToSave);
    loadStores();
    setIsDialogOpen(false);
    setEditingStore(emptyStore);
    setIsEditing(false);
    toast.success(`Store ${isEditing ? 'updated' : 'created'} successfully`);
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteStore = (storeId: string) => {
    if (stores.length <= 1) {
      toast.error("Cannot delete the last store");
      return;
    }
    
    deleteStore(storeId);
    loadStores();
    toast.success("Store deleted successfully");
  };

  const handleSetActiveStore = (storeId: string) => {
    setActiveStore(storeId);
    loadStores();
    toast.success("Active store changed");
  };

  const openAddDialog = () => {
    setEditingStore(emptyStore);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FaStore className="text-blue-500" />
              Store Management
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="flex items-center gap-2">
                  <FaPlus />
                  Add Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      value={editingStore.name}
                      onChange={(e) => setEditingStore(prev => ({...prev, name: e.target.value}))}
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeAddress">Address *</Label>
                    <Input
                      id="storeAddress"
                      value={editingStore.address}
                      onChange={(e) => setEditingStore(prev => ({...prev, address: e.target.value}))}
                      placeholder="Enter store address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storePhone">Phone</Label>
                    <Input
                      id="storePhone"
                      value={editingStore.phone || ''}
                      onChange={(e) => setEditingStore(prev => ({...prev, phone: e.target.value}))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={editingStore.email || ''}
                      onChange={(e) => setEditingStore(prev => ({...prev, email: e.target.value}))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveStore}>
                      {isEditing ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(store => (
              <Card key={store.id} className={`relative ${activeStore?.id === store.id ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    {activeStore?.id === store.id && (
                      <Badge className="bg-green-100 text-green-800">
                        <FaCheck className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{store.address}</p>
                  {store.phone && <p className="text-gray-600 text-xs">Phone: {store.phone}</p>}
                  {store.email && <p className="text-gray-600 text-xs">Email: {store.email}</p>}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStore(store)}
                        className="flex items-center gap-1"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </Button>
                      {stores.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStore(store.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                    {activeStore?.id !== store.id && (
                      <Button
                        size="sm"
                        onClick={() => handleSetActiveStore(store.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Set Active
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreManagement;
