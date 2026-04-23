export interface InventoryItem {
  id: string;
  name: string;
  category: 'Card' | 'Paper';
  length: number;
  width: number;
  gsm: number;
  quantity: number;
  unit: 'Pkts' | 'Rims';
  ratePerKg: number;
  lowStockThreshold: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  customerId?: string;
  vendorId?: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  balance: number;
  createdAt: Date;
}

export function calculatePrice(
  length: number,
  width: number,
  gsm: number,
  quantity: number,
  ratePerKg: number,
  unit: 'Pkts' | 'Rims'
): number {
  if (gsm < 200) {
    return (length * width * gsm * quantity) / 15500 * ratePerKg;
  } else {
    return (length * width * gsm * quantity) / 3100 * ratePerKg;
  }
}
