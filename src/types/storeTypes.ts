
export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export const emptyStore: Store = {
  id: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  isActive: true,
  createdAt: new Date().toISOString()
};
