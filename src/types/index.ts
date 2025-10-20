export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

export interface Item {
  id?: string;
  name: string;
  weight: number;
  price: number;
  storage_location: string;
  created: string;
  updated: string;
  expand?: {
    storage_location?: StorageLocation;
  };
}

export interface StockChange {
  id?: string;
  item: string;
  stock_change: number;
  reason: string;
  user: string;
  created: string;
  expand?: {
    item?: Item;
    user?: User;
  };
}

export interface StorageLocation {
  id?: string;
  name: string;
  description?: string;
  created: string;
  updated: string;
}
